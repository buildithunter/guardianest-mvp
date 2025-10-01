import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// These will be replaced with actual values in production
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Database helpers
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const createProfile = async (profile: {
  id: string;
  role: 'parent' | 'child';
  dob?: string;
  tier?: 'free' | 'premium' | 'family';
}) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profile])
    .select()
    .single();
  return { data, error };
};

export const getChildren = async (parentId: string) => {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', parentId);
  return { data, error };
};

export const createChild = async (child: {
  parent_id: string;
  name: string;
  age: number;
}) => {
  const { data, error } = await supabase
    .from('children')
    .insert([child])
    .select()
    .single();
  return { data, error };
};

export const getChildByInviteCode = async (inviteCode: string) => {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('invite_code', inviteCode)
    .single();
  return { data, error };
};

export const getChildSettings = async (childId: string) => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('child_id', childId)
    .single();
  return { data, error };
};

export const updateChildSettings = async (
  childId: string,
  settings: Partial<{
    daily_turn_cap: number;
    bedtime_start: string;
    bedtime_end: string;
    subjects: string[];
  }>
) => {
  const { data, error } = await supabase
    .from('settings')
    .upsert([{ child_id: childId, ...settings }])
    .select()
    .single();
  return { data, error };
};

export const getTodayUsage = async (childId: string) => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('usage')
    .select('*')
    .eq('child_id', childId)
    .eq('date', today)
    .single();
  return { data, error };
};

export const incrementUsage = async (
  childId: string,
  type: 'turns' | 'stories',
  amount: number = 1,
  secondsTts: number = 0
) => {
  const today = new Date().toISOString().split('T')[0];
  
  // First try to get existing usage
  const { data: existing } = await getTodayUsage(childId);
  
  if (existing) {
    // Update existing record
    const updates: any = { seconds_tts: existing.seconds_tts + secondsTts };
    if (type === 'turns') {
      updates.turns = existing.turns + amount;
    } else {
      updates.stories = existing.stories + amount;
    }
    
    const { data, error } = await supabase
      .from('usage')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single();
    return { data, error };
  } else {
    // Create new record
    const newUsage: any = {
      child_id: childId,
      date: today,
      turns: type === 'turns' ? amount : 0,
      stories: type === 'stories' ? amount : 0,
      seconds_tts: secondsTts,
    };
    
    const { data, error } = await supabase
      .from('usage')
      .insert([newUsage])
      .select()
      .single();
    return { data, error };
  }
};
