import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { AIEngineService, AITier } from './AIEngineService';
import { VoiceService } from './VoiceService';
import { VoiceWakeService } from './VoiceWakeService';
import * as NavigationService from './NavigationService';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isTyping?: boolean;
  model?: string;
  mode?: 'online' | 'offline';
  tier?: AITier;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  schedule: string;
  nextRun: number;
  enabled: boolean;
  action: string;
}

export type StudyMode = 'chat' | 'homework' | 'papers' | 'college' | 'screen';

export type SubscriptionLevel = 'free' | 'pro' | 'college';

interface ARIAContextType {
  messages: Message[];
  isListening: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
  isOnline: boolean;
  currentMode: StudyMode;
  tasks: Task[];
  subscriptionLevel: SubscriptionLevel;
  sendMessage: (text: string, imageBase64?: string) => Promise<void>;
  clearChat: () => void;
  toggleListening: () => void;
  setMode: (mode: StudyMode) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  removeTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setOnline: (val: boolean) => void;
  setSubscriptionLevel: (level: SubscriptionLevel) => void;
}

const ARIAContext = createContext<ARIAContextType | null>(null);

export const useARIA = () => {
  const ctx = useContext(ARIAContext);
  if (!ctx) throw new Error('useARIA must be used within ARIAProvider');
  return ctx;
};

const SYSTEM_PROMPTS: Record<string, string> = {
  chat: `You are ARIA Study, a mobile learning assistant for college students and CXC students. Be clear, encouraging, and practical. Help students understand concepts, plan study sessions, prepare for tests, and improve assignments. When information may be current, such as college requirements, syllabi, fees, deadlines, or official exam updates, use online tools if available and cite sources when possible.`,
  homework: `You are ARIA in Homework Tutor Mode. Teach step by step, ask for the student's level when needed, explain the method before the final answer, and give practice checks. Help with math, science, writing, coding, business, humanities, and study skills. Do not write dishonest submissions for graded work; instead provide outlines, explanations, examples, feedback, and revision guidance that helps the student learn.`,
  papers: `You are ARIA in Past Paper Coach Mode for CXC, CSEC, CAPE, and college course practice. Help students identify syllabus areas, paper type, command words, mark allocation, answer structure, timing, and revision priorities. Do not claim to have copyrighted past-paper text unless the user provides it or it is from an official allowed source. If online tools are available, prefer official sources and current syllabus information.`,
  college: `You are ARIA in College Success Mode. Support current college education across general education, STEM, business, health, writing, research, and career readiness. Explain concepts clearly, help build semester plans, summarize readings provided by the user, draft study schedules, and point students toward current official sources when policies or requirements may change.`,
  screen: `You are ARIA in Homework Scan Mode. Analyze homework photos, past-paper questions, notes, textbook pages, code, worksheets, and rubrics. Extract the visible task, explain what is being asked, solve or teach step by step, and mention any missing or unclear visual details before making assumptions.`,
};

