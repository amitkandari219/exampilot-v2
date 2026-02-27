import { supabase } from '../lib/supabase.js';
import type { StrategyMode, StrategyParams, PersonaParams, ExamMode } from '../types/index.js';

// ── Strategy mode defaults (single source of truth) ──

export const modeDefaults: Record<StrategyMode, StrategyParams> = {
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

export const personaDefaults: Record<StrategyMode, PersonaParams> = {
  conservative: {
    fatigue_threshold: 85,
    buffer_capacity: 0.20,
    fsrs_target_retention: 0.85,
    burnout_threshold: 65,
    buffer_deposit_rate: 0.30,
    buffer_withdrawal_rate: 0.40,
    velocity_target_multiplier: 0.85,
    revision_ratio_in_plan: 0.30,
    fatigue_sensitivity: 1.0,
    recalibration_order: ['consume_buffers', 'absorb', 'increase_hours'],
    scope_reduction_threshold: Infinity,
    pyq_weight_minimum: 1,
    weekend_boost: false,
  },
  balanced: {
    fatigue_threshold: 85,
    buffer_capacity: 0.15,
    fsrs_target_retention: 0.90,
    burnout_threshold: 75,
    buffer_deposit_rate: 0.30,
    buffer_withdrawal_rate: 0.50,
    velocity_target_multiplier: 1.0,
    revision_ratio_in_plan: 0.30,
    fatigue_sensitivity: 1.0,
    recalibration_order: ['absorb', 'consume_buffers', 'increase_hours', 'reduce_scope'],
    scope_reduction_threshold: 0.1,
    pyq_weight_minimum: 1,
    weekend_boost: false,
  },
  aggressive: {
    fatigue_threshold: 85,
    buffer_capacity: 0.10,
    fsrs_target_retention: 0.95,
    burnout_threshold: 80,
    buffer_deposit_rate: 0.25,
    buffer_withdrawal_rate: 0.50,
    velocity_target_multiplier: 1.15,
    revision_ratio_in_plan: 0.25,
    fatigue_sensitivity: 0.8,
    recalibration_order: ['absorb', 'reduce_scope', 'increase_hours'],
    scope_reduction_threshold: 0.1,
    pyq_weight_minimum: 1,
    weekend_boost: false,
  },
  working_professional: {
    fatigue_threshold: 85,
    buffer_capacity: 0.25,
    fsrs_target_retention: 0.85,
    burnout_threshold: 65,
    buffer_deposit_rate: 0.35,
    buffer_withdrawal_rate: 0.40,
    velocity_target_multiplier: 0.90,
    revision_ratio_in_plan: 0.30,
    fatigue_sensitivity: 1.2,
    recalibration_order: ['reduce_scope', 'consume_buffers', 'absorb'],
    scope_reduction_threshold: 0.1,
    pyq_weight_minimum: 3,
    weekend_boost: true,
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

// ── Mode config queries (leaf node — no service imports) ──

export interface ModeConfigEntry {
  subject_id: string;
  is_active: boolean;
  importance_modifier: number;
  revision_ratio: number | null;
}

export async function getModeConfig(mode: ExamMode): Promise<ModeConfigEntry[]> {
  const { data, error } = await supabase
    .from('mode_config')
    .select('subject_id, is_active, importance_modifier, revision_ratio')
    .eq('mode', mode);

  if (error) throw error;
  return (data || []) as ModeConfigEntry[];
}

export async function getActiveSubjectIds(userId: string): Promise<Set<string> | null> {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('current_mode')
    .eq('id', userId)
    .single();

  if (!profile) return null;

  const mode = profile.current_mode as ExamMode;

  if (mode === 'mains' || mode === 'post_prelims') return null;

  const config = await getModeConfig(mode);

  if (config.length === 0) return null;

  const { data: allSubjects } = await supabase
    .from('subjects')
    .select('id');

  const allIds = new Set((allSubjects || []).map((s: any) => s.id));
  const configMap = new Map(config.map((c) => [c.subject_id, c]));

  const activeIds = new Set<string>();
  for (const id of allIds) {
    const entry = configMap.get(id);
    if (!entry || entry.is_active) {
      activeIds.add(id);
    }
  }

  return activeIds;
}

export async function getImportanceModifiers(mode: ExamMode): Promise<Map<string, number>> {
  const config = await getModeConfig(mode);
  const modifiers = new Map<string, number>();
  for (const entry of config) {
    if (entry.importance_modifier !== 0) {
      modifiers.set(entry.subject_id, entry.importance_modifier);
    }
  }
  return modifiers;
}

export async function getModeRevisionRatio(mode: ExamMode): Promise<number | null> {
  const config = await getModeConfig(mode);
  for (const entry of config) {
    if (entry.revision_ratio != null) return entry.revision_ratio;
  }
  return null;
}
