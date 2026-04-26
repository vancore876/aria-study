import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Load values from .env via Expo constants if needed, but for now using direct strings for reliability
const supabaseUrl = 'https://hafgsdzldonkqoziqmcf.supabase.co';
const supabaseAnonKey = 'sb_publishable_x_XTnBINj-EBPmHt7WWOmQ_49noXS5X';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SupabaseService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async updateSubscription(userId: string, level: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ subscription_level: level })
      .eq('id', userId);
    return { data, error };
  },

  async saveChatMessage(message: any) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([message]);
    return { data, error };
  }
};
