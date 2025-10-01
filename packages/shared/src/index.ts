// Database Types
export interface Profile {
  id: string;
  role: 'parent' | 'child';
  dob: string;
  tier: 'free' | 'premium' | 'family';
  created_at: string;
  updated_at: string;
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  age: number;
  invite_code?: string;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  child_id: string;
  daily_turn_cap: number;
  bedtime_start: string; // HH:MM format
  bedtime_end: string;   // HH:MM format
  subjects: string[];
  created_at: string;
  updated_at: string;
}

export interface Usage {
  id: string;
  child_id: string;
  date: string; // YYYY-MM-DD
  turns: number;
  stories: number;
  seconds_tts: number;
  created_at: string;
}

export interface Subscription {
  id: string;
  profile_id: string;
  plan: 'free' | 'premium' | 'family';
  source: 'stripe' | 'apple' | 'google';
  status: 'active' | 'cancelled' | 'expired';
  created_at: string;
  updated_at: string;
}

// API Types
export interface AIRequest {
  text: string;
  type: 'homework' | 'story';
  childAge?: number;
}

export interface AIResponse {
  response: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OCRRequest {
  image: string; // base64 encoded
}

export interface OCRResponse {
  text: string;
  confidence: number;
}

// Auth Types
export interface AuthSession {
  user: {
    id: string;
    email?: string;
    role: 'parent' | 'child';
  };
  access_token: string;
  refresh_token: string;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Export OCR utilities
export * from './ocr';
export * from './supabase';
export * from './database.types';
