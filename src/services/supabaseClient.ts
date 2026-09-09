/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iiqphphnywalbcsolhbj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcXBocGhueXdhbGJjc29saGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNjg3OTYsImV4cCI6MjEwMTk0NDc5Nn0.0z_6IvJvpWAyXOubFs5Yv5d64ZaHwTEdLIp4eQBGY2s';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project'));
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) return false;
    const { error } = await supabase.from('mms_madrasas').select('id').limit(1);
    if (error) {
      console.warn('Supabase ping warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase ping error:', err);
    return false;
  }
};
