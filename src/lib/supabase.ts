import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getUserId(): string {
  let userId = localStorage.getItem('anonymous_user_id');

  if (!userId) {
    userId = `anon_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    localStorage.setItem('anonymous_user_id', userId);
  }

  return userId;
}
