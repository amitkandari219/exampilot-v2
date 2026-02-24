import { supabase } from '../lib/supabase.js';
import type { XPTriggerType, GamificationProfile, BadgeWithStatus, XPTransaction } from '../types/index.js';

const XP_AMOUNTS: Record<string, number> = {
  plan_item_new: 100,
  plan_item_revision: 75,
  plan_item_decay_revision: 80,
  plan_item_stretch: 50,
  fsrs_review_correct: 50,
  fsrs_review_incorrect: 20,
  recovery_completion: 150,
};

const STREAK_MILESTONES: Record<number, number> = {
  7: 200,
  14: 400,
  30: 1000,
  100: 2500,
};

function cumulativeXpForLevel(level: number): number {
  return 500 * level * (level - 1) / 2;
}

function levelFromXp(xpTotal: number): number {
  return Math.floor(Math.sqrt(2 * xpTotal / 500)) + 1;
}

export async function awardXP(
  userId: string,
  opts: { triggerType: XPTriggerType; xpAmount?: number; topicId?: string; metadata?: Record<string, any> }
) {
  const xpAmount = opts.xpAmount ?? XP_AMOUNTS[opts.triggerType] ?? 0;
  if (xpAmount <= 0) return;

  // Insert XP transaction
  await supabase.from('xp_transactions').insert({
    user_id: userId,
    xp_amount: xpAmount,
    trigger_type: opts.triggerType,
    topic_id: opts.topicId || null,
    metadata: opts.metadata || {},
  });

  // Get current totals
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('xp_total')
    .eq('id', userId)
    .single();

  const newTotal = (profile?.xp_total || 0) + xpAmount;
  const newLevel = levelFromXp(newTotal);

  // Update user profile
  await supabase
    .from('user_profiles')
    .update({ xp_total: newTotal, current_level: newLevel })
    .eq('id', userId);

  // Check badge unlocks
  await checkBadgeUnlocks(userId, newTotal);
}

