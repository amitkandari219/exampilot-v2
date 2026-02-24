import { supabase } from '../lib/supabase.js';
import { StrategyMode, StrategyParams, OnboardingPayload, CustomizePayload, PersonaParams } from '../types/index.js';

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

const personaDefaults: Record<StrategyMode, PersonaParams> = {
  conservative: {
    fatigue_threshold: 85,
    buffer_capacity: 0.20,
    fsrs_target_retention: 0.85,
    burnout_threshold: 65,
  },
  balanced: {
    fatigue_threshold: 85,
    buffer_capacity: 0.15,
    fsrs_target_retention: 0.90,
    burnout_threshold: 75,
  },
  aggressive: {
    fatigue_threshold: 85,
    buffer_capacity: 0.10,
    fsrs_target_retention: 0.95,
    burnout_threshold: 80,
  },
  working_professional: {
    fatigue_threshold: 85,
    buffer_capacity: 0.25,
    fsrs_target_retention: 0.85,
    burnout_threshold: 65,
  },
};

export async function getDefaultParams(mode: StrategyMode): Promise<StrategyParams> {
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

export function getPersonaDefaults(mode: StrategyMode): PersonaParams {
  return personaDefaults[mode];
}

export async function completeOnboarding(userId: string, payload: OnboardingPayload) {
  const params = await getDefaultParams(payload.chosen_mode);
  const persona = getPersonaDefaults(payload.chosen_mode);

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
      fatigue_threshold: persona.fatigue_threshold,
      buffer_capacity: persona.buffer_capacity,
      fsrs_target_retention: persona.fsrs_target_retention,
      burnout_threshold: persona.burnout_threshold,
    })
    .select()
    .single();

  if (error) throw error;

  // Insert first persona snapshot
  await supabase.from('persona_snapshots').insert({
    user_id: userId,
    strategy_mode: payload.chosen_mode,
    strategy_params: params,
    fatigue_threshold: persona.fatigue_threshold,
    buffer_capacity: persona.buffer_capacity,
    fsrs_target_retention: persona.fsrs_target_retention,
    burnout_threshold: persona.burnout_threshold,
    change_reason: 'initial_onboarding',
  });

  return data;
}

export async function getStrategy(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('strategy_mode, strategy_params, daily_hours, current_mode, fatigue_threshold, buffer_capacity, fsrs_target_retention, burnout_threshold')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function switchMode(userId: string, mode: StrategyMode) {
  const params = await getDefaultParams(mode);
  const persona = getPersonaDefaults(mode);

  // Close previous snapshot
  await supabase
    .from('persona_snapshots')
    .update({ valid_to: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('valid_to', 'infinity');

  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      strategy_mode: mode,
      strategy_params: params,
      mode_switched_at: new Date().toISOString(),
      fatigue_threshold: persona.fatigue_threshold,
      buffer_capacity: persona.buffer_capacity,
      fsrs_target_retention: persona.fsrs_target_retention,
      burnout_threshold: persona.burnout_threshold,
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  // Insert new snapshot
  await supabase.from('persona_snapshots').insert({
    user_id: userId,
    strategy_mode: mode,
    strategy_params: params,
    fatigue_threshold: persona.fatigue_threshold,
    buffer_capacity: persona.buffer_capacity,
    fsrs_target_retention: persona.fsrs_target_retention,
    burnout_threshold: persona.burnout_threshold,
    change_reason: 'mode_switch',
  });

  return data;
}

export async function customizeParams(userId: string, payload: CustomizePayload) {
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
