import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../../../lib/supabase/client';
import * as authService from '../../../lib/supabase/auth';

export function useAuth() {
  const { user, profile, loading, setUser, setProfile, setLoading, reset } = useAuthStore();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        authService.getProfile(session.user.id).then(setProfile).catch(console.error);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        authService.getProfile(session.user.id).then(setProfile).catch(console.error);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setProfile, setLoading]);

  const signUp = async (email: string, password: string, username?: string) => {
    setLoading(true);
    try {
      const data = await authService.signUp(email, password, username);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await authService.signIn(email, password);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      reset();
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: { username?: string; avatar_url?: string }) => {
    if (!user) throw new Error('Not authenticated');
    setLoading(true);
    try {
      const updatedProfile = await authService.updateProfile(user.id, updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  };
}

