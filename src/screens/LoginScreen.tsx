import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../services/SupabaseService';

const COLORS = {
  bg: '#0a0a0f',
  surface: '#13131a',
  accent: '#00d4ff',
  accent2: '#7c3aed',
  text: '#e8e8f0',
  muted: '#737396',
  border: '#1e1e35',
};

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        Alert.alert('Success', 'Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigation.replace('Subscription');
      }
    } catch (error: any) {
      Alert.alert('Auth Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <TouchableOpacity
          style={styles.logoContainer}
          onLongPress={() => {
            Alert.prompt(
              "Admin Access",
              "Enter admin password",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Login",
                  onPress: (pass) => {
                    if (pass === 'admin123') {
                      navigation.replace('AdminDashboard');
                    } else {
                      Alert.alert("Error", "Invalid password");
                    }
                  }
                }
              ],
              "secure-text"
            );
          }}
          delayLongPress={3000}
        >
          <Text style={styles.logoText}>A</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Welcome to ARIA Study</Text>
        <Text style={styles.subtitle}>Your personal AI study assistant</Text>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Login'}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.secondaryButtonText}>
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  logoContainer: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: COLORS.accent2, alignItems: 'center', justifyContent: 'center',
    marginBottom: 24, borderWidth: 2, borderColor: COLORS.accent,
  },
  logoText: { color: '#fff', fontWeight: 'bold', fontSize: 40 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: COLORS.muted, fontSize: 16, marginBottom: 32 },
  inputGroup: { width: '100%', gap: 16, marginBottom: 24 },
  input: {
    backgroundColor: COLORS.surface, color: COLORS.text,
    borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  button: {
    backgroundColor: COLORS.accent2, width: '100%', padding: 16,
    borderRadius: 12, alignItems: 'center', shadowColor: COLORS.accent, shadowOpacity: 0.3, shadowRadius: 10,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  secondaryButton: { marginTop: 24 },
  secondaryButtonText: { color: COLORS.accent, fontSize: 14 },
});
