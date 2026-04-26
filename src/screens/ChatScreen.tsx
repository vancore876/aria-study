import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';

import { useARIA, Message, StudyMode } from '../services/ARIAContext';

const COLORS = {
  bg: '#0a0a0f',
  surface: '#13131a',
  surface2: '#1a1a28',
  accent: '#00d4ff',
  accent2: '#7c3aed',
  text: '#e8e8f0',
  muted: '#737396',
  userBubble: '#1e1e3a',
  aiBubble: '#0f1f2a',
  border: '#1e1e35',
  green: '#00ff88',
  red: '#ff4466',
};

const TypingDots = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      ).start();

    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  return (
    <View style={styles.typingContainer}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={[styles.typingDot, {
            opacity: dot,
            transform: [{ scale: dot.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] }) }]
          }]}
        />
      ))}
    </View>
  );
};

const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === 'user';

  if (message.isTyping) {
    return (
      <View style={[styles.bubble, styles.aiBubble]}>
        <View style={styles.ariaHeader}>
          <View style={styles.ariaAvatar}>
            <Text style={styles.ariaAvatarText}>A</Text>
          </View>
          <Text style={styles.ariaLabel}>ARIA Study</Text>
        </View>
        <TypingDots />
      </View>
    );
  }

  return (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
      {!isUser && (
        <View style={styles.ariaHeader}>
          <View style={styles.ariaAvatar}>
            <Text style={styles.ariaAvatarText}>A</Text>
          </View>
          <Text style={styles.ariaLabel}>ARIA Study</Text>
        </View>
      )}
      <Markdown style={markdownStyles}>{message.content}</Markdown>
      <Text style={styles.timestamp}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
};

const MODES: { key: StudyMode; label: string }[] = [
  { key: 'chat', label: 'Ask' },
  { key: 'homework', label: 'Homework' },
  { key: 'papers', label: 'Papers' },
  { key: 'college', label: 'College' },
];

export default function ChatScreen() {
  const { messages, isListening, isThinking, isSpeaking, currentMode, sendMessage, clearChat, toggleListening, setMode } = useARIA();
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>A</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>ARIA Study</Text>
            <Text style={styles.headerSubtitle}>
              {isSpeaking ? 'Speaking...' : isThinking ? 'Thinking...' : 'Ready to study'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={clearChat} style={styles.clearBtn}>
          <Ionicons name="trash-outline" size={20} color={COLORS.muted} />
        </TouchableOpacity>
      </View>

      <View style={styles.modeRow}>
        {MODES.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[styles.modeBtn, currentMode === m.key && styles.modeBtnActive]}
            onPress={() => setMode(m.key)}
          >
            <Text style={[styles.modeBtnText, currentMode === m.key && styles.modeBtnTextActive]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about homework, CXC papers, or college topics..."
            placeholderTextColor={COLORS.muted}
            multiline
            maxLength={2000}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.voiceBtn, isListening && styles.voiceBtnActive]}
              onPress={toggleListening}
            >
              <Ionicons
                name={isListening ? 'mic' : 'mic-outline'}
                size={22}
                color={isListening ? '#fff' : COLORS.accent}
              />
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            {isThinking ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const markdownStyles = {
  body: { color: '#e8e8f0', fontSize: 15, lineHeight: 22 },
  code_inline: { backgroundColor: '#1a1a35', color: '#00d4ff', borderRadius: 4, paddingHorizontal: 4 },
  fence: { backgroundColor: '#0d0d1a', borderRadius: 8, padding: 12, marginVertical: 8 },
  code_block: { color: '#e8e8f0', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13 },
  strong: { color: '#ffffff', fontWeight: 'bold' as const },
  em: { color: '#00d4ff' },
  bullet_list: { color: '#e8e8f0' },
  heading1: { color: '#00d4ff', fontSize: 18 },
  heading2: { color: '#ffffff', fontSize: 16 },
  heading3: { color: '#e8e8f0', fontSize: 15 },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoContainer: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.accent2, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.accent,
  },
  logoText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  headerTitle: { color: COLORS.text, fontWeight: 'bold', fontSize: 18, letterSpacing: 0.2 },
  headerSubtitle: { color: COLORS.muted, fontSize: 11 },
  clearBtn: { padding: 8 },
  modeRow: {
    flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: COLORS.surface, gap: 8,
  },
  modeBtn: {
    flex: 1, paddingVertical: 4, borderRadius: 14, alignItems: 'center',
    backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border,
  },
  modeBtnActive: { backgroundColor: COLORS.accent2, borderColor: COLORS.accent },
  modeBtnText: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  modeBtnTextActive: { color: '#fff' },
  messageList: { paddingHorizontal: 12, paddingVertical: 16, paddingBottom: 160, gap: 12 },
  bubble: { borderRadius: 16, padding: 14, maxWidth: '92%' },
  userBubble: {
    backgroundColor: COLORS.userBubble, alignSelf: 'flex-end',
    borderBottomRightRadius: 4, borderWidth: 1, borderColor: COLORS.accent2 + '60',
  },
  aiBubble: {
    backgroundColor: COLORS.aiBubble, alignSelf: 'flex-start',
    borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.accent + '30',
  },
  ariaHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  ariaAvatar: {
    width: 24, height: 24, borderRadius: 6, backgroundColor: COLORS.accent2,
    alignItems: 'center', justifyContent: 'center',
  },
  ariaAvatarText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  ariaLabel: { color: COLORS.accent, fontSize: 12, fontWeight: 'bold', letterSpacing: 0.2 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  onlineBadge: { backgroundColor: '#00ff8820' },
  localBadge: { backgroundColor: '#7c3aed20' },
  offlineBadge: { backgroundColor: '#ff446620' },
  badgeText: { fontSize: 10, color: COLORS.muted },
  typingContainer: { flexDirection: 'row', gap: 6, paddingVertical: 8 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent },
  timestamp: { color: COLORS.muted, fontSize: 10, marginTop: 6, alignSelf: 'flex-end' },
  inputContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12,
    paddingVertical: 10, backgroundColor: COLORS.surface,
    borderTopWidth: 1, borderTopColor: COLORS.border, gap: 8,
    marginHorizontal: 10,
    borderRadius: 25,
    marginBottom: 10,
    // Add shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    flex: 1, backgroundColor: COLORS.surface2, color: COLORS.text,
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, maxHeight: 120, borderWidth: 1, borderColor: COLORS.border,
  },
  voiceBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface2,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.accent + '60',
  },
  voiceBtnActive: { backgroundColor: COLORS.accent2, borderColor: COLORS.accent },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.accent2,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: COLORS.muted },
});
