import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let cachedVoiceModule: any = null;
const TTS_ENABLED_KEY = 'aria_tts_enabled';
const VOICE_INPUT_ENABLED_KEY = 'aria_voice_input_enabled';
const WAKE_PHRASE_KEY = 'aria_wake_phrase';
const DEFAULT_WAKE_PHRASE = 'Hey ARIA';

function getVoiceModule() {
  if (cachedVoiceModule) return cachedVoiceModule;

  try {
    cachedVoiceModule = require('@react-native-voice/voice').default;
    return cachedVoiceModule;
  } catch {}

  try {
    cachedVoiceModule = require('react-native-voice').default;
    return cachedVoiceModule;
  } catch {}

  throw new Error('Voice module not installed in the current runtime. Use a development build or APK for native voice input.');
}

export class VoiceService {
  private static isInitialized = false;
  private static ttsEnabled = true;
  private static voiceInputEnabled = true;
  private static wakePhrase = DEFAULT_WAKE_PHRASE;
  private static speaking = false;

  static async initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      const [ttsEnabled, voiceEnabled, wakePhrase] = await Promise.all([
        AsyncStorage.getItem(TTS_ENABLED_KEY),
        AsyncStorage.getItem(VOICE_INPUT_ENABLED_KEY),
        AsyncStorage.getItem(WAKE_PHRASE_KEY),
      ]);
      this.ttsEnabled = ttsEnabled !== 'false';
      this.voiceInputEnabled = voiceEnabled !== 'false';
      this.wakePhrase = wakePhrase?.trim() || DEFAULT_WAKE_PHRASE;
    } catch {
      this.ttsEnabled = true;
      this.voiceInputEnabled = true;
      this.wakePhrase = DEFAULT_WAKE_PHRASE;
    }
  }

  static async ensureMicrophonePermission() {
    const current = await Audio.getPermissionsAsync();
    if (current.granted) return true;
    const next = await Audio.requestPermissionsAsync();
    return next.granted;
  }

  static async isTTSEnabled() {
    await this.initialize();
    return this.ttsEnabled;
  }

  static async setTTSEnabled(enabled: boolean) {
    this.ttsEnabled = enabled;
    await AsyncStorage.setItem(TTS_ENABLED_KEY, String(enabled));
    if (!enabled) {
      await this.stopSpeaking();
    }
  }

  static async isVoiceInputEnabled() {
    await this.initialize();
    return this.voiceInputEnabled;
  }

  static async setVoiceInputEnabled(enabled: boolean) {
    this.voiceInputEnabled = enabled;
    await AsyncStorage.setItem(VOICE_INPUT_ENABLED_KEY, String(enabled));
    if (!enabled) {
      await this.stopListening();
    }
  }

  static async getWakePhrase() {
    await this.initialize();
    return this.wakePhrase;
  }

  static async setWakePhrase(value: string) {
    await this.initialize();
    this.wakePhrase = value.trim() || DEFAULT_WAKE_PHRASE;
    await AsyncStorage.setItem(WAKE_PHRASE_KEY, this.wakePhrase);
  }

  static async startListening(
    onResult: (text: string) => void,
    onError: (err: any) => void
  ) {
    try {
      await this.initialize();
      if (!this.voiceInputEnabled) {
        onError(new Error('Voice input is disabled in Settings.'));
        return;
      }

      const granted = await this.ensureMicrophonePermission();
      if (!granted) {
        onError(new Error('Microphone permission was denied.'));
        return;
      }

      const Voice = getVoiceModule();
      if (typeof Voice.isAvailable === 'function') {
        const available = await Voice.isAvailable();
        if (!available) {
          onError(new Error('Speech recognition is not available on this device/runtime.'));
          return;
        }
      }

      Voice.onSpeechResults = (e: any) => {
        const text = e?.value?.[0] || '';
        if (text) onResult(text);
      };

      Voice.onSpeechError = (e: any) => {
        onError(e?.error || e);
      };

      if (typeof Voice.destroy === 'function') {
        try { await Voice.destroy(); } catch {}
      }

      await Voice.start('en-US');
    } catch (error) {
      onError(error);
    }
  }

  static async stopListening() {
    try {
      const Voice = getVoiceModule();
      if (typeof Voice.stop === 'function') await Voice.stop();
      if (typeof Voice.cancel === 'function') await Voice.cancel();
      if (typeof Voice.destroy === 'function') await Voice.destroy();
      cachedVoiceModule = null;
    } catch {}
  }

  static async speak(text: string) {
    await this.initialize();
    if (!this.ttsEnabled) return;

    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/\n/g, '. ')
      .trim();

    if (!cleanText || !this.ttsEnabled) return;

    this.speaking = true;

    return new Promise<void>((resolve) => {
      Speech.stop();
      Speech.speak(cleanText, {
        language: 'en-US',
        pitch: 1.0,
        rate: Platform.OS === 'ios' ? 0.5 : 0.95,
        onDone: () => { this.speaking = false; resolve(); },
        onError: () => { this.speaking = false; resolve(); },
        onStopped: () => { this.speaking = false; resolve(); },
      });
    });
  }

  static async stopSpeaking() {
    this.speaking = false;
    Speech.stop();
  }

  static isSpeaking() {
    return this.speaking;
  }
}
