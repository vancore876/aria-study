import AsyncStorage from '@react-native-async-storage/async-storage';

const WAKE_PHRASE_KEY = 'aria_wake_phrase';

export class VoiceWakeService {
  private static listeners: ((text: string) => void)[] = [];
  private static wakePhrases = ['hey aria', 'ok aria', 'aria'];

  static async initialize() {
    try {
      const custom = (await AsyncStorage.getItem(WAKE_PHRASE_KEY))?.trim().toLowerCase();
      if (custom) {
        this.wakePhrases = Array.from(new Set([...this.wakePhrases, custom]));
      }
    } catch {}
    console.log('[ARIA] Voice wake service initialized');
  }

  static onWakeWord(callback: (text: string) => void) {
    this.listeners.push(callback);
  }

  static triggerWake(text: string) {
    this.listeners.forEach(cb => cb(text));
  }

  static checkWakeWord(text: string): boolean {
    const lower = text.toLowerCase();
    return this.wakePhrases.some(w => lower.includes(w));
  }

  static extractCommand(text: string): string {
    const lower = text.toLowerCase();
    for (const pattern of this.wakePhrases) {
      const idx = lower.indexOf(pattern);
      if (idx !== -1) return text.slice(idx + pattern.length).trim();
    }
    return text;
  }
}
