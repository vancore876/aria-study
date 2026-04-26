import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Alert, ScrollView, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { useARIA } from '../services/ARIAContext';

const COLORS = {
  bg: '#0a0a0f',
  surface: '#13131a',
  surface2: '#1a1a28',
  accent: '#00d4ff',
  accent2: '#7c3aed',
  text: '#e8e8f0',
  muted: '#737396',
  border: '#1e1e35',
  green: '#00ff88',
};

const ANALYSIS_PRESETS = [
  { label: 'Solve step by step', prompt: 'Read this homework question and teach me the solution step by step. Explain the method before the final answer.' },
  { label: 'CXC past-paper plan', prompt: 'Treat this as a CXC/CSEC/CAPE past-paper question. Identify the syllabus topic, command words, marks likely required, and answer structure.' },
  { label: 'Check my working', prompt: 'Review my working on this page. Find mistakes, explain corrections, and show what to do next.' },
  { label: 'Essay or rubric review', prompt: 'Analyze this essay prompt, rubric, or draft. Help with thesis, paragraph structure, evidence, citations, and revision priorities.' },
  { label: 'Notes to flashcards', prompt: 'Turn the visible notes into concise flashcards, key terms, and a quick quiz.' },
  { label: 'Debug code', prompt: 'I am looking at code on my screen. Explain what it does, find likely bugs, and suggest fixes.' },
];

export default function ScreenShareScreen() {
  const { sendMessage, setMode } = useARIA();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const cameraRef = useRef<CameraView>(null);

  const requestPermissions = async () => {
    const { status: camStatus } = await Camera.requestCameraPermissionsAsync();
    await MediaLibrary.requestPermissionsAsync();

    if (camStatus !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'ARIA needs camera access to scan homework, notes, and textbook questions.',
        [{ text: 'OK' }]
      );
    } else {
      setCameraVisible(true);
    }
  };

  const capturePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });
      setCapturedImage(photo.uri);
      setCameraVisible(false);
    } catch {
      Alert.alert('Capture Error', 'Could not capture image. Try again.');
    }
  };

  const analyzeImage = async (prompt?: string) => {
    if (!capturedImage) return;

    const finalPrompt = prompt || analysisPrompt || 'Analyze this homework, notes, or study screen. Explain what is being asked and help me learn it step by step.';

    try {
      const base64 = await FileSystem.readAsStringAsync(capturedImage, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setMode('screen');
      await sendMessage(finalPrompt, base64);
    } catch {
      setMode('screen');
      await sendMessage(`Analyze my homework image from this description: ${finalPrompt}`);
    }
  };

  if (cameraVisible) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back">
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraBracket} />
            <Text style={styles.cameraHint}>Point at homework, notes, a past-paper question, or a textbook page</Text>
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCameraVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.captureBtn} onPress={capturePhoto}>
                <View style={styles.captureBtnInner} />
              </TouchableOpacity>
              <View style={{ width: 50 }} />
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Homework Scan</Text>
          <Text style={styles.headerSub}>Capture questions, notes, rubrics, code, or past-paper pages.</Text>
        </View>

        <View style={styles.card}>
          {capturedImage ? (
            <View>
              <Image source={{ uri: capturedImage }} style={styles.preview} resizeMode="contain" />
              <TextInput
                style={styles.promptInput}
                placeholder="Optional: tell ARIA what you want help with"
                placeholderTextColor={COLORS.muted}
                value={analysisPrompt}
                onChangeText={setAnalysisPrompt}
                multiline
                textAlignVertical="top"
              />
              <View style={styles.imageActions}>
                <TouchableOpacity style={styles.retakeBtn} onPress={() => setCapturedImage(null)}>
                  <Ionicons name="refresh" size={16} color={COLORS.muted} />
                  <Text style={styles.retakeBtnText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.analyzeMainBtn} onPress={() => analyzeImage()}>
                  <Ionicons name="sparkles" size={16} color="#fff" />
                  <Text style={styles.analyzeMainBtnText}>Analyze</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.captureArea} onPress={requestPermissions}>
              <Ionicons name="camera" size={48} color={COLORS.accent} />
              <Text style={styles.captureTitle}>Capture Study Material</Text>
              <Text style={styles.captureSubtitle}>
                Use this for homework, handwritten working, CXC past-paper questions, textbook pages, or lecture slides.
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {capturedImage && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quick Analysis Presets</Text>
            {ANALYSIS_PRESETS.map(p => (
              <TouchableOpacity
                key={p.label}
                style={styles.presetBtn}
                onPress={() => analyzeImage(p.prompt)}
              >
                <Text style={styles.presetLabel}>{p.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Best Uses</Text>
          {[
            { icon: 'document-text-outline', text: 'Capture a question and ask for the method, not just the answer.' },
            { icon: 'checkmark-done-outline', text: 'Scan your working so ARIA can find mistakes and explain corrections.' },
            { icon: 'book-outline', text: 'Use past-paper pages to identify syllabus areas and answer structure.' },
            { icon: 'school-outline', text: 'Turn lecture slides or textbook pages into notes, flashcards, and quizzes.' },
          ].map((item, i) => (
            <View key={i} style={styles.instructionRow}>
              <Ionicons name={item.icon as any} size={17} color={COLORS.accent} />
              <Text style={styles.instructionText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 96 },
  header: { padding: 20, paddingBottom: 8 },
  headerTitle: { color: COLORS.text, fontSize: 24, fontWeight: '800' },
  headerSub: { color: COLORS.muted, fontSize: 13, marginTop: 3, lineHeight: 19 },
  card: {
    margin: 12, marginTop: 8, backgroundColor: COLORS.surface,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  cardTitle: { color: COLORS.text, fontWeight: 'bold', fontSize: 16, marginBottom: 12 },
  captureArea: {
    alignItems: 'center', padding: 36, gap: 12,
    borderWidth: 2, borderColor: COLORS.accent + '40',
    borderRadius: 12, borderStyle: 'dashed',
  },
  captureTitle: { color: COLORS.text, fontWeight: 'bold', fontSize: 18 },
  captureSubtitle: { color: COLORS.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  preview: { width: '100%', height: 250, borderRadius: 12, backgroundColor: '#000' },
  promptInput: {
    backgroundColor: COLORS.surface2,
    color: COLORS.text,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 76,
    marginTop: 12,
  },
  imageActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  retakeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: COLORS.surface2, borderRadius: 10, paddingVertical: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  retakeBtnText: { color: COLORS.muted, fontWeight: '600' },
  analyzeMainBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: COLORS.accent2, borderRadius: 10, paddingVertical: 10,
  },
  analyzeMainBtnText: { color: '#fff', fontWeight: 'bold' },
  presetBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  presetLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  instructionRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12,
  },
  instructionText: { color: COLORS.muted, fontSize: 13, flex: 1, lineHeight: 20 },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, justifyContent: 'space-between', padding: 20, paddingTop: 60 },
  cameraBracket: {
    alignSelf: 'center', width: 280, height: 280,
    borderWidth: 2, borderColor: COLORS.accent, borderRadius: 16,
    borderStyle: 'dashed',
  },
  cameraHint: { color: '#fff', textAlign: 'center', fontSize: 14, opacity: 0.85, lineHeight: 20 },
  cameraControls: {
    flexDirection: 'row', justifyContent: 'space-around',
    alignItems: 'center', paddingBottom: 30,
  },
  cancelBtn: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#ffffff30',
    alignItems: 'center', justifyContent: 'center',
  },
  captureBtn: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#ffffff40', borderWidth: 3, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  captureBtnInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' },
});
