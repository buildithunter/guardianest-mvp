import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Server-side Supabase client with service role key
// This should only be used in server environments with the service_role key
export const createServerSupabaseClient = (
  supabaseUrl: string,
  supabaseServiceRoleKey: string
) => {
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Auth helpers
export const signUp = async (supabase: ReturnType<typeof createServerSupabaseClient>, email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (supabase: ReturnType<typeof createServerSupabaseClient>, email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const getCurrentUser = async (supabase: ReturnType<typeof createServerSupabaseClient>) => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Database helpers
export const getProfile = async (supabase: ReturnType<typeof createServerSupabaseClient>, userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const createProfile = async (
  supabase: ReturnType<typeof createServerSupabaseClient>,
  profile: Database['public']['Tables']['profiles']['Insert']
) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();
  return { data, error };
};

export const getChildren = async (supabase: ReturnType<typeof createServerSupabaseClient>, parentId: string) => {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', parentId);
  return { data, error };
};

export const createChild = async (
  supabase: ReturnType<typeof createServerSupabaseClient>,
  child: Database['public']['Tables']['children']['Insert']
) => {
  const { data, error } = await supabase
    .from('children')
    .insert(child)
    .select()
    .single();
  return { data, error };
};

export const getChildByInviteCode = async (supabase: ReturnType<typeof createServerSupabaseClient>, inviteCode: string) => {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('invite_code', inviteCode)
    .single();
  return { data, error };
};

export const getChildSettings = async (supabase: ReturnType<typeof createServerSupabaseClient>, childId: string) => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('child_id', childId)
    .single();
  return { data, error };
};

export const updateChildSettings = async (
  supabase: ReturnType<typeof createServerSupabaseClient>,
  childId: string,
  settings: Database['public']['Tables']['settings']['Update']
) => {
  const { data, error } = await supabase
    .from('settings')
    .upsert({ child_id: childId, ...settings })
    .select()
    .single();
  return { data, error };
};

export const getTodayUsage = async (supabase: ReturnType<typeof createServerSupabaseClient>, childId: string) => {
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
  supabase: ReturnType<typeof createServerSupabaseClient>,
  childId: string,
  type: 'turns' | 'stories',
  amount: number = 1,
  secondsTts: number = 0
) => {
  const today = new Date().toISOString().split('T')[0];
  
  // First try to get existing usage
  const { data: existing } = await getTodayUsage(supabase, childId);
  
  if (existing) {
    // Update existing record
    const updates: Database['public']['Tables']['usage']['Update'] = { 
      seconds_tts: existing.seconds_tts + secondsTts 
    };
    
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
    const newUsage: Database['public']['Tables']['usage']['Insert'] = {
      child_id: childId,
      date: today,
      turns: type === 'turns' ? amount : 0,
      stories: type === 'stories' ? amount : 0,
      seconds_tts: secondsTts,
    };
    
    const { data, error } = await supabase
      .from('usage')
      .insert(newUsage)
      .select()
      .single();
    return { data, error };
  }
};
