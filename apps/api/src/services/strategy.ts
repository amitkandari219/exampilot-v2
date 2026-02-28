import { supabase } from '../lib/supabase.js';
import { StrategyMode, StrategyParams, OnboardingPayload, OnboardingV2Payload, OnboardingV2Answers, CustomizePayload, PersonaParams, ExamMode } from '../types/index.js';
import { getDefaultParams, getPersonaDefaults } from './modeConfig.js';
import { calculateVelocity } from './velocity.js';
import { regeneratePlan } from './planner.js';
import { toDateString, daysUntil } from '../utils/dateUtils.js';

// Re-export from modeConfig for backward compatibility
export { getDefaultParams, getPersonaDefaults } from './modeConfig.js';

export async function completeOnboarding(userId: string, payload: OnboardingPayload) {
  // Reset all previous session data before saving new onboarding
  await resetUserData(userId);

  const params = await getDefaultParams(payload.chosen_mode);
  const persona = getPersonaDefaults(payload.chosen_mode);

  // Compute fixed buffer_initial: days_remaining × buffer_capacity
  const examDate = new Date(payload.exam_date);
  const daysRemaining = daysUntil(examDate);
  const bufferInitial = daysRemaining * persona.buffer_capacity;

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
      buffer_deposit_rate: persona.buffer_deposit_rate,
      buffer_withdrawal_rate: persona.buffer_withdrawal_rate,
      velocity_target_multiplier: persona.velocity_target_multiplier,
      revision_ratio_in_plan: persona.revision_ratio_in_plan,
      fatigue_sensitivity: persona.fatigue_sensitivity,
      recalibration_order: persona.recalibration_order,
      scope_reduction_threshold: persona.scope_reduction_threshold === Infinity ? null : persona.scope_reduction_threshold,
      pyq_weight_minimum: persona.pyq_weight_minimum,
      weekend_boost: persona.weekend_boost,
      buffer_initial: bufferInitial,
      buffer_balance: bufferInitial,
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
    buffer_deposit_rate: persona.buffer_deposit_rate,
    buffer_withdrawal_rate: persona.buffer_withdrawal_rate,
    velocity_target_multiplier: persona.velocity_target_multiplier,
    revision_ratio_in_plan: persona.revision_ratio_in_plan,
    fatigue_sensitivity: persona.fatigue_sensitivity,
    recalibration_order: persona.recalibration_order,
    scope_reduction_threshold: persona.scope_reduction_threshold === Infinity ? null : persona.scope_reduction_threshold,
    pyq_weight_minimum: persona.pyq_weight_minimum,
    weekend_boost: persona.weekend_boost,
    change_reason: 'initial_onboarding',
  });

  return data;
}

function classifyModeV2Server(answers: OnboardingV2Answers & { daily_hours?: number; study_approach?: string }): StrategyMode {
  if (answers.user_type === 'working') return 'working_professional';
  let score = 0;

  // Daily hours signal (matches V1: 7+ → aggressive leaning)
  const dailyHours = answers.daily_hours || 0;
  if (dailyHours >= 7) score += 2;
  else if (dailyHours >= 5) score += 1;

  // Study approach signal (matches V1: "cover everything" → conservative)
  if (answers.study_approach === 'cover_everything' || answers.study_approach === 'thorough') score -= 2;
  else if (answers.study_approach === 'selective' || answers.study_approach === 'high_yield') score += 1;

  if (answers.attempt_number === 'third_plus') score += 2;
  else if (answers.attempt_number === 'second') score += 1;
  else score -= 1;
  if (answers.user_type === 'dropout') score += 2;
  if (answers.user_type === 'repeater') score += 1;
  if (answers.challenges.includes('time_management')) score -= 1;
  if (answers.challenges.includes('consistency')) score -= 1;
  if (answers.challenges.includes('syllabus_coverage')) score += 1;
  if (score >= 3) return 'aggressive';
  if (score <= -1) return 'conservative';
  return 'balanced';
}

