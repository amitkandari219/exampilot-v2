import { supabase } from '../lib/supabase.js';

export async function getProfile(userId: string) {
  // Select only core profile fields guaranteed to exist in every schema version
  const { data, error } = await supabase
    .from('user_profiles')
    .select('name, exam_date')
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);

  // Optional columns that may not exist in all schema versions — fetch separately
  let avatarUrl: string | null = null;
  const { data: avatarData, error: avatarErr } = await supabase
    .from('user_profiles')
    .select('avatar_url')
    .eq('id', userId)
    .single();
  if (!avatarErr && avatarData) {
    avatarUrl = (avatarData as unknown as { avatar_url: string | null }).avatar_url ?? null;
  }

  let attemptNumber: string | null = null;
  const { data: attemptData, error: attemptErr } = await supabase
    .from('user_profiles')
    .select('attempt_number')
    .eq('id', userId)
    .single();
  if (!attemptErr && attemptData) {
    attemptNumber = (attemptData as unknown as { attempt_number: string | null }).attempt_number ?? null;
  }

  return {
    name: data.name || '',
    exam_date: data.exam_date || null,
    avatar_url: avatarUrl,
    attempt_number: attemptNumber,
  };
}

export async function updateProfile(
  userId: string,
  updates: { name?: string; exam_date?: string; avatar_url?: string }
) {
  const allowed: Record<string, string> = {};
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
