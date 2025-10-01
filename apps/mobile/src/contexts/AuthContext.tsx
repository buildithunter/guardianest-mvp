import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import {
  supabase,
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getProfile,
  createProfile,
  getChildByInviteCode,
  createChild,
} from '@guardianest/shared';
import type { Profile, Child } from '@guardianest/shared';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpAsParent: (email: string, password: string, dob?: string) => Promise<{ error: any }>;
  signInWithInviteCode: (inviteCode: string) => Promise<{ error: any; child?: Child }>;
  linkChildToParent: (parentEmail: string, password: string, childName: string, childAge: number) => Promise<{ error: any; inviteCode?: string }>;
  signOutUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await getProfile(userId);
      if (error) {
        console.error('Error loading profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await signIn(email, password);
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUpAsParent = async (email: string, password: string, dob?: string) => {
    try {
      setLoading(true);
      
      // Sign up the user
      const { data: authData, error: authError } = await signUp(email, password);
      if (authError) {
        return { error: authError };
      }

      if (authData.user) {
        // Create parent profile
        const { error: profileError } = await createProfile({
          id: authData.user.id,
          role: 'parent',
          dob: dob || undefined,
          tier: 'free',
        });
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
          return { error: profileError };
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signInWithInviteCode = async (inviteCode: string) => {
    try {
      setLoading(true);
      
      // Find child by invite code
      const { data: child, error: childError } = await getChildByInviteCode(inviteCode);
      if (childError || !child) {
        return { error: childError || new Error('Invalid invite code') };
      }

      // For demo purposes, we'll create a simple auth session for the child
      // In production, you'd want a more secure approach
      const childAuthData = {
        id: `child_${child.id}`,
        email: `${child.name.toLowerCase()}@child.guardianest`,
        created_at: child.created_at,
      } as User;

      // You would typically handle child authentication differently
      // This is a simplified approach for the MVP
      
      return { error: null, child };
    } catch (error) {
      return { error, child: undefined };
    }
  };

  const linkChildToParent = async (
    parentEmail: string,
    password: string,
    childName: string,
    childAge: number
  ) => {
    try {
      setLoading(true);
      
      // First sign in as parent to get parent ID
      const { data: authData, error: authError } = await signIn(parentEmail, password);
      if (authError || !authData.user) {
        return { error: authError || new Error('Invalid parent credentials') };
      }

      // Create child record
      const { data: child, error: childError } = await createChild({
        parent_id: authData.user.id,
        name: childName,
        age: childAge,
      });

      if (childError || !child) {
        return { error: childError || new Error('Failed to create child') };
      }

      return { error: null, inviteCode: child.invite_code };
    } catch (error) {
      return { error, inviteCode: undefined };
    }
  };

  const signOutUser = async () => {
    try {
      setLoading(true);
      await signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  const value: AuthContextType = {
    session,
    user,
    profile,
    loading,
    signInWithEmail,
    signUpAsParent,
    signInWithInviteCode,
    linkChildToParent,
    signOutUser,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