export async function checkBadgeUnlocks(userId: string, currentXpTotal?: number) {
  // Get all badge definitions
  const { data: allBadges } = await supabase
    .from('badge_definitions')
    .select('*');

  if (!allBadges || allBadges.length === 0) return;

  // Get already-unlocked badges
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('badge_slug')
    .eq('user_id', userId);

  const unlockedSlugs = new Set((userBadges || []).map((b: any) => b.badge_slug));

  // Gather user data for condition evaluation
  let xpTotal: number;
  if (currentXpTotal !== undefined) {
    xpTotal = currentXpTotal;
  } else {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('xp_total')
      .eq('id', userId)
      .single();
    xpTotal = profile?.xp_total || 0;
  }

  // Topics completed count
  const { count: topicsCompleted } = await supabase
    .from('user_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['first_pass', 'revised', 'exam_ready']);

  // Best streak
  const { data: streak } = await supabase
    .from('streaks')
    .select('best_count, current_count')
    .eq('user_id', userId)
    .eq('streak_type', 'study')
    .single();

  const bestStreak = streak?.best_count || 0;

  // Recovery completed count
  const { count: recoveryCount } = await supabase
    .from('recovery_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('ended_at', 'is', null);

  // Max hours in a single day
  const { data: maxHoursRow } = await supabase
    .from('daily_logs')
    .select('hours_studied')
    .eq('user_id', userId)
    .order('hours_studied', { ascending: false })
    .limit(1)
    .single();

  const maxDailyHours = maxHoursRow?.hours_studied || 0;

  // First session check (any xp transaction exists)
  const { count: txCount } = await supabase
    .from('xp_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const hasFirstSession = (txCount || 0) > 0;

  // Perfect week check — 7 consecutive days with 100% plan completion
  const perfectWeek = await checkPerfectWeek(userId);

  // Evaluate each badge
  for (const badge of allBadges) {
    if (unlockedSlugs.has(badge.slug)) continue;

    const cond = badge.unlock_condition as Record<string, any>;
    let met = false;

    if (cond.streak_gte != null) {
      met = bestStreak >= cond.streak_gte;
    } else if (cond.topics_completed_gte != null) {
      met = (topicsCompleted || 0) >= cond.topics_completed_gte;
    } else if (cond.xp_total_gte != null) {
      met = xpTotal >= cond.xp_total_gte;
    } else if (cond.recovery_completed_gte != null) {
      met = (recoveryCount || 0) >= cond.recovery_completed_gte;
    } else if (cond.first_session === true) {
      met = hasFirstSession;
    } else if (cond.daily_hours_gte != null) {
      met = maxDailyHours >= cond.daily_hours_gte;
    } else if (cond.perfect_week === true) {
      met = perfectWeek;
    }

    if (met) {
      // Unlock badge
      await supabase.from('user_badges').insert({
        user_id: userId,
        badge_slug: badge.slug,
      });

      // Award badge XP reward (skip if 0 to prevent cascade)
      if (badge.xp_reward > 0) {
        await awardXP(userId, {
          triggerType: 'badge_unlock',
          xpAmount: badge.xp_reward,
          metadata: { badge_slug: badge.slug },
        });
      }
    }
  }
}

async function checkPerfectWeek(userId: string): Promise<boolean> {
  const today = new Date();
  // Check last 7 days
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const { data: plan } = await supabase
      .from('daily_plans')
      .select('id')
      .eq('user_id', userId)
      .eq('plan_date', dateStr)
      .single();

    if (!plan) return false;

    const { data: items } = await supabase
      .from('daily_plan_items')
      .select('status')
      .eq('plan_id', plan.id);

    if (!items || items.length === 0) return false;

    const allCompleted = items.every((item: any) => item.status === 'completed');
    if (!allCompleted) return false;
  }
  return true;
}

export async function getGamificationProfile(userId: string): Promise<GamificationProfile> {
  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('xp_total, current_level')
    .eq('id', userId)
    .single();

  const xpTotal = profile?.xp_total || 0;
  const currentLevel = profile?.current_level || 1;
  const currentLevelCumulativeXp = cumulativeXpForLevel(currentLevel);
  const nextLevelCumulativeXp = cumulativeXpForLevel(currentLevel + 1);
  const xpForNextLevel = nextLevelCumulativeXp - currentLevelCumulativeXp;
  const xpProgressInLevel = xpTotal - currentLevelCumulativeXp;

  // XP earned today
  const today = new Date().toISOString().split('T')[0];
  const { data: todayTx } = await supabase
    .from('xp_transactions')
    .select('xp_amount')
    .eq('user_id', userId)
    .gte('created_at', today + 'T00:00:00');

  const xpToday = (todayTx || []).reduce((sum: number, t: any) => sum + t.xp_amount, 0);

  // Recent 5 badges with definitions
  const { data: recentUserBadges } = await supabase
    .from('user_badges')
    .select('badge_slug, unlocked_at, badge_definitions(*)')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false })
    .limit(5);

  const recentBadges = (recentUserBadges || []).map((ub: any) => ({
    ...ub.badge_definitions,
    unlocked_at: ub.unlocked_at,
  }));

  // Total badges count
  const { count: totalBadges } = await supabase
    .from('user_badges')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return {
    xp_total: xpTotal,
    current_level: currentLevel,
    xp_for_next_level: xpForNextLevel,
    xp_progress_in_level: xpProgressInLevel,
    xp_today: xpToday,
    recent_badges: recentBadges,
    total_badges_unlocked: totalBadges || 0,
  };
}

export async function getXPHistory(userId: string, limit = 50): Promise<XPTransaction[]> {
  const { data, error } = await supabase
    .from('xp_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getBadges(userId: string): Promise<BadgeWithStatus[]> {
  // Get all badge definitions
  const { data: allBadges } = await supabase
    .from('badge_definitions')
    .select('*')
    .order('category', { ascending: true });

  // Get user's unlocked badges
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('badge_slug, unlocked_at')
    .eq('user_id', userId);

  const unlockedMap = new Map(
    (userBadges || []).map((ub: any) => [ub.badge_slug, ub.unlocked_at])
  );

  return (allBadges || []).map((badge: any) => ({
    ...badge,
    unlocked: unlockedMap.has(badge.slug),
    unlocked_at: unlockedMap.get(badge.slug) || null,
  }));
}

export { STREAK_MILESTONES };
