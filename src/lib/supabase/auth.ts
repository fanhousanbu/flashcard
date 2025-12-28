import { supabase } from './client';
import type { Profile } from '../types/profile';

export async function signUp(email: string, password: string, username?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username || email.split('@')[0],
      },
    },
  });

  if (error) throw error;

  // Profile will be automatically created by the database trigger
  // The username from metadata will be used by the trigger
  
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(
  userId: string, 
  updates: Partial<Pick<Profile, 'username' | 'avatar_url'>>
) {
  // Use an explicit type to avoid TypeScript inference issues
  const updateData = { ...updates };
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updateData as never)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function resendVerificationEmail(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });

  if (error) throw error;
}

export async function verifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) throw error;
  return data;
}

