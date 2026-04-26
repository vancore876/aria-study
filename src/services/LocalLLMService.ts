/**
 * LocalLLMService
 * 
 * Downloads and runs Phi-3 Mini 4K Instruct (Q4_K_M quantized) fully on-device.
 * Model: ~2.2GB GGUF — runs on any Android with 4GB+ RAM
 * 
 * Uses llama.rn (https://github.com/mybigday/llama.rn)
 * which wraps llama.cpp — the gold standard for on-device LLM inference.
 * 
 * Fallback chain: Groq (online) → Phi-3 Local → Pattern Matching
 */

import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';

// ─── Model options (user picks one) ─────────────────────────────────────────
export const LOCAL_MODELS = [
  {
    id: 'phi3-mini-q4',
    name: 'Phi-3 Mini 4K',
    description: 'Microsoft - Best quality/size ratio. Great for homework, CXC practice, and college study.',
    size: '2.2 GB',
    sizeBytes: 2_200_000_000,
    ram: '4 GB RAM required',
    url: 'https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf',
    filename: 'phi3-mini-q4.gguf',
    recommended: true,
    contextLength: 4096,
    stopTokens: ['<|end|>', '<|user|>', '<|assistant|>'],
    promptTemplate: (system: string, history: {role:string;content:string}[]) => {
      let prompt = `<|system|>\n${system}<|end|>\n`;
      for (const msg of history) {
        const role = msg.role === 'user' ? 'user' : 'assistant';
        prompt += `<|${role}|>\n${msg.content}<|end|>\n`;
      }
      prompt += `<|assistant|>\n`;
      return prompt;
    },
  },
  {
    id: 'gemma2-2b-q4',
    name: 'Gemma 2B IT',
    description: 'Google — Smaller & faster. Good for quick answers on low-RAM devices.',
    size: '1.5 GB',
    sizeBytes: 1_500_000_000,
    ram: '3 GB RAM required',
    url: 'https://huggingface.co/google/gemma-2b-it-GGUF/resolve/main/gemma-2b-it.Q4_K_M.gguf',
    filename: 'gemma2-2b-q4.gguf',
    recommended: false,
    contextLength: 2048,
    stopTokens: ['<end_of_turn>', '<start_of_turn>'],
    promptTemplate: (system: string, history: {role:string;content:string}[]) => {
      let prompt = `<start_of_turn>user\n${system}\n\n`;
      for (const msg of history.slice(-6)) {
        if (msg.role === 'user') prompt += `${msg.content}<end_of_turn>\n<start_of_turn>model\n`;
        else prompt += `${msg.content}<end_of_turn>\n<start_of_turn>user\n`;
      }
      return prompt;
    },
  },
  {
    id: 'tinyllama-q4',
    name: 'TinyLlama 1.1B',
    description: 'Smallest option — 600MB. Works on all devices but less accurate.',
    size: '0.6 GB',
    sizeBytes: 600_000_000,
    ram: '2 GB RAM required',
    url: 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf',
    filename: 'tinyllama-q4.gguf',
    recommended: false,
    contextLength: 2048,
    stopTokens: ['</s>', '[INST]'],
    promptTemplate: (system: string, history: {role:string;content:string}[]) => {
      let prompt = `<|system|>\n${system}</s>\n`;
      for (const msg of history.slice(-6)) {
        if (msg.role === 'user') prompt += `<|user|>\n${msg.content}</s>\n<|assistant|>\n`;
        else prompt += `${msg.content}</s>\n`;
      }
      return prompt;
    },
  },
];

export type DownloadProgress = {
  modelId: string;
  bytesWritten: number;
  totalBytes: number;
  percent: number;
  status: 'idle' | 'downloading' | 'completed' | 'error' | 'verifying';
  error?: string;
};

export type ModelStatus = {
  modelId: string;
  isDownloaded: boolean;
  isLoaded: boolean;
  filePath?: string;
  fileSizeBytes?: number;
};

// ─── State ────────────────────────────────────────────────────────────────
let llamaContext: any = null;
let loadedModelId: string | null = null;
let downloadTask: any = null;
let localInferenceDisabledReason: string | null = null;

