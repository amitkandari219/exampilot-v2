import { supabase } from '../lib/supabase.js';

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('name, exam_date, avatar_url')
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);

  return {
    name: data.name || '',
    exam_date: data.exam_date || null,
    avatar_url: data.avatar_url || null,
  };
}

export async function updateProfile(
  userId: string,
  updates: { name?: string; exam_date?: string; avatar_url?: string }
) {
  const allowed: Record<string, any> = {};
  if (updates.name !== undefined) allowed.name = updates.name;
  if (updates.exam_date !== undefined) allowed.exam_date = updates.exam_date;
  if (updates.avatar_url !== undefined) allowed.avatar_url = updates.avatar_url;

  if (Object.keys(allowed).length === 0) {
    return { updated: false };
  }

  const { error } = await supabase
    .from('user_profiles')
    .update(allowed)
    .eq('id', userId);

  if (error) throw new Error(error.message);

  return { updated: true };
}
