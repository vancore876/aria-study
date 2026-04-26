import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useARIA } from '../services/ARIAContext';
import { useStripe } from '@stripe/stripe-react-native';
import { StripeService } from '../services/StripeService';
import { SupabaseService } from '../services/SupabaseService';
import { supabase } from '../services/SupabaseService';

const COLORS = {
  bg: '#0a0a0f',
  surface: '#13131a',
  accent: '#00d4ff',
  accent2: '#7c3aed',
  text: '#e8e8f0',
  muted: '#737396',
  border: '#1e1e35',
  gold: '#ffd700',
};

export default function SubscriptionScreen({ navigation }: any) {
  const { setSubscriptionLevel } = useARIA();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const stripe = useStripe(); // This might be null in Expo Go
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    { id: 'free', name: 'Free', price: '$0', features: ['5 AI Questions / day', 'Basic Study Planner', 'Ad supported'] },
    { id: 'pro', name: 'Pro Student', price: '$9.99', features: ['Unlimited AI Questions', 'Full Past Paper Access', 'Homework Scanner', 'WhatsApp Bridge'], recommended: true },
    { id: 'college', name: 'College Plus', price: '$19.99', features: ['Everything in Pro', 'Voice Mode', 'Exam Predictions', 'Priority Support'] },
  ];

  const handleSelect = async (planId: string) => {
    if (planId === 'free') {
      setSubscriptionLevel('free');
      navigation.replace('Main');
      return;
    }

    setLoading(planId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      // EXPO GO COMPATIBILITY CHECK
      if (!stripe || !stripe.initPaymentSheet) {
        Alert.alert(
          "Expo Go Mode",
          "Stripe is disabled in Expo Go. Simulating successful payment for testing...",
          [{ text: "OK", onPress: async () => {
            await SupabaseService.updateSubscription(user.id, planId);
            setSubscriptionLevel(planId);
            navigation.replace('Main');
          }}]
        );
        return;
      }

      // 1. Fetch Payment Intent from backend
      const { paymentIntent, ephemeralKey, customer } = await StripeService.createPaymentSheet(planId, user.email!, user.id);

      // 2. Initialize Payment Sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'ARIA Study Assistant',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          email: user.email,
        },
      });

      if (initError) throw initError;

      // 3. Present Payment Sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code !== 'Canceled') {
          Alert.alert('Error', presentError.message);
        }
      } else {
        // 4. Success! Update user profile in Supabase
        await SupabaseService.updateSubscription(user.id, planId);
        setSubscriptionLevel(planId);
        Alert.alert('Success', 'Your subscription is now active!');
        navigation.replace('Main');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Choose Your Plan</Text>
            <View style={{width: 24}} />
        </View>
        <Text style={styles.subtitle}>Unlock the full power of ARIA Study</Text>

        {plans.map((plan, i) => (
          <View key={i} style={[styles.card, plan.recommended && styles.recommendedCard]}>
            {plan.recommended && <View style={styles.badge}><Text style={styles.badgeText}>RECOMMENDED</Text></View>}
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planPrice}>{plan.price}<Text style={styles.pricePeriod}>/mo</Text></Text>

            <View style={styles.featureList}>
              {plan.features.map((f, j) => (
                <View key={j} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.accent} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.button, plan.recommended ? styles.buttonActive : styles.buttonSecondary]}
              onPress={() => handleSelect(plan.id)}
              disabled={loading !== null}
            >
              {loading === plan.id ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {plan.id === 'free' ? 'Get Started' : `Subscribe ${plan.price}`}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 20 },
  content: { padding: 20 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: COLORS.muted, fontSize: 16, textAlign: 'center', marginBottom: 30, marginTop: 10 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 24,
    marginBottom: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  recommendedCard: { borderColor: COLORS.accent, borderWidth: 2 },
  badge: {
    backgroundColor: COLORS.accent, paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12,
  },
  badgeText: { color: COLORS.bg, fontSize: 10, fontWeight: 'bold' },
  planName: { color: COLORS.text, fontSize: 20, fontWeight: 'bold' },
  planPrice: { color: COLORS.text, fontSize: 32, fontWeight: 'bold', marginVertical: 8 },
  pricePeriod: { fontSize: 16, color: COLORS.muted },
  featureList: { marginVertical: 20, gap: 12 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { color: COLORS.text, fontSize: 14 },
  button: { padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonActive: { backgroundColor: COLORS.accent2 },
  buttonSecondary: { backgroundColor: COLORS.border },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
