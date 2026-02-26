import { supabase } from '../lib/supabase.js';
import type { ExamMode } from '../types/index.js';

interface ModeConfigEntry {
  subject_id: string;
  is_active: boolean;
  importance_modifier: number;
  revision_ratio: number | null;
}

interface SubjectDiff {
  subject_id: string;
  subject_name: string;
  paused: boolean;
  importance_change: number;
}

interface ModePreview {
  target_mode: ExamMode;
  paused_subjects: Array<{ subject_id: string; name: string }>;
  boosted_subjects: Array<{ subject_id: string; name: string; importance_modifier: number }>;
  revision_ratio: number;
  topics_removed: number;
  topics_boosted: number;
  gravity_removed: number;
}

// --- Mode Config Queries ---

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

  // Mains and post_prelims: all subjects active (no filtering)
  if (mode === 'mains' || mode === 'post_prelims') return null;

  const config = await getModeConfig(mode);

  // If no config entries, all subjects are active
  if (config.length === 0) return null;

  // Get all subject IDs
  const { data: allSubjects } = await supabase
    .from('subjects')
    .select('id');

  const allIds = new Set((allSubjects || []).map((s: any) => s.id));
  const configMap = new Map(config.map((c) => [c.subject_id, c]));

  // A subject is active if:
  // - It has no config entry (default = active)
  // - OR its config entry has is_active = true
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
  // Use the first non-null revision_ratio found (they should all be the same for a mode)
  for (const entry of config) {
    if (entry.revision_ratio != null) return entry.revision_ratio;
  }
  return null;
}

// --- Switch Mode (full cascade) ---

export async function switchExamMode(userId: string, targetMode: ExamMode) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('current_mode, strategy_params, strategy_mode')
    .eq('id', userId)
    .single();

  if (!profile) throw new Error('Profile not found');

  const oldMode = profile.current_mode as ExamMode;
  if (oldMode === targetMode) {
    return { current_mode: targetMode, message: 'Already in this mode' };
  }

  // 1. Update current_mode
  await supabase
    .from('user_profiles')
    .update({
      current_mode: targetMode,
      mode_switched_at: new Date().toISOString(),
    })
    .eq('id', userId);

  // 2. Apply revision ratio from mode config
  const modeRevisionRatio = await getModeRevisionRatio(targetMode);
  if (modeRevisionRatio != null) {
    const strategyParams = (profile.strategy_params as any) || {};
    // revision_frequency is "revise every N days". ratio = 1/revision_frequency.
    // If ratio = 0.70, revision_frequency = 1/0.70 ≈ 1.43, so round to nearest
    const newRevisionFrequency = Math.max(1, Math.round(1 / modeRevisionRatio));
    await supabase
      .from('user_profiles')
      .update({ strategy_params: { ...strategyParams, revision_frequency: newRevisionFrequency } })
      .eq('id', userId);
  } else if (targetMode === 'mains' || targetMode === 'post_prelims') {
    // Restore default revision_frequency from strategy mode
    const { getDefaultParams } = await import('./strategy.js');
    const defaults = await getDefaultParams(profile.strategy_mode as any);
    const strategyParams = (profile.strategy_params as any) || {};
    await supabase
      .from('user_profiles')
      .update({ strategy_params: { ...strategyParams, revision_frequency: defaults.revision_frequency } })
      .eq('id', userId);
  }

  // 3. Log mode switch in persona_snapshots (audit trail)
  await supabase.from('persona_snapshots').insert({
    user_id: userId,
    strategy_mode: profile.strategy_mode,
    change_reason: `exam_mode_switch:${oldMode}_to_${targetMode}`,
  });

  // 4. Recalculate velocity with new scope
  try {
    const { calculateVelocity } = await import('./velocity.js');
    await calculateVelocity(userId);
  } catch {
    // Non-critical
  }

  // 5. Regenerate tomorrow's plan
  try {
    const { regeneratePlan } = await import('./planner.js');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await regeneratePlan(userId, tomorrow.toISOString().split('T')[0]);
  } catch {
    // Non-critical
  }

  return {
    current_mode: targetMode,
    old_mode: oldMode,
    revision_ratio: modeRevisionRatio,
  };
}

// --- Preview Mode Switch ---

export async function previewModeSwitch(userId: string, targetMode: ExamMode): Promise<ModePreview> {
  const config = await getModeConfig(targetMode);
  const configMap = new Map(config.map((c) => [c.subject_id, c]));

  // Get all subjects with topic counts
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name');

  const { data: topics } = await supabase
    .from('topics')
    .select('id, pyq_weight, importance, chapters!inner(subject_id)');

  const pausedSubjects: Array<{ subject_id: string; name: string }> = [];
  const boostedSubjects: Array<{ subject_id: string; name: string; importance_modifier: number }> = [];
  let topicsRemoved = 0;
  let topicsBoosted = 0;
  let gravityRemoved = 0;

  for (const subject of subjects || []) {
    const entry = configMap.get(subject.id);
    if (entry && !entry.is_active) {
      pausedSubjects.push({ subject_id: subject.id, name: subject.name });
      // Count topics in this subject
      const subTopics = (topics || []).filter((t: any) => t.chapters?.subject_id === subject.id);
      topicsRemoved += subTopics.length;
      gravityRemoved += subTopics.reduce((sum: number, t: any) => sum + t.pyq_weight, 0);
    } else if (entry && entry.importance_modifier > 0) {
      boostedSubjects.push({ subject_id: subject.id, name: subject.name, importance_modifier: entry.importance_modifier });
      const subTopics = (topics || []).filter((t: any) => t.chapters?.subject_id === subject.id);
      topicsBoosted += subTopics.length;
    }
  }

  const revisionRatio = (await getModeRevisionRatio(targetMode)) ?? 0.25;

  return {
    target_mode: targetMode,
    paused_subjects: pausedSubjects,
    boosted_subjects: boostedSubjects,
    revision_ratio: revisionRatio,
    topics_removed: topicsRemoved,
    topics_boosted: topicsBoosted,
    gravity_removed: gravityRemoved,
  };
}