export const ARIAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hey! I'm **ARIA Study**. I can help with homework, CXC/CSEC/CAPE past-paper practice, college topics, study planning, and scanned questions. Ask a question, paste an assignment, or use the Study tab to start a focused session.",
      timestamp: Date.now(),
      model: 'ARIA Study v1.2',
      mode: 'offline',
    }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isOnline, setIsOnlineState] = useState(true);
  const [currentMode, setCurrentModeState] = useState<StudyMode>('chat');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subscriptionLevel, setSubscriptionLevelState] = useState<SubscriptionLevel>('free');
  const conversationHistory = useRef<{ role: string; content: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        await VoiceService.initialize().catch(e => console.log('VoiceService init failed', e));
        await VoiceWakeService.initialize().catch(e => console.log('VoiceWakeService init failed', e));
        const [onlinePref, storedTasks, storedSub] = await Promise.all([
          AsyncStorage.getItem('aria_online_enabled'),
          AsyncStorage.getItem('aria_tasks'),
          AsyncStorage.getItem('aria_subscription_level'),
        ]);
        setIsOnlineState(onlinePref !== 'false');
        if (storedTasks) {
          try { setTasks(JSON.parse(storedTasks)); } catch {}
        }
        if (storedSub) {
          setSubscriptionLevelState(storedSub as SubscriptionLevel);
        }
      } catch (err) {
        console.error('ARIAProvider init error:', err);
      }
    })();
  }, []);

  const setSubscriptionLevel = async (level: SubscriptionLevel) => {
    setSubscriptionLevelState(level);
    await AsyncStorage.setItem('aria_subscription_level', level);
  };

  const setOnline = async (val: boolean) => {
    setIsOnlineState(val);
    await AsyncStorage.setItem('aria_online_enabled', String(val));
  };

  const setMode = (mode: StudyMode) => setCurrentModeState(mode);

  const sendMessage = useCallback(async (text: string, imageBase64?: string) => {
    // Check subscription limits
    const today = new Date().toDateString();
    const countKey = `aria_msg_count_${today}`;
    const dailyCount = parseInt(await AsyncStorage.getItem(countKey) || '0');

    if (subscriptionLevel === 'free' && dailyCount >= 5) {
      Alert.alert(
        "Daily Limit Reached",
        "Free users are limited to 5 questions per day. Upgrade to Pro for unlimited access!",
        [
          { text: "Later", style: "cancel" },
          { text: "Upgrade", onPress: () => NavigationService.navigate('Subscription') }
        ]
      );
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);

    const typingId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: typingId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isTyping: true,
    }]);

    try {
      conversationHistory.current.push({ role: 'user', content: text });
      if (conversationHistory.current.length > 20) {
        conversationHistory.current = conversationHistory.current.slice(-20);
      }

      const systemPrompt = SYSTEM_PROMPTS[currentMode];
      const streamingMsgId = (Date.now() + 2).toString();
      let streamedText = '';

      const result = await AIEngineService.query(systemPrompt, conversationHistory.current, {
        preferOnline: isOnline,
        imageBase64,
        onToken: (token) => {
          streamedText += token;
          setMessages(prev => {
            const filtered = prev.filter(m => m.id !== typingId);
            const existing = filtered.find(m => m.id === streamingMsgId);
            if (existing) {
              return filtered.map(m => m.id === streamingMsgId ? { ...m, content: streamedText } : m);
            }
            return [...filtered, {
              id: streamingMsgId,
              role: 'assistant' as const,
              content: streamedText,
              timestamp: Date.now(),
              model: 'Local Model (streaming...)',
              mode: 'offline' as const,
              tier: 'local' as AITier,
            }];
          });
        },
      });

      conversationHistory.current.push({ role: 'assistant', content: result.text });

      // Increment daily message count for free users
      if (subscriptionLevel === 'free') {
        const newCount = dailyCount + 1;
        await AsyncStorage.setItem(countKey, newCount.toString());
      }

      const usedMode: 'online' | 'offline' = result.tier === 'groq' ? 'online' : 'offline';

      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== typingId && m.id !== streamingMsgId);
        return [...filtered, {
          id: streamingMsgId,
          role: 'assistant' as const,
          content: result.text,
          timestamp: Date.now(),
          model: result.model,
          mode: usedMode,
          tier: result.tier,
        }];
      });

      if (result.text.length < 300 && await VoiceService.isTTSEnabled()) {
        setIsSpeaking(true);
        await VoiceService.speak(result.text);
        setIsSpeaking(false);
      }
    } catch (error: any) {
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== typingId);
        return [...filtered, {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: `I hit an error: ${error.message}. Try switching online mode, checking your API key, or using the fallback engine.`,
          timestamp: Date.now(),
          model: 'ARIA Study',
          mode: 'offline',
        }];
      });
    } finally {
      setIsThinking(false);
    }
  }, [currentMode, isOnline]);

  const clearChat = () => {
    conversationHistory.current = [];
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: "Chat cleared. What class, paper, or assignment should we work on next?",
      timestamp: Date.now(),
      model: 'ARIA Study v1.2',
      mode: isOnline ? 'online' : 'offline',
    }]);
  };

  const toggleListening = async () => {
    if (isListening) {
      await VoiceService.stopListening();
      setIsListening(false);
      return;
    }

    const enabled = await VoiceService.isVoiceInputEnabled();
    if (!enabled) return;

    setIsListening(true);
    VoiceService.startListening(
      (text) => {
        setIsListening(false);
        if (text.trim()) sendMessage(text);
      },
      () => setIsListening(false)
    );
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: Date.now().toString() };
    setTasks(prev => {
      const updated = [...prev, newTask];
      AsyncStorage.setItem('aria_tasks', JSON.stringify(updated));
      return updated;
    });
  };

  const removeTask = (id: string) => {
    setTasks(prev => {
      const updated = prev.filter(t => t.id !== id);
      AsyncStorage.setItem('aria_tasks', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleTask = (id: string) => {
    setTasks(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t);
      AsyncStorage.setItem('aria_tasks', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <ARIAContext.Provider value={{
      messages, isListening, isThinking, isSpeaking,
      isOnline, currentMode, tasks, subscriptionLevel,
      sendMessage, clearChat, toggleListening,
      setMode, addTask, removeTask, toggleTask, setOnline,
      setSubscriptionLevel,
    }}>
      {children}
    </ARIAContext.Provider>
  );
};
