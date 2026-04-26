import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/SupabaseService';

const COLORS = {
  bg: '#0a0a0f',
  surface: '#13131a',
  accent: '#00d4ff',
  accent2: '#7c3aed',
  text: '#e8e8f0',
  muted: '#737396',
  border: '#1e1e35',
  success: '#4caf50'
};

export default function AdminDashboard({ navigation }: any) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    proUsers: 0,
    collegeUsers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    try {
      // 1. Get total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 2. Get breakdown
      const { data: profiles } = await supabase
        .from('profiles')
        .select('subscription_level');

      const proCount = profiles?.filter(p => p.subscription_level === 'pro').length || 0;
      const collegeCount = profiles?.filter(p => p.subscription_level === 'college').length || 0;

      // 3. Simple revenue calculation based on active levels
      const revenue = (proCount * 9.99) + (collegeCount * 19.99);

      setStats({
        totalUsers: userCount || 0,
        proUsers: proCount,
        collegeUsers: collegeCount,
        totalRevenue: Math.round(revenue * 100) / 100,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.replace('Login')}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Admin Panel</Text>
        <TouchableOpacity onPress={fetchStats}>
          <Ionicons name="refresh" size={24} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.accent} /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.statGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Users</Text>
              <Text style={styles.statValue}>{stats.totalUsers}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Revenue</Text>
              <Text style={[styles.statValue, { color: COLORS.success }]}>${stats.totalRevenue}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subscription Breakdown</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Free Users</Text>
              <Text style={styles.breakdownValue}>{stats.totalUsers - stats.proUsers - stats.collegeUsers}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Pro Users ($9.99)</Text>
              <Text style={styles.breakdownValue}>{stats.proUsers}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>College Users ($19.99)</Text>
              <Text style={styles.breakdownValue}>{stats.collegeUsers}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.btn} onPress={() => navigation.replace('Main')}>
            <Text style={styles.btnText}>Enter App as Admin</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  title: { color: COLORS.text, fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statGrid: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: COLORS.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  statLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 5 },
  statValue: { color: COLORS.text, fontSize: 24, fontWeight: 'bold' },
  section: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 16, marginBottom: 20 },
  sectionTitle: { color: COLORS.accent, fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  breakdownLabel: { color: COLORS.text },
  breakdownValue: { color: COLORS.muted },
  btn: { backgroundColor: COLORS.accent2, padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' }
});
