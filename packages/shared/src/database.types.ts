export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      children: {
        Row: {
          id: string
          parent_id: string
          name: string
          age: number
          invite_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          name: string
          age: number
          invite_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          name?: string
          age?: number
          invite_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          role: 'parent' | 'child'
          dob: string | null
          tier: 'free' | 'premium' | 'family'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'parent' | 'child'
          dob?: string | null
          tier?: 'free' | 'premium' | 'family'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'parent' | 'child'
          dob?: string | null
          tier?: 'free' | 'premium' | 'family'
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          child_id: string
          daily_turn_cap: number
          bedtime_start: string
          bedtime_end: string
          subjects: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          child_id: string
          daily_turn_cap?: number
          bedtime_start?: string
          bedtime_end?: string
          subjects?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          child_id?: string
          daily_turn_cap?: number
          bedtime_start?: string
          bedtime_end?: string
          subjects?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          profile_id: string
          plan: 'free' | 'premium' | 'family'
          source: 'stripe' | 'apple' | 'google'
          status: 'active' | 'cancelled' | 'expired'
          external_id: string | null
          started_at: string
          ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          plan?: 'free' | 'premium' | 'family'
          source?: 'stripe' | 'apple' | 'google'
          status?: 'active' | 'cancelled' | 'expired'
          external_id?: string | null
          started_at?: string
          ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          plan?: 'free' | 'premium' | 'family'
          source?: 'stripe' | 'apple' | 'google'
          status?: 'active' | 'cancelled' | 'expired'
          external_id?: string | null
          started_at?: string
          ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      usage: {
        Row: {
          id: string
          child_id: string
          date: string
          turns: number
          stories: number
          seconds_tts: number
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          date?: string
          turns?: number
          stories?: number
          seconds_tts?: number
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          date?: string
          turns?: number
          stories?: number
          seconds_tts?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_plan: 'free' | 'premium' | 'family'
      subscription_source: 'stripe' | 'apple' | 'google'
      subscription_status: 'active' | 'cancelled' | 'expired'
      user_role: 'parent' | 'child'
      user_tier: 'free' | 'premium' | 'family'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
