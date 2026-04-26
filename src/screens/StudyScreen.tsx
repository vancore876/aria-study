import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useARIA, StudyMode } from '../services/ARIAContext';

const COLORS = {
  bg: '#07111f',
  surface: 'rgba(255,255,255,0.08)',
  surface2: 'rgba(255,255,255,0.12)',
  edge: 'rgba(255,255,255,0.14)',
  accent: '#6ee7ff',
  violet: '#8b5cf6',
  mint: '#41f2b4',
  amber: '#f7b955',
  rose: '#ff7aa2',
  text: '#eef6ff',
  muted: '#91a4be',
};

const LEVELS = ['CSEC', 'CAPE', 'College', 'Homework'];

const CXC_TRACKS = [
  {
    exam: 'CSEC',
    subjects: 'Mathematics, English A, Biology, Chemistry, Physics, Integrated Science, Social Studies',
    papers: 'Paper 01 MCQ, Paper 02 structured/essay, Paper 03 SBA or alternative',
  },
  {
    exam: 'CAPE',
    subjects: 'Communication Studies, Caribbean Studies, Pure Mathematics, Biology, Computer Science, Accounting',
    papers: 'Unit 1, Unit 2, Paper 01, Paper 02, internal assessment',
  },
  {
    exam: 'College',
    subjects: 'Composition, algebra, statistics, biology, chemistry, psychology, economics, programming',
    papers: 'Quizzes, midterms, finals, labs, essays, projects, rubrics',
  },
];

const QUICK_PROMPTS = [
  {
    label: 'Past-paper drill',
    mode: 'papers' as StudyMode,
    prompt: 'Build me a timed CSEC past-paper practice drill. Include Paper 01 warmup, Paper 02 written questions, mark allocation, and a review checklist.',
  },
  {
    label: 'Homework steps',
    mode: 'homework' as StudyMode,
    prompt: 'Help me solve my homework step by step. First ask me for the exact question, class level, and what I already tried.',
  },
  {
    label: 'College exam plan',
    mode: 'college' as StudyMode,
    prompt: 'Create a 7-day college exam study plan with review blocks, active recall, practice questions, and a final-day checklist.',
  },
  {
    label: 'Essay outline',
    mode: 'homework' as StudyMode,
    prompt: 'Help me turn an essay prompt into a thesis, paragraph outline, evidence plan, and revision checklist.',
  },
  {
    label: 'SBA support',
    mode: 'papers' as StudyMode,
    prompt: 'Guide me through planning a CXC SBA. Include topic choice, research question, data collection, analysis, presentation, and common mistakes.',
  },
  {
    label: 'Current syllabus check',
    mode: 'papers' as StudyMode,
    prompt: 'If online mode is available, help me find current official syllabus information and explain what changed or what I should verify.',
  },
];

const STUDY_TOOLS = [
  { icon: 'reader-outline', title: 'Explain', text: 'Break down a lesson, textbook section, or lecture note.' },
  { icon: 'create-outline', title: 'Practice', text: 'Generate questions, mark schemes, flashcards, and timed drills.' },
  { icon: 'checkmark-done-outline', title: 'Review', text: 'Check answers against command words, rubrics, and syllabus goals.' },
  { icon: 'calendar-outline', title: 'Plan', text: 'Build daily, weekly, or exam-countdown study schedules.' },
];