const MODEL_DIR = `${FileSystem.documentDirectory}aria_models/`;
const ACTIVE_MODEL_KEY = 'aria_active_model_id';

export class LocalLLMService {

  static isRuntimeSupported(): boolean {
    const constants = NativeModules?.ExponentConstants || NativeModules?.ExpoConstants;
    const appOwnership = constants?.appOwnership || constants?.executionEnvironment;
    if (appOwnership === 'expo' || appOwnership === 'storeClient') {
      localInferenceDisabledReason = 'Local models are disabled in Expo Go. Use a development build or APK.';
      return false;
    }
    return true;
  }

  static getUnavailableReason(): string | null {
    return localInferenceDisabledReason;
  }

  // ── Directory setup ─────────────────────────────────────────────────────
  static async ensureDir() {
    const info = await FileSystem.getInfoAsync(MODEL_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(MODEL_DIR, { intermediates: true });
    }
  }

  // ── Check which models are downloaded ───────────────────────────────────
  static async getModelStatuses(): Promise<ModelStatus[]> {
    await this.ensureDir();
    return Promise.all(
      LOCAL_MODELS.map(async (m) => {
        const path = `${MODEL_DIR}${m.filename}`;
        const info = await FileSystem.getInfoAsync(path);
        return {
          modelId: m.id,
          isDownloaded: info.exists && (info as any).size > m.sizeBytes * 0.99,
          isLoaded: loadedModelId === m.id,
          filePath: info.exists ? path : undefined,
          fileSizeBytes: info.exists ? (info as any).size : undefined,
        };
      })
    );
  }

  static async getActiveModelId(): Promise<string | null> {
    return AsyncStorage.getItem(ACTIVE_MODEL_KEY);
  }

  static async setActiveModel(modelId: string) {
    await AsyncStorage.setItem(ACTIVE_MODEL_KEY, modelId);
  }

  // ── Download a model ─────────────────────────────────────────────────────
  static async downloadModel(
    modelId: string,
    onProgress: (progress: DownloadProgress) => void,
    onComplete: () => void,
    onError: (err: string) => void
  ) {
    const model = LOCAL_MODELS.find(m => m.id === modelId);
    if (!model) { onError('Model not found'); return; }

    await this.ensureDir();
    const destPath = `${MODEL_DIR}${model.filename}`;

    // Resume support — check existing partial file
    const existing = await FileSystem.getInfoAsync(destPath);
    const existingSize = existing.exists ? (existing as any).size ?? 0 : 0;

    onProgress({ modelId, bytesWritten: existingSize, totalBytes: model.sizeBytes, percent: Math.round(existingSize / model.sizeBytes * 100), status: 'downloading' });

    try {
      downloadTask = FileSystem.createDownloadResumable(
        model.url,
        destPath,
        {
          headers: existingSize > 0 ? { Range: `bytes=${existingSize}-` } : {},
        },
        (progress) => {
          const total = progress.totalBytesExpectedToWrite + existingSize;
          const written = progress.totalBytesWritten + existingSize;
          const percent = Math.min(99, Math.round((written / model.sizeBytes) * 100));
          onProgress({ modelId, bytesWritten: written, totalBytes: model.sizeBytes, percent, status: 'downloading' });
        }
      );

      await downloadTask.downloadAsync();

      // Verify
      onProgress({ modelId, bytesWritten: model.sizeBytes, totalBytes: model.sizeBytes, percent: 100, status: 'verifying' });
      const finalInfo = await FileSystem.getInfoAsync(destPath);
      if (!finalInfo.exists || (finalInfo as any).size < model.sizeBytes * 0.95) {
        throw new Error('Download incomplete — file too small');
      }

      onProgress({ modelId, bytesWritten: model.sizeBytes, totalBytes: model.sizeBytes, percent: 100, status: 'completed' });
      await this.setActiveModel(modelId);
      onComplete();
    } catch (err: any) {
      onError(err.message || 'Download failed');
      onProgress({ modelId, bytesWritten: 0, totalBytes: model.sizeBytes, percent: 0, status: 'error', error: err.message });
    }
  }

  static cancelDownload() {
    downloadTask?.pauseAsync?.();
    downloadTask = null;
  }

