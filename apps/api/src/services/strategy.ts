import { supabase } from '../lib/supabase.js';
import { StrategyMode, StrategyParams, OnboardingPayload, CustomizePayload } from '../types/index.js';

// Hardcoded defaults matching the seed data — used when DB lookup isn't needed
const modeDefaults: Record<StrategyMode, StrategyParams> = {
  conservative: {
    revision_frequency: 5, daily_new_topics: 1, pyq_weight: 35,
    answer_writing_sessions: 3, current_affairs_time: 45, optional_ratio: 20,
    test_frequency: 3, break_days: 4, deep_study_hours: 3,
    revision_backlog_limit: 10, csat_time: 20, essay_practice: 2,
  },
  aggressive: {
    revision_frequency: 3, daily_new_topics: 3, pyq_weight: 50,
    answer_writing_sessions: 6, current_affairs_time: 60, optional_ratio: 25,
    test_frequency: 6, break_days: 2, deep_study_hours: 5,
    revision_backlog_limit: 15, csat_time: 30, essay_practice: 4,
  },
  balanced: {
    revision_frequency: 4, daily_new_topics: 2, pyq_weight: 40,
    answer_writing_sessions: 4, current_affairs_time: 50, optional_ratio: 22,
    test_frequency: 4, break_days: 3, deep_study_hours: 4,
    revision_backlog_limit: 12, csat_time: 25, essay_practice: 3,
  },
  working_professional: {
    revision_frequency: 7, daily_new_topics: 1, pyq_weight: 45,
    answer_writing_sessions: 3, current_affairs_time: 30, optional_ratio: 20,
    test_frequency: 2, break_days: 4, deep_study_hours: 2,
    revision_backlog_limit: 8, csat_time: 15, essay_practice: 2,
  },
};

export async function getDefaultParams(mode: StrategyMode): Promise<StrategyParams> {
  // Try DB first, fall back to hardcoded
  const { data } = await supabase
    .from('strategy_mode_defaults')
    .select('param_name, param_value')
    .eq('mode', mode);

  if (data && data.length > 0) {
    const params: Record<string, number> = {};
    for (const row of data) {
      params[row.param_name] = parseFloat(row.param_value);
    }
    return params as unknown as StrategyParams;
  }

  return modeDefaults[mode];
}

export async function completeOnboarding(userId: string, payload: OnboardingPayload) {
  const params = await getDefaultParams(payload.chosen_mode);

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      name: payload.name,
      exam_date: payload.exam_date,
      daily_hours: payload.daily_hours,
      strategy_mode: payload.chosen_mode,
      strategy_params: params,
      onboarding_completed: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getStrategy(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('strategy_mode, strategy_params, daily_hours, current_mode')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function switchMode(userId: string, mode: StrategyMode) {
  const params = await getDefaultParams(mode);

  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      strategy_mode: mode,
      strategy_params: params,
      mode_switched_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function customizeParams(userId: string, payload: CustomizePayload) {
  // First get current params
  const { data: current, error: fetchError } = await supabase
    .from('user_profiles')
    .select('strategy_params')
    .eq('id', userId)
    .single();

  if (fetchError) throw fetchError;

  const merged = { ...current.strategy_params, ...payload.params };

  const { data, error } = await supabase
    .from('user_profiles')
    .update({ strategy_params: merged })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
