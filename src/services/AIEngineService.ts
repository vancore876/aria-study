import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocalLLMService } from './LocalLLMService';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

const BUILTIN_OPENROUTER_KEY = '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';

const ONLINE_MODELS = [
  { provider: 'groq', model: 'groq/compound-mini', keyName: 'groq_api_key', useWeb: true },
  { provider: 'groq', model: 'llama-3.3-70b-versatile', keyName: 'groq_api_key', useWeb: false },
  { provider: 'groq', model: 'llama-3.1-8b-instant', keyName: 'groq_api_key', useWeb: false },
  { provider: 'openrouter', model: 'meta-llama/llama-3.1-8b-instruct:free', keyName: 'openrouter_api_key', useWeb: false, builtinKey: BUILTIN_OPENROUTER_KEY },
  { provider: 'openrouter', model: 'microsoft/phi-3-mini-128k-instruct:free', keyName: 'openrouter_api_key', useWeb: false, builtinKey: BUILTIN_OPENROUTER_KEY },
] as const;

export type AITier = 'groq' | 'local' | 'pattern';

export class AIEngineService {
  static async validateGroqKey(apiKey: string): Promise<{ ok: boolean; message: string }> {
    try {
      const response = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: 'Reply exactly with: ARIA Study online' }],
          max_tokens: 12,
          temperature: 0,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return { ok: false, message: data?.error?.message || `HTTP ${response.status}` };
      }

      const text = data?.choices?.[0]?.message?.content?.trim() || 'Connected';
      return { ok: true, message: text };
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Network error' };
    }
  }

  static async queryOnline(
    systemPrompt: string,
    history: { role: string; content: string }[],
    imageBase64?: string
  ): Promise<{ text: string; model: string; tier: AITier }> {
    const latest = history[history.length - 1]?.content || '';
    const wantsFreshInfo =
      /College Success Mode|Past Paper Coach Mode/.test(systemPrompt) ||
      /latest|today|current|news|updated|official|syllabus|deadline|admission|tuition|requirements/i.test(latest);

    for (const provider of ONLINE_MODELS) {
      try {
        let apiKey = await AsyncStorage.getItem(provider.keyName);
        if (!apiKey && 'builtinKey' in provider) {
          apiKey = provider.builtinKey;
        }
        if (!apiKey) continue;

        const messages: any[] = [{ role: 'system', content: systemPrompt }, ...history.slice(-12)];

        if (imageBase64 && provider.provider === 'openrouter') {
          const lastMsg = messages[messages.length - 1];
          if (lastMsg?.role === 'user') {
            lastMsg.content = [
              { type: 'text', text: lastMsg.content },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            ];
          }
        }

        const endpoint = provider.provider === 'groq' ? GROQ_ENDPOINT : OPENROUTER_ENDPOINT;
        const body: any = {
          model: provider.model,
          messages,
          max_tokens: 1200,
          temperature: 0.45,
          stream: false,
        };

        if (provider.provider === 'groq' && provider.useWeb && wantsFreshInfo) {
          body.compound_custom = { tools: { enabled_tools: ['web_search'] } };
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            ...(provider.provider === 'openrouter' && {
              'HTTP-Referer': 'https://aria-study.app',
              'X-Title': 'ARIA Study Assistant',
            }),
          },
          body: JSON.stringify(body),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error?.message || `HTTP ${response.status}`);
        }

        const text = data?.choices?.[0]?.message?.content || '';
        if (text) return { text, model: `${provider.model} (${provider.provider})`, tier: 'groq' };
      } catch {
        continue;
      }
    }

    throw new Error('No online provider is currently available.');
  }

  static async queryLocal(
    systemPrompt: string,
    history: { role: string; content: string }[],
    onToken?: (token: string) => void
  ): Promise<{ text: string; model: string; tier: AITier }> {
    if (!LocalLLMService.isModelLoaded()) {
      const activeId = await LocalLLMService.getActiveModelId();
      if (!activeId) throw new Error('No local model downloaded');

      const loaded = await LocalLLMService.loadModel(activeId);
      if (!loaded) throw new Error(LocalLLMService.getUnavailableReason() || 'Failed to load local model');
    }

    const text = await LocalLLMService.generate(systemPrompt, history, onToken);
    if (!text) throw new Error('Local model returned empty response');

    const modelId = LocalLLMService.getLoadedModelId() || 'local';
    return { text, model: `${modelId} (on-device)`, tier: 'local' };
  }

  static async queryPattern(systemPrompt: string, query: string): Promise<string> {
    const q = query.toLowerCase().trim();
    const isHomework = systemPrompt.includes('Homework Tutor Mode');
    const isPapers = systemPrompt.includes('Past Paper Coach Mode');
    const isCollege = systemPrompt.includes('College Success Mode');
    const isScreen = systemPrompt.includes('Homework Scan Mode');

    if (isHomework || q.includes('homework') || q.includes('solve') || q.includes('explain')) {
      if (q.includes('essay') || q.includes('paragraph') || q.includes('thesis')) {
        return `**Writing help**\n\n1. Restate the question in your own words.\n2. Write a direct thesis that answers it.\n3. Use one clear idea per paragraph.\n4. Support each point with evidence, explanation, and a link back to the question.\n5. End by showing why your answer matters.\n\nSend me your prompt or draft and I can help outline, revise, or strengthen it.`;
      }

      if (q.includes('math') || q.includes('equation') || q.includes('algebra')) {
        return `**Math tutor mode**\n\nI can walk through the method step by step. Send the exact question, and include any working you already tried.\n\nA good answer format is:\n- Given information\n- Formula or rule\n- Substitution\n- Working steps\n- Final answer with units, if needed`;
      }

      return `**Homework tutor mode**\n\nSend the exact question, topic, class level, and what you tried. I will explain the method, show the steps, and give you a quick practice check so you can do the next one yourself.`;
    }

    if (isPapers || q.includes('cxc') || q.includes('csec') || q.includes('cape') || q.includes('past paper')) {
      return `**Past paper practice**\n\nChoose the exam and subject, then send a question or topic.\n\nUseful setup:\n- Exam: CSEC, CAPE, or college course\n- Subject/course\n- Paper type: Paper 01, Paper 02, Paper 03/SBA, Unit 1, or Unit 2\n- Year or topic, if known\n\nI can help identify the syllabus area, unpack command words, plan the answer, and build a timed practice set.`;
    }

    if (isCollege || q.includes('college') || q.includes('course') || q.includes('lecture')) {
      return `**College study support**\n\nI can help with lecture notes, readings, labs, assignments, research writing, and exam prep. For school-specific requirements or current policies, turn on online mode and ask for official-source checking.\n\nTry asking:\n- Build a weekly plan for my biology exam.\n- Explain this accounting concept with examples.\n- Turn my lecture notes into flashcards.\n- Review my essay outline against the rubric.`;
    }

    if (isScreen) {
      return `**Homework scan fallback**\n\nI could not run the richer image pipeline, but I can still help if you type what is visible or paste the question. Include any diagrams, answer choices, units, or rubric details you can see.`;
    }

    return `I'm running in fallback mode right now. I can still help with homework steps, CXC/CAPE practice planning, college study schedules, outlines, and revision checklists. For current official information, enable an online provider in Settings.`;
  }

  static async query(
    systemPrompt: string,
    history: { role: string; content: string }[],
    opts?: {
      preferOnline?: boolean;
      imageBase64?: string;
      onToken?: (token: string) => void;
    }
  ): Promise<{ text: string; model: string; tier: AITier }> {
    const preferOnline = opts?.preferOnline ?? true;
    const imageBase64 = opts?.imageBase64;

    if (preferOnline) {
      try {
        return await this.queryOnline(systemPrompt, history, imageBase64);
      } catch {}
    }

    try {
      return await this.queryLocal(systemPrompt, history, opts?.onToken);
    } catch {}

    const latest = history[history.length - 1]?.content || '';
    const text = await this.queryPattern(systemPrompt, latest);
    return { text, model: 'Study Pattern Engine', tier: 'pattern' };
  }
}
