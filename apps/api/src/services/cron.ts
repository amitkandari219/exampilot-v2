import { supabase } from '../lib/supabase.js';
import { toDateString } from '../utils/dateUtils.js';

/**
 * Daily maintenance cron job — runs at 2:00 AM UTC.
 * Processes all active users in batch. Each step is idempotent.
 * If a step fails for a user, log the error and continue.
 */
export async function runDailyMaintenance() {
  const jobStart = new Date().toISOString();
  const errors: { userId: string; step: string; error: string }[] = [];

  // Log start
  const { data: cronLog } = await supabase
    .from('cron_execution_log')
    .insert({ job_name: 'daily-maintenance', started_at: jobStart, status: 'running' })
    .select()
    .single();

  // Get all active users
  const { data: users } = await supabase
    .from('user_profiles')
    .select('id')
    .not('strategy_mode', 'is', null);

  if (!users || users.length === 0) {
    if (cronLog) {
      await supabase.from('cron_execution_log')
        .update({ finished_at: new Date().toISOString(), users_processed: 0, status: 'completed' })
        .eq('id', cronLog.id);
    }
    return;
  }

  const today = toDateString(new Date());

  // Pre-fetch recovery status for all users
  const { data: recoveryStatuses } = await supabase
    .from('user_profiles')
    .select('id, recovery_mode_active')
    .in('id', users.map((u) => u.id));
  const recoveryMap = new Map((recoveryStatuses || []).map((r) => [r.id, r.recovery_mode_active]));

  for (const user of users) {
    const userId = user.id;
    const inRecovery = recoveryMap.get(userId) === true;

    // Step 1: Recalculate confidence (FSRS decay) — runs even during recovery
    try {
      const { recalculateAllConfidence } = await import('./decayTrigger.js');
      await recalculateAllConfidence(userId);
    } catch (e: any) {
      errors.push({ userId, step: 'recalculateAllConfidence', error: e.message });
    }

    // Step 2: Recalculate health scores — runs even during recovery
    try {
      const { calculateHealthScores } = await import('./weakness.js');
      await calculateHealthScores(userId);
    } catch (e: any) {
      errors.push({ userId, step: 'calculateHealthScores', error: e.message });
    }

    // Step 3: Create velocity snapshot — FROZEN during recovery (velocity.ts handles internally)
    if (!inRecovery) {
      try {
        const { calculateVelocity } = await import('./velocity.js');
        await calculateVelocity(userId);
      } catch (e: any) {
        errors.push({ userId, step: 'calculateVelocity', error: e.message });
      }
    }

    // Step 4: Process daily buffer transaction — PAUSED during recovery (updateBuffer also guards internally)
    if (!inRecovery) {
      try {
        const { updateBuffer } = await import('./velocity.js');
        await updateBuffer(userId, today);
      } catch (e: any) {
        errors.push({ userId, step: 'updateBuffer', error: e.message });
      }
    }

    // Step 5: Create burnout snapshot — runs even during recovery (tracks recovery progress)
    try {
      const { getBurnoutData } = await import('./burnout.js');
      await getBurnoutData(userId);
    } catch (e: any) {
      errors.push({ userId, step: 'calculateBurnout', error: e.message });
    }

    // Step 6: Calculate benchmark readiness
    try {
      const { calculateBenchmark } = await import('./benchmark.js');
      await calculateBenchmark(userId);
    } catch (e: any) {
      errors.push({ userId, step: 'calculateBenchmark', error: e.message });
    }

    // Step 6b: Auto-recalibration — skip during recovery (no meaningful data)
    if (!inRecovery) {
      try {
        const { runRecalibration } = await import('./recalibration.js');
        await runRecalibration(userId, 'auto_daily');
      } catch (e: any) {
        errors.push({ userId, step: 'runRecalibration', error: e.message });
      }
    }
  }

  // Step 7: Weekly review (Sundays only)
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 0) {
    for (const user of users) {
      try {
        const { generateWeeklyReview } = await import('./weeklyReview.js');
        await generateWeeklyReview(user.id);

        // Queue notification
        const { queueNotification } = await import('./notification.js');
        await queueNotification(user.id, 'weekly_review_ready');
      } catch (e: any) {
        errors.push({ userId: user.id, step: 'weeklyReview', error: e.message });
      }
    }
  }

  // Process notification queue
  try {
    const { processQueue } = await import('./notification.js');
    await processQueue();
  } catch (e: any) {
    errors.push({ userId: 'system', step: 'processQueue', error: e.message });
  }

  // Log completion
  if (cronLog) {
    await supabase.from('cron_execution_log')
      .update({
        finished_at: new Date().toISOString(),
        users_processed: users.length,
        errors: errors.length > 0 ? errors : [],
        status: errors.length > 0 ? 'completed' : 'completed',
      })
      .eq('id', cronLog.id);
  }

  return { users_processed: users.length, errors };
}