  static async deleteModel(modelId: string) {
    const model = LOCAL_MODELS.find(m => m.id === modelId);
    if (!model) return;
    const path = `${MODEL_DIR}${model.filename}`;
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) await FileSystem.deleteAsync(path);
    if (loadedModelId === modelId) {
      await this.unloadModel();
    }
    const active = await this.getActiveModelId();
    if (active === modelId) await AsyncStorage.removeItem(ACTIVE_MODEL_KEY);
  }

  // ── Load model into memory for inference ─────────────────────────────────
  static async loadModel(
    modelId: string,
    onStatus?: (msg: string) => void
  ): Promise<boolean> {
    if (loadedModelId === modelId && llamaContext) return true;

    const model = LOCAL_MODELS.find(m => m.id === modelId);
    if (!model) return false;

    const path = `${MODEL_DIR}${model.filename}`;
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return false;

    try {
      if (!this.isRuntimeSupported()) {
        onStatus?.(localInferenceDisabledReason || 'Local models unavailable in this runtime.');
        return false;
      }

      // Unload previous model first
      if (llamaContext) await this.unloadModel();

      onStatus?.('Loading model into memory...');

      // Import llama.rn dynamically
      const llamaModule = require('llama.rn');

      if (typeof llamaModule?.initLlama === 'function') {
        llamaContext = await llamaModule.initLlama({
          model,
          modelPath: path,
          n_ctx: model.contextLength,
          n_threads: 4,
          n_batch: 512,
          use_mlock: false,
          use_mmap: true,
          n_gpu_layers: 0,
        });
      } else if (typeof llamaModule?.LlamaContext?.create === 'function') {
        llamaContext = await llamaModule.LlamaContext.create({
          model: path,
          n_ctx: model.contextLength,
          n_threads: 4,
          n_batch: 512,
          use_mlock: false,
          use_mmap: true,
          n_gpu_layers: 0,
        });
      } else {
        throw new Error('llama.rn native runtime is unavailable. Build the app as a development build or APK.');
      }

      loadedModelId = modelId;
      localInferenceDisabledReason = null;
      onStatus?.(`${model.name} loaded ✓`);
      return true;
    } catch (err: any) {
      localInferenceDisabledReason = err?.message || 'Local model unavailable in this runtime.';
      console.error('[ARIA LocalLLM] Load error:', err);
      llamaContext = null;
      loadedModelId = null;
      return false;
    }
  }

  static async unloadModel() {
    if (llamaContext) {
      try {
        if (typeof llamaContext.release === 'function') await llamaContext.release();
        else if (typeof llamaContext.dispose === 'function') await llamaContext.dispose();
      } catch {}
      llamaContext = null;
      loadedModelId = null;
    }
  }

  // ── Run inference ─────────────────────────────────────────────────────────
  static async generate(
    systemPrompt: string,
    history: { role: string; content: string }[],
    onToken?: (token: string) => void
  ): Promise<string> {
    if (!llamaContext || !loadedModelId) {
      throw new Error(localInferenceDisabledReason || 'No model loaded');
    }

    const model = LOCAL_MODELS.find(m => m.id === loadedModelId)!;
    const prompt = model.promptTemplate(systemPrompt, history);

    let fullResponse = '';

    const params = {
      prompt,
      n_predict: 512,
      temperature: 0.7,
      top_k: 40,
      top_p: 0.95,
      repeat_penalty: 1.1,
      stop: model.stopTokens,
    };

    let result: any;
    if (typeof llamaContext.completion === 'function') {
      result = await llamaContext.completion(params, (data: { token: string }) => {
        fullResponse += data.token;
        onToken?.(data.token);
      });
    } else if (typeof llamaContext.complete === 'function') {
      result = await llamaContext.complete(params);
      const text = result?.text || result?.completion || '';
      fullResponse += text;
      if (text) onToken?.(text);
    } else {
      throw new Error('The installed llama.rn runtime does not expose a completion method.');
    }

    return fullResponse.trim() || result?.text?.trim() || result?.completion?.trim() || '';
  }

  static isModelLoaded(): boolean {
    return llamaContext !== null && loadedModelId !== null;
  }

  static getLoadedModelId(): string | null {
    return loadedModelId;
  }

  static formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}
