import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Switch, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useARIA } from '../services/ARIAContext';
import { NotificationService } from '../services/NotificationService';
import { VoiceService } from '../services/VoiceService';
import { AIEngineService } from '../services/AIEngineService';

const COLORS = {
  bg: '#07111f',
  glass: 'rgba(255,255,255,0.08)',
  glass2: 'rgba(255,255,255,0.12)',
  edge: 'rgba(255,255,255,0.14)',
  accent: '#6ee7ff',
  accent2: '#8b5cf6',
  text: '#eef6ff',
  muted: '#91a4be',
  green: '#41f2b4',
  red: '#ff6a8b',
};

export default function SettingsScreen({ navigation }: any) {
  const { isOnline, setOnline, subscriptionLevel } = useARIA();
  const [wakePhrase, setWakePhrase] = useState('Hey ARIA');
  const [notifications, setNotifications] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [whatsAppPhone, setWhatsAppPhone] = useState('');
  const [whatsAppToken, setWhatsAppToken] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const [voicePref, ttsPref, notifPref, wake, waPhone, waToken] = await Promise.all([
      AsyncStorage.getItem('aria_voice_input_enabled'),
      AsyncStorage.getItem('aria_tts_enabled'),
      AsyncStorage.getItem('aria_notifications_enabled'),
      VoiceService.getWakePhrase(),
      AsyncStorage.getItem('whatsapp_phone_number_id'),
      AsyncStorage.getItem('whatsapp_access_token'),
    ]);
    setVoiceEnabled(voicePref !== 'false');
    setTtsEnabled(ttsPref !== 'false');
    setNotifications(notifPref !== 'false');
    setWakePhrase(wake || 'Hey ARIA');
    setWhatsAppPhone(waPhone || '');
    setWhatsAppToken(waToken || '');
    await NotificationService.initialize();
  };

  const updateVoiceEnabled = async (value: boolean) => {
    setVoiceEnabled(value);
    await VoiceService.setVoiceInputEnabled(value);
  };

  const updateTTSEnabled = async (value: boolean) => {
    setTtsEnabled(value);
    await VoiceService.setTTSEnabled(value);
    if (!value) await VoiceService.stopSpeaking();
  };

  const updateNotifications = async (value: boolean) => {
    setNotifications(value);
    await AsyncStorage.setItem('aria_notifications_enabled', String(value));
  };

  const saveWakePhrase = async () => {
    await VoiceService.setWakePhrase(wakePhrase);
    Alert.alert('Saved', 'The wake phrase was saved.');
  };

  const Section = ({ title, children }: any) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );

  const SettingRow = ({ label, desc, value, onValueChange, icon }: any) => (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}><Ionicons name={icon} size={18} color={COLORS.accent} /></View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDesc}>{desc}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#233248', true: '#6b5cff' }} thumbColor={value ? COLORS.accent : '#9aa6b2'} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Settings</Text>
          <Text style={styles.heroSub}>Manage your AI study experience.</Text>
        </View>

        <Section title="Subscription">
          <View style={styles.subRow}>
            <View>
              <Text style={styles.settingLabel}>Current Plan: <Text style={{color: COLORS.accent, textTransform: 'uppercase'}}>{subscriptionLevel}</Text></Text>
              <Text style={styles.settingDesc}>Manage your features and limits.</Text>
            </View>
            <TouchableOpacity
              style={styles.manageBtn}
              onPress={() => navigation.navigate('Subscription')}
            >
              <Text style={styles.manageBtnText}>Change</Text>
            </TouchableOpacity>
          </View>
        </Section>

        <Section title="Runtime">
          <SettingRow
            label="Voice input"
            desc="Tap the mic to dictate prompts"
            value={voiceEnabled}
            onValueChange={updateVoiceEnabled}
            icon="mic-outline"
          />
          <View style={styles.divider} />
          <SettingRow
            label="Text-to-speech"
            desc="ARIA reads short replies aloud"
            value={ttsEnabled}
            onValueChange={updateTTSEnabled}
            icon="volume-high-outline"
          />
          <View style={styles.divider} />
          <SettingRow
            label="Notifications"
            desc="Task reminders and alerts"
            value={notifications}
            onValueChange={updateNotifications}
            icon="notifications-outline"
          />
        </Section>

        <Section title="Wake phrase">
          <TextInput style={styles.input} value={wakePhrase} onChangeText={setWakePhrase} placeholder="Hey ARIA" placeholderTextColor={COLORS.muted} />
          <TouchableOpacity style={styles.primaryBtn} onPress={saveWakePhrase}><Text style={styles.primaryBtnText}>Save wake phrase</Text></TouchableOpacity>
        </Section>

        <Section title="WhatsApp bridge">
          <Text style={styles.settingDesc}>Backend configuration for WhatsApp bot.</Text>
          <Text style={styles.inputLabel}>Phone number ID</Text>
          <TextInput style={styles.input} value={whatsAppPhone} onChangeText={setWhatsAppPhone} placeholder="Phone number ID" placeholderTextColor={COLORS.muted} autoCapitalize="none" />
          <TouchableOpacity style={styles.primaryBtn} onPress={async () => {
            await AsyncStorage.setItem('whatsapp_phone_number_id', whatsAppPhone.trim());
            await AsyncStorage.setItem('whatsapp_access_token', whatsAppToken.trim());
            Alert.alert('Saved', 'WhatsApp configuration saved.');
          }}><Text style={styles.primaryBtnText}>Save config</Text></TouchableOpacity>
        </Section>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  hero: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 6 },
  heroTitle: { color: COLORS.text, fontSize: 28, fontWeight: '700', letterSpacing: 0.2 },
  heroSub: { color: COLORS.muted, fontSize: 13, marginTop: 6 },
  section: { marginHorizontal: 12, marginTop: 12 },
  sectionTitle: { color: '#c3d6f1', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.8 },
  card: { backgroundColor: COLORS.glass, borderRadius: 22, padding: 16, borderWidth: 1, borderColor: COLORS.edge },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: COLORS.glass2, alignItems: 'center', justifyContent: 'center' },
  settingInfo: { flex: 1 },
  settingLabel: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  settingDesc: { color: COLORS.muted, fontSize: 12, marginTop: 2, lineHeight: 18 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 14 },
  inputLabel: { color: '#cfe4ff', fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 2 },
  keyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, backgroundColor: COLORS.glass2, color: COLORS.text, borderRadius: 16, borderWidth: 1, borderColor: COLORS.edge, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10 },
  iconBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.glass2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.edge },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  primaryBtn: { flex: 1, minHeight: 46, backgroundColor: 'rgba(110,231,255,0.18)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(110,231,255,0.35)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, marginTop: 2 },
  primaryBtnText: { color: COLORS.text, fontWeight: '700' },
  secondaryBtn: { minHeight: 46, paddingHorizontal: 16, backgroundColor: COLORS.glass2, borderRadius: 16, borderWidth: 1, borderColor: COLORS.edge, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  secondaryBtnText: { color: COLORS.accent, fontWeight: '700' },
  note: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: 10 },
});