export async function completeOnboardingV2(userId: string, payload: OnboardingV2Payload) {
  // Reset all previous session data before saving new onboarding
  await resetUserData(userId);

  const mode = payload.chosen_mode || classifyModeV2Server({
    ...payload.answers,
    daily_hours: payload.targets?.daily_hours,
  });
  const params = await getDefaultParams(mode);
  const persona = getPersonaDefaults(mode);

  // Compute fixed buffer_initial: days_remaining × buffer_capacity
  const examDate = new Date(payload.exam_date);
  const daysRemaining = daysUntil(examDate);
  const bufferInitial = daysRemaining * persona.buffer_capacity;

  // Upsert user profile with V2 fields
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      name: payload.answers.name,
      exam_date: payload.exam_date,
      daily_hours: payload.targets.daily_hours,
      strategy_mode: mode,
      strategy_params: params,
      onboarding_completed: true,
      fatigue_threshold: persona.fatigue_threshold,
      buffer_capacity: persona.buffer_capacity,
      fsrs_target_retention: persona.fsrs_target_retention,
      burnout_threshold: persona.burnout_threshold,
      buffer_deposit_rate: persona.buffer_deposit_rate,
      buffer_withdrawal_rate: persona.buffer_withdrawal_rate,
      velocity_target_multiplier: persona.velocity_target_multiplier,
      revision_ratio_in_plan: persona.revision_ratio_in_plan,
      fatigue_sensitivity: persona.fatigue_sensitivity,
      recalibration_order: persona.recalibration_order,
      scope_reduction_threshold: persona.scope_reduction_threshold === Infinity ? null : persona.scope_reduction_threshold,
      pyq_weight_minimum: persona.pyq_weight_minimum,
      weekend_boost: persona.weekend_boost,
      buffer_initial: bufferInitial,
      buffer_balance: bufferInitial,
      target_exam_year: payload.answers.target_exam_year,
      attempt_number: payload.answers.attempt_number,
      user_type: payload.answers.user_type,
      challenges: payload.answers.challenges,
      onboarding_version: 2,
    })
    .select()
    .single();

  if (error) throw error;

  // Upsert user targets
  await supabase
    .from('user_targets')
    .upsert({
      user_id: userId,
      daily_hours: payload.targets.daily_hours,
      daily_new_topics: payload.targets.daily_new_topics,
      weekly_revisions: payload.targets.weekly_revisions,
      weekly_tests: payload.targets.weekly_tests,
      weekly_answer_writing: payload.targets.weekly_answer_writing,
      weekly_ca_hours: payload.targets.weekly_ca_hours,
    });

  // Insert promise if provided
  if (payload.promise_text) {
    await supabase.from('user_promises').insert({
      user_id: userId,
      promise_text: payload.promise_text,
    });
  }

  // Insert previous attempt data if provided (repeaters)
  if (payload.previous_attempt) {
    await supabase.from('previous_attempts').upsert({
      user_id: userId,
      stage: payload.previous_attempt.stage,
      prelims_score: payload.previous_attempt.prelims_score ?? null,
      mains_score: payload.previous_attempt.mains_score ?? null,
      weak_subjects: payload.previous_attempt.weak_subjects ?? [],
    }, { onConflict: 'user_id' });
  }

  // Insert persona snapshot
  await supabase.from('persona_snapshots').insert({
    user_id: userId,
    strategy_mode: mode,
    strategy_params: params,
    fatigue_threshold: persona.fatigue_threshold,
    buffer_capacity: persona.buffer_capacity,
    fsrs_target_retention: persona.fsrs_target_retention,
    burnout_threshold: persona.burnout_threshold,
    buffer_deposit_rate: persona.buffer_deposit_rate,
    buffer_withdrawal_rate: persona.buffer_withdrawal_rate,
    velocity_target_multiplier: persona.velocity_target_multiplier,
    revision_ratio_in_plan: persona.revision_ratio_in_plan,
    fatigue_sensitivity: persona.fatigue_sensitivity,
    recalibration_order: persona.recalibration_order,
    scope_reduction_threshold: persona.scope_reduction_threshold === Infinity ? null : persona.scope_reduction_threshold,
    pyq_weight_minimum: persona.pyq_weight_minimum,
    weekend_boost: persona.weekend_boost,
    change_reason: 'initial_onboarding_v2',
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
  // Fetch current profile to detect custom overrides
  const { data: current } = await supabase
    .from('user_profiles')
    .select('strategy_mode, strategy_params')
    .eq('id', userId)
    .single();

  const newDefaults = await getDefaultParams(mode);
  const persona = getPersonaDefaults(mode);

  // Preserve custom overrides: diff current params against old mode defaults,
  // then layer those customizations on top of new mode defaults
  let mergedParams = newDefaults;
  if (current?.strategy_params && current?.strategy_mode) {
    const oldDefaults = await getDefaultParams(current.strategy_mode as StrategyMode);
    const overrides: Record<string, number> = {};
    for (const key of Object.keys(current.strategy_params) as (keyof StrategyParams)[]) {
      const currentVal = (current.strategy_params as StrategyParams)[key];
      const oldDefault = oldDefaults[key];
      if (currentVal !== undefined && currentVal !== oldDefault) {
        overrides[key] = currentVal;
      }
    }
    if (Object.keys(overrides).length > 0) {
      mergedParams = { ...newDefaults, ...overrides } as StrategyParams;
    }
  }

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
      strategy_params: mergedParams,
      mode_switched_at: new Date().toISOString(),
      fatigue_threshold: persona.fatigue_threshold,
      buffer_capacity: persona.buffer_capacity,
      fsrs_target_retention: persona.fsrs_target_retention,
      burnout_threshold: persona.burnout_threshold,
      buffer_deposit_rate: persona.buffer_deposit_rate,
      buffer_withdrawal_rate: persona.buffer_withdrawal_rate,
      velocity_target_multiplier: persona.velocity_target_multiplier,
      revision_ratio_in_plan: persona.revision_ratio_in_plan,
      fatigue_sensitivity: persona.fatigue_sensitivity,
      recalibration_order: persona.recalibration_order,
      scope_reduction_threshold: persona.scope_reduction_threshold === Infinity ? null : persona.scope_reduction_threshold,
      pyq_weight_minimum: persona.pyq_weight_minimum,
      weekend_boost: persona.weekend_boost,
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  // Reinitialize buffer_initial from new buffer_capacity
  const examDate = new Date(data.exam_date);
  const daysRemaining = daysUntil(examDate);
  const bufferInitial = daysRemaining * persona.buffer_capacity;

  await supabase
    .from('user_profiles')
    .update({ buffer_initial: bufferInitial, buffer_balance: bufferInitial }) // CHANGED: seed balance = initial on mode switch
    .eq('id', userId);

  // Insert new snapshot
  await supabase.from('persona_snapshots').insert({
    user_id: userId,
    strategy_mode: mode,
    strategy_params: mergedParams,
    fatigue_threshold: persona.fatigue_threshold,
    buffer_capacity: persona.buffer_capacity,
    fsrs_target_retention: persona.fsrs_target_retention,
    burnout_threshold: persona.burnout_threshold,
    buffer_deposit_rate: persona.buffer_deposit_rate,
    buffer_withdrawal_rate: persona.buffer_withdrawal_rate,
    velocity_target_multiplier: persona.velocity_target_multiplier,
    revision_ratio_in_plan: persona.revision_ratio_in_plan,
    fatigue_sensitivity: persona.fatigue_sensitivity,
    recalibration_order: persona.recalibration_order,
    scope_reduction_threshold: persona.scope_reduction_threshold === Infinity ? null : persona.scope_reduction_threshold,
    pyq_weight_minimum: persona.pyq_weight_minimum,
    weekend_boost: persona.weekend_boost,
    change_reason: 'mode_switch',
  });

  // Cascade: recalculate velocity with new params, regenerate tomorrow's plan
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = toDateString(tomorrow);

  await calculateVelocity(userId);
  await regeneratePlan(userId, tomorrowStr);

  return data;
}

export async function switchExamMode(userId: string, examMode: ExamMode) {
  // Delegate to mode service for full cascade
  const { switchExamMode: switchMode } = await import('./mode.js');
  return switchMode(userId, examMode);
}

export async function resetUserData(userId: string) {
  // Helper: delete from a table, ignore errors (table may not exist yet)
  const safeDelete = async (table: string, column = 'user_id') => {
    // Supabase returns { error } instead of throwing
    const { error } = await supabase.from(table).delete().eq(column, userId);
    if (error) {
      console.warn(`resetUserData: failed to delete from ${table}: ${error.message}`);
    }
  };

  // Delete child tables first (FK order), then parent tables
  await safeDelete('mock_topic_accuracy');
  await safeDelete('mock_subject_accuracy');
  await safeDelete('mock_tests');

  await safeDelete('ca_daily_logs');
  await safeDelete('ca_streaks');

  await safeDelete('daily_plans');

  await safeDelete('fsrs_cards');

  await safeDelete('confidence_snapshots');
  await safeDelete('revision_schedule');

  await safeDelete('user_progress');
  await safeDelete('status_changes');
  await safeDelete('weakness_snapshots');

  await safeDelete('velocity_snapshots');
  await safeDelete('daily_logs');
  await safeDelete('buffer_transactions');
  await safeDelete('streaks');

  await safeDelete('burnout_snapshots');
  await safeDelete('recovery_log');

  await safeDelete('recalibration_log');
  await safeDelete('weekly_reviews');

  await safeDelete('xp_transactions');
  await safeDelete('user_badges');
  await safeDelete('benchmark_snapshots');

  await safeDelete('user_targets');
  await safeDelete('user_promises');

  await safeDelete('persona_snapshots');

  // Reset user_profiles to defaults (keep the row, clear onboarding)
  const balancedPersona = getPersonaDefaults('balanced');
  const { error: profileError } = await supabase
    .from('user_profiles')
    .update({
      onboarding_completed: false,
      strategy_mode: 'balanced',
      strategy_params: null,
      daily_hours: 6,
      exam_date: null,
      prelims_date: null,
      name: null,
      current_mode: 'mains',
      mode_switched_at: null,
      target_exam_year: null,
      attempt_number: null,
      user_type: null,
      challenges: null,
      onboarding_version: null,
      buffer_balance: 0,
      buffer_initial: null,
      fatigue_threshold: balancedPersona.fatigue_threshold,
      buffer_capacity: balancedPersona.buffer_capacity,
      fsrs_target_retention: balancedPersona.fsrs_target_retention,
      burnout_threshold: balancedPersona.burnout_threshold,
      buffer_deposit_rate: null,
      buffer_withdrawal_rate: null,
      velocity_target_multiplier: null,
      revision_ratio_in_plan: null,
      fatigue_sensitivity: null,
      recalibration_order: null,
      scope_reduction_threshold: null,
      pyq_weight_minimum: null,
      weekend_boost: false,
      recovery_mode_active: false,
      recovery_mode_start: null,
      recovery_mode_end: null,
      auto_recalibrate: true,
      last_recalibrated_at: null,
      xp_total: 0,
      current_level: 1,
    })
    .eq('id', userId);

  if (profileError) {
    // Fallback: update only core columns if V2 columns don't exist
    const { error: fallbackError } = await supabase
      .from('user_profiles')
      .update({
        onboarding_completed: false,
        strategy_mode: 'balanced',
        strategy_params: null,
        daily_hours: 6,
        exam_date: null,
        name: null,
        buffer_balance: 0,
        buffer_initial: null,
        fatigue_threshold: balancedPersona.fatigue_threshold,
        buffer_capacity: balancedPersona.buffer_capacity,
        fsrs_target_retention: balancedPersona.fsrs_target_retention,
        burnout_threshold: balancedPersona.burnout_threshold,
        buffer_deposit_rate: null,
        buffer_withdrawal_rate: null,
        velocity_target_multiplier: null,
        recovery_mode_active: false,
        recovery_mode_start: null,
        recovery_mode_end: null,
        xp_total: 0,
        current_level: 1,
      })
      .eq('id', userId);

    if (fallbackError) {
      console.error('resetUserData: failed to reset profile:', fallbackError.message);
      throw fallbackError;
    }
  }

  return { success: true };
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
