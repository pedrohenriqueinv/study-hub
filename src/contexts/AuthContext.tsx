'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { DEFAULT_PROFILE } from '@/lib/initialData';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (!isConfigured) {
      // Modo Demo/Convidado ativo com persistência local
      const savedUser = localStorage.getItem('synapse_demo_user');
      const savedProfile = localStorage.getItem('synapse_demo_profile');

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      } else {
        // Usuário de demonstração padrão (Pedro Henrique)
        const mockUser = {
          id: DEFAULT_PROFILE.id,
          email: 'pedro.henrique@synapse.edu',
          app_metadata: {},
          user_metadata: { full_name: 'Pedro Henrique' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as unknown as User;
        setUser(mockUser);
        localStorage.setItem('synapse_demo_user', JSON.stringify(mockUser));
      }

      if (savedProfile) {
        try {
          setProfile(JSON.parse(savedProfile));
        } catch {
          setProfile(DEFAULT_PROFILE);
        }
      } else {
        setProfile(DEFAULT_PROFILE);
        localStorage.setItem('synapse_demo_profile', JSON.stringify(DEFAULT_PROFILE));
      }

      setLoading(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Obter sessão atual
    supabase.auth.getSession().then((res: { data: { session: Session | null } }) => {
      const session = res.data.session;
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Ouvir alterações de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  async function fetchProfile(userId: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error);
      }

      if (data) {
        setProfile(data as Profile);
      } else {
        // Cria perfil básico se ainda não existir
        const newProfile: Partial<Profile> = {
          id: userId,
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Estudante',
          weekly_goal_hours: 25.0,
          daily_goal_minutes: 270,
        };
        await supabase.from('profiles').insert([newProfile]);
        setProfile(newProfile as Profile);
      }
    } catch (err) {
      console.error('Erro inesperado no perfil:', err);
    } finally {
      setLoading(false);
    }
  }

  async function signInWithEmail(email: string, password: string): Promise<{ error: string | null }> {
    if (!isConfigured) {
      // Simula login instantâneo no modo demo
      const mockUser = {
        id: 'user_demo_01',
        email,
        user_metadata: { full_name: email.split('@')[0] },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User;

      const mockProfile: Profile = {
        ...DEFAULT_PROFILE,
        full_name: email.split('@')[0],
      };

      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem('synapse_demo_user', JSON.stringify(mockUser));
      localStorage.setItem('synapse_demo_profile', JSON.stringify(mockProfile));
      return { error: null };
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return { error: 'Cliente Supabase não inicializado' };

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        return {
          error: 'E-mail não confirmado. No painel do Supabase, vá em Authentication > Users, clique nos ... do seu usuário e selecione "Auto Confirm", ou desative "Confirm email" em Providers > Email.',
        };
      }
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'E-mail ou senha incorretos.' };
      }
      return { error: error.message };
    }
    return { error: null };
  }

  async function signUpWithEmail(email: string, password: string, fullName?: string): Promise<{ error: string | null }> {
    if (!isConfigured) {
      const mockUser = {
        id: 'user_demo_01',
        email,
        user_metadata: { full_name: fullName || email.split('@')[0] },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User;

      const mockProfile: Profile = {
        ...DEFAULT_PROFILE,
        full_name: fullName || email.split('@')[0],
      };

      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem('synapse_demo_user', JSON.stringify(mockUser));
      localStorage.setItem('synapse_demo_profile', JSON.stringify(mockProfile));
      return { error: null };
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return { error: 'Cliente Supabase não inicializado' };

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      if (error.message.includes('rate limit') || (error as { code?: string }).code === 'over_email_send_rate_limit') {
        return {
          error: 'Limite de e-mails do Supabase atingido (3/hora). Para resolver definitivamente sem limites: desmarque "Confirm email" no painel do Supabase (Authentication > Providers > Email).',
        };
      }
      return { error: error.message };
    }

    return { error: null };
  }

  async function signInWithGoogle(): Promise<{ error: string | null }> {
    if (!isConfigured) {
      return signInWithEmail('aluno.google@synapse.edu', '123456');
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return { error: 'Cliente Supabase não inicializado' };

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    return { error: error ? error.message : null };
  }

  async function signOut(): Promise<void> {
    if (!isConfigured) {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('synapse_demo_user');
      localStorage.removeItem('synapse_demo_profile');
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  }

  async function resetPassword(email: string): Promise<{ error: string | null }> {
    if (!isConfigured) {
      return { error: null };
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return { error: 'Cliente Supabase não inicializado' };

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    return { error: error ? error.message : null };
  }

  async function updateProfile(updates: Partial<Profile>): Promise<void> {
    if (!profile) return;
    const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };
    setProfile(updated);

    if (!isConfigured) {
      localStorage.setItem('synapse_demo_profile', JSON.stringify(updated));
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (supabase && user) {
      await supabase.from('profiles').update(updates).eq('id', user.id);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
