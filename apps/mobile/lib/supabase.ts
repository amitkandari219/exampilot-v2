import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const rawKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const isDemoMode = !rawUrl || !rawUrl.startsWith('https://');

const supabaseUrl = isDemoMode ? 'https://demo.supabase.co' : rawUrl;
const supabaseAnonKey = isDemoMode
  ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
  : rawKey;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: !isDemoMode,
      persistSession: !isDemoMode,
      detectSessionInUrl: false,
    },
  },
);
