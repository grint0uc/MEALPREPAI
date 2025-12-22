'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase';
import { User as DbUser } from '@/types/database';

interface AuthContextType {
  user: User | null;
  dbUser: DbUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    // Set loading to false after a short delay to prevent hanging
    const fallbackTimer = setTimeout(() => {
      console.log('[AuthContext] Fallback timer triggered, setting loading to false');
      setLoading(false);
    }, 3000);

    const initializeAuth = async () => {
      try {
        console.log('[AuthContext] Initializing auth...');

        // Small delay to allow cookies to be set from server-side callback
        await new Promise(resolve => setTimeout(resolve, 100));

        // Get the current session
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        console.log('[AuthContext] Session result:', { hasSession: !!currentSession, userId: currentSession?.user?.id });

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);

          // Fetch user profile
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();

          if (profile) {
            setDbUser(profile as DbUser);
          }
        }
      } catch (error) {
        console.error('[AuthContext] Auth initialization error:', error);
      } finally {
        clearTimeout(fallbackTimer);
        setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();

        if (profile) {
          setDbUser(profile as DbUser);
        }
      } else {
        setDbUser(null);
      }
    });

    return () => {
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || '' },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Attempting sign in...');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error('[AuthContext] Sign in error:', error);
        return { error: error as Error | null };
      }

      console.log('[AuthContext] Sign in successful:', data);
      return { error: null };
    } catch (err: any) {
      console.error('[AuthContext] Unexpected sign in error:', err);
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDbUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });
    return { error: error as Error | null };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error as Error | null };
  };

  const refreshUser = async () => {
    if (user) {
      const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();

      if (profile) {
        setDbUser(profile as DbUser);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        dbUser,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
