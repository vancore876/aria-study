import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Switch, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useARIA, Task } from '../services/ARIAContext';
import { NotificationService } from '../services/NotificationService';
import { TaskSchedulerService } from '../services/TaskSchedulerService';

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
  red: '#ff4466',
};

const PRESET_TASKS = [
  { title: 'Past Paper Practice', description: 'Complete one timed CXC/CAPE past-paper section and review corrections', schedule: 'Daily at 7 PM' },
  { title: 'Lecture Review', description: 'Summarize today\'s college notes into flashcards and weak areas', schedule: 'Every weekday' },
  { title: 'SBA Milestone', description: 'Work on research question, data, analysis, or final presentation', schedule: 'Saturday morning' },
  { title: 'Essay Draft Check', description: 'Revise thesis, paragraph evidence, citations, and conclusion', schedule: 'Tomorrow' },
  { title: 'Math Drill', description: 'Do 20 minutes of algebra, statistics, or problem-solving practice', schedule: 'Daily at 6 PM' },
];

export default function TasksScreen() {
  const { tasks, addTask, removeTask, toggleTask } = useARIA();
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSchedule, setNewSchedule] = useState('');

  const handleAddTask = async () => {
    if (!newTitle.trim()) return Alert.alert('Enter a title');

    await NotificationService.initialize();

    const nextRun = TaskSchedulerService.parseNaturalTime(newSchedule || 'in 1 hour');
    const secondsUntil = Math.max(1, Math.floor((nextRun - Date.now()) / 1000));
    const title = newTitle.trim();
    const description = newDesc.trim() || title;

    addTask({
      title,
      description,
      schedule: newSchedule || 'once',
      nextRun,
      enabled: true,
      action: 'notify',
    });

    await NotificationService.scheduleNotification(
      title,
      description,
      secondsUntil
    );

    setNewTitle('');
    setNewDesc('');
    setNewSchedule('');
    setModalVisible(false);
    Alert.alert('Task created', `"${title}" has been scheduled.`);
  };

  const handlePresetTask = async (preset: typeof PRESET_TASKS[0]) => {
    addTask({
      title: preset.title,
      description: preset.description,
      schedule: preset.schedule,
      nextRun: Date.now() + 60 * 60 * 1000,
      enabled: true,
      action: 'notify',
    });

    await NotificationService.scheduleNotification(
      preset.title,
      preset.description,
      3600
    );

    Alert.alert('Added', `"${preset.title}" reminder created.`);
  };

  const handleDelete = (task: Task) => {
    Alert.alert(
      'Delete Reminder',
      `Remove "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeTask(task.id) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Study Planner</Text>
            <Text style={styles.headerSub}>{tasks.length} saved reminders</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {tasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Reminders</Text>
            {tasks.map(task => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskMain}>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskDesc}>{task.description}</Text>
                    <Text style={styles.taskSchedule}>{task.schedule}</Text>
                  </View>
                  <View style={styles.taskActions}>
                    <Switch
                      value={task.enabled}
                      onValueChange={() => toggleTask(task.id)}
                      trackColor={{ false: COLORS.surface2, true: COLORS.accent2 }}
                      thumbColor={task.enabled ? COLORS.accent : COLORS.muted}
                    />
                    <TouchableOpacity onPress={() => handleDelete(task)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={16} color={COLORS.red} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Add Templates</Text>
          {PRESET_TASKS.map((preset, i) => (
            <TouchableOpacity
              key={i}
              style={styles.presetCard}
              onPress={() => handlePresetTask(preset)}
            >
              <View style={styles.presetIcon}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.accent} />
              </View>
              <View style={styles.presetInfo}>
                <Text style={styles.presetTitle}>{preset.title}</Text>
                <Text style={styles.presetDesc}>{preset.description}</Text>
                <Text style={styles.presetSchedule}>{preset.schedule}</Text>
              </View>
              <Ionicons name="add-circle-outline" size={22} color={COLORS.accent} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Reminder Examples</Text>
          <View style={styles.voiceCard}>
            {[
              '"Remind me to revise CSEC Math in 2 hours"',
              '"Set a past-paper practice block for tomorrow"',
              '"Remind me to finish my lab report tonight"',
              '"Set a study task for Caribbean Studies at 7 PM"',
            ].map((cmd, i) => (
              <View key={i} style={styles.voiceCmd}>
                <Ionicons name="mic-outline" size={14} color={COLORS.accent} />
                <Text style={styles.voiceCmdText}>{cmd}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Study Reminder</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Reminder title *"
              placeholderTextColor={COLORS.muted}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Description (optional)"
              placeholderTextColor={COLORS.muted}
              value={newDesc}
              onChangeText={setNewDesc}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Schedule, e.g. 'in 2 hours', 'tomorrow'"
              placeholderTextColor={COLORS.muted}
              value={newSchedule}
              onChangeText={setNewSchedule}
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveModalBtn} onPress={handleAddTask}>
                <Text style={styles.saveModalText}>Create Reminder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 96 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingBottom: 12,
  },
  headerTitle: { color: COLORS.text, fontSize: 24, fontWeight: '800' },
  headerSub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  addBtn: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: COLORS.accent2,
    alignItems: 'center', justifyContent: 'center',
  },
  section: { marginHorizontal: 12, marginBottom: 16 },
  sectionTitle: { color: COLORS.muted, fontSize: 13, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  taskCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  taskMain: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  taskInfo: { flex: 1 },
  taskTitle: { color: COLORS.text, fontWeight: 'bold', fontSize: 15 },
  taskDesc: { color: COLORS.muted, fontSize: 13, marginTop: 2, lineHeight: 18 },
  taskSchedule: { color: COLORS.accent, fontSize: 11, marginTop: 4 },
  taskActions: { alignItems: 'center', gap: 8 },
  deleteBtn: { padding: 4 },
  presetCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: 14, padding: 14, marginBottom: 8, gap: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  presetIcon: {
    width: 36, height: 36, borderRadius: 11, backgroundColor: COLORS.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
  presetInfo: { flex: 1 },
  presetTitle: { color: COLORS.text, fontWeight: '700', fontSize: 14 },
  presetDesc: { color: COLORS.muted, fontSize: 12, marginTop: 2, lineHeight: 17 },
  presetSchedule: { color: COLORS.accent + '90', fontSize: 11, marginTop: 4 },
  voiceCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, gap: 10,
  },
  voiceCmd: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  voiceCmdText: { color: COLORS.muted, fontSize: 13, fontStyle: 'italic', flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: '#00000090', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, gap: 12,
  },
  modalTitle: { color: COLORS.text, fontWeight: 'bold', fontSize: 20, marginBottom: 4 },
  modalInput: {
    backgroundColor: COLORS.surface2, color: COLORS.text,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, borderWidth: 1, borderColor: COLORS.border,
  },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelModalBtn: {
    flex: 1, backgroundColor: COLORS.surface2, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  cancelModalText: { color: COLORS.muted, fontWeight: '600' },
  saveModalBtn: {
    flex: 2, backgroundColor: COLORS.accent2, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },
  saveModalText: { color: '#fff', fontWeight: 'bold' },
});
