import { supabase } from '../lib/supabase.js';

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('name, exam_date, prelims_date, attempt_number, created_at, current_mode, daily_hours, study_approach, strategy_mode')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (!data) {
    return {
      name: '',
      exam_date: null,
      prelims_date: null,
      avatar_url: null,
      attempt_number: null,
      created_at: new Date().toISOString(),
      current_mode: 'prelims' as const,
      daily_hours: 6,
      study_approach: 'mixed',
      strategy_mode: 'balanced',
      onboarding_complete: false,
    };
  }

  return {
    name: data.name || '',
    exam_date: data.exam_date || null,
    prelims_date: data.prelims_date || null,
    avatar_url: null,
    attempt_number: data.attempt_number || null,
    created_at: data.created_at,
    current_mode: data.current_mode || 'prelims',
    daily_hours: data.daily_hours ?? 6,
    study_approach: data.study_approach || 'mixed',
    strategy_mode: data.strategy_mode || 'balanced',
  };
}

export async function updateProfile(
  userId: string,
  updates: { name?: string; exam_date?: string; daily_hours?: number; study_approach?: string }
) {
  const allowed: Record<string, string | number> = {};
  if (updates.name !== undefined) allowed.name = updates.name;
  if (updates.exam_date !== undefined) allowed.exam_date = updates.exam_date;
  if (updates.daily_hours !== undefined) allowed.daily_hours = updates.daily_hours;
  if (updates.study_approach !== undefined) allowed.study_approach = updates.study_approach;

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

export async function registerPushToken(userId: string, pushToken: string) {
  const { error } = await supabase
    .from('user_profiles')
    .update({ push_token: pushToken })
    .eq('id', userId);

  if (error) throw new Error(error.message);
  return { registered: true };
}