export default function StudyScreen() {
  const { sendMessage, setMode } = useARIA();
  const [level, setLevel] = useState('CSEC');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('');

  const sendStudyPrompt = (mode: StudyMode, prompt: string) => {
    setMode(mode);
    sendMessage(prompt);
  };

  const handleStartSession = () => {
    if (!subject.trim() && !topic.trim() && !goal.trim()) {
      Alert.alert('Add a subject or goal', 'Type a class, topic, paper, or study goal so ARIA can build a focused session.');
      return;
    }

    const mode: StudyMode = level === 'College' ? 'college' : level === 'Homework' ? 'homework' : 'papers';
    const prompt = [
      `Start a study session for ${level}.`,
      subject.trim() ? `Subject/course: ${subject.trim()}.` : '',
      topic.trim() ? `Topic or paper: ${topic.trim()}.` : '',
      goal.trim() ? `Goal: ${goal.trim()}.` : '',
      'Give me a short plan, then ask for the first question or notes if you need them.',
    ].filter(Boolean).join(' ');

    sendStudyPrompt(mode, prompt);
    setSubject('');
    setTopic('');
    setGoal('');
  };

  const handleTrack = (track: typeof CXC_TRACKS[number]) => {
    const prompt = `Create a ${track.exam} study map. Cover these subjects: ${track.subjects}. Explain paper structure: ${track.papers}. Include what to practice first, how to time papers, and how to review weak areas.`;
    sendStudyPrompt(track.exam === 'College' ? 'college' : 'papers', prompt);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Study Hub</Text>
          <Text style={styles.heroSub}>Homework help, CXC past-paper prep, and college learning in one place.</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.cardTitle}>Start a session</Text>
          <View style={styles.levelRow}>
            {LEVELS.map(item => (
              <TouchableOpacity
                key={item}
                style={[styles.levelBtn, level === item && styles.levelBtnActive]}
                onPress={() => setLevel(item)}
              >
                <Text style={[styles.levelText, level === item && styles.levelTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Subject or course, e.g. CSEC Math, BIO 101, English A"
            placeholderTextColor={COLORS.muted}
            value={subject}
            onChangeText={setSubject}
          />
          <TextInput
            style={styles.input}
            placeholder="Topic, paper, or assignment"
            placeholderTextColor={COLORS.muted}
            value={topic}
            onChangeText={setTopic}
          />
          <TextInput
            style={[styles.input, styles.goalInput]}
            placeholder="Goal, e.g. explain vectors, mark my essay plan, prepare Paper 02"
            placeholderTextColor={COLORS.muted}
            value={goal}
            onChangeText={setGoal}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={handleStartSession}>
            <Ionicons name="sparkles-outline" size={18} color={COLORS.text} />
            <Text style={styles.primaryBtnText}>Build study session</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.panel}>
          <Text style={styles.cardTitle}>Past-paper and course map</Text>
          {CXC_TRACKS.map(track => (
            <TouchableOpacity key={track.exam} style={styles.trackRow} onPress={() => handleTrack(track)}>
              <View style={styles.trackIcon}>
                <Ionicons name={track.exam === 'College' ? 'library-outline' : 'book-outline'} size={18} color={COLORS.accent} />
              </View>
              <View style={styles.trackText}>
                <Text style={styles.trackTitle}>{track.exam}</Text>
                <Text style={styles.trackDesc}>{track.subjects}</Text>
                <Text style={styles.trackMeta}>{track.papers}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={styles.cardTitle}>Quick actions</Text>
          <View style={styles.promptGrid}>
            {QUICK_PROMPTS.map(item => (
              <TouchableOpacity key={item.label} style={styles.promptBtn} onPress={() => sendStudyPrompt(item.mode, item.prompt)}>
                <Text style={styles.promptText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.toolGrid}>
          {STUDY_TOOLS.map((tool, index) => (
            <View key={tool.title} style={[styles.toolCard, index % 2 === 0 ? styles.toolCardMint : styles.toolCardAmber]}>
              <Ionicons name={tool.icon as any} size={19} color={index % 2 === 0 ? COLORS.mint : COLORS.amber} />
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={styles.toolText}>{tool.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.notePanel}>
          <View style={styles.noteHeader}>
            <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.mint} />
            <Text style={styles.noteTitle}>Past papers and official sources</Text>
          </View>
          <Text style={styles.noteText}>
            ARIA can organize past-paper practice, explain question types, and coach answers. For copyrighted paper text or the latest syllabus updates, provide the question or use online mode to verify official sources.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 96 },
  hero: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 8 },
  heroTitle: { color: COLORS.text, fontSize: 30, fontWeight: '800' },
  heroSub: { color: COLORS.muted, fontSize: 13, marginTop: 6, lineHeight: 19 },
  panel: {
    marginHorizontal: 12,
    marginTop: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.edge,
  },
  cardTitle: { color: COLORS.text, fontSize: 17, fontWeight: '800', marginBottom: 10 },
  levelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  levelBtn: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 14,
    justifyContent: 'center',
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.edge,
  },
  levelBtnActive: { backgroundColor: 'rgba(110,231,255,0.18)', borderColor: 'rgba(110,231,255,0.45)' },
  levelText: { color: COLORS.muted, fontSize: 12, fontWeight: '700' },
  levelTextActive: { color: COLORS.text },
  input: {
    backgroundColor: COLORS.surface2,
    color: COLORS.text,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.edge,
    marginTop: 8,
  },
  goalInput: { minHeight: 84 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(139,92,246,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.7)',
  },
  primaryBtnText: { color: COLORS.text, fontWeight: '800' },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  trackIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(110,231,255,0.12)',
  },
  trackText: { flex: 1 },
  trackTitle: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  trackDesc: { color: COLORS.muted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  trackMeta: { color: COLORS.accent, fontSize: 11, marginTop: 4 },
  promptGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  promptBtn: {
    backgroundColor: COLORS.surface2,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.edge,
  },
  promptText: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  toolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginHorizontal: 12, marginTop: 10 },
  toolCard: {
    width: '48%',
    minHeight: 128,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
  },
  toolCardMint: { backgroundColor: 'rgba(65,242,180,0.08)', borderColor: 'rgba(65,242,180,0.22)' },
  toolCardAmber: { backgroundColor: 'rgba(247,185,85,0.08)', borderColor: 'rgba(247,185,85,0.22)' },
  toolTitle: { color: COLORS.text, fontSize: 15, fontWeight: '800', marginTop: 10 },
  toolText: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  notePanel: {
    margin: 12,
    marginTop: 10,
    padding: 15,
    borderRadius: 18,
    backgroundColor: 'rgba(255,122,162,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,122,162,0.22)',
  },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  noteTitle: { color: COLORS.text, fontWeight: '800' },
  noteText: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
});
