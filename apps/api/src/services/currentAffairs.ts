import { supabase } from '../lib/supabase.js';
import type { CAStats, CASubjectGap } from '../types/index.js';

export async function logCA(
  userId: string,
  payload: { hours_spent: number; completed: boolean; notes?: string; subject_ids?: string[] }
): Promise<{ success: boolean }> {
  const today = new Date().toISOString().split('T')[0];

  // Upsert daily log (idempotent per day)
  const { data: log, error: logError } = await supabase
    .from('ca_daily_logs')
    .upsert(
      {
        user_id: userId,
        log_date: today,
        completed: payload.completed,
        hours_spent: payload.hours_spent,
        notes: payload.notes || null,
      },
      { onConflict: 'user_id,log_date' }
    )
    .select('id')
    .single();

  if (logError) throw logError;

  // Insert tags if subject_ids provided
  if (payload.subject_ids && payload.subject_ids.length > 0 && log) {
    // Delete existing tags for this log first (re-logging replaces tags)
    await supabase.from('ca_tags').delete().eq('ca_log_id', log.id);

    const tagRows = payload.subject_ids.map((subjectId: string) => ({
      ca_log_id: log.id,
      subject_id: subjectId,
    }));
    const { error: tagError } = await supabase.from('ca_tags').insert(tagRows);
    if (tagError) throw tagError;
  }

  // Update streak
  await updateStreak(userId, today);

  return { success: true };
}

async function updateStreak(userId: string, todayStr: string): Promise<void> {
  const { data: existing } = await supabase
    .from('ca_streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let currentStreak: number;
  let bestStreak: number;

  if (!existing) {
    // First ever log
    currentStreak = 1;
    bestStreak = 1;
    await supabase.from('ca_streaks').insert({
      user_id: userId,
      current_streak: currentStreak,
      best_streak: bestStreak,
      last_active_date: todayStr,
    });
    return;
  }

  if (existing.last_active_date === todayStr) {
    // Already logged today — no change
    return;
  } else if (existing.last_active_date === yesterdayStr) {
    // Consecutive day
    currentStreak = existing.current_streak + 1;
  } else {
    // Gap — reset
    currentStreak = 1;
  }

  bestStreak = Math.max(existing.best_streak, currentStreak);

  await supabase
    .from('ca_streaks')
    .update({
      current_streak: currentStreak,
      best_streak: bestStreak,
      last_active_date: todayStr,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
}

export async function getCAStats(userId: string, month?: string): Promise<CAStats> {
  const today = new Date().toISOString().split('T')[0];

  // Streak
  const { data: streakRow } = await supabase
    .from('ca_streaks')
    .select('current_streak, best_streak, last_active_date')
    .eq('user_id', userId)
    .single();

  const streak = {
    current_streak: streakRow?.current_streak || 0,
    best_streak: streakRow?.best_streak || 0,
    last_active_date: streakRow?.last_active_date || null,
  };

  // Today's log
  const { data: todayLog } = await supabase
    .from('ca_daily_logs')
    .select('*, ca_tags(id, subject_id, tag_text)')
    .eq('user_id', userId)
    .eq('log_date', today)
    .single();

  const todayLogged = !!todayLog;

  // Totals
  const { data: allLogs } = await supabase
    .from('ca_daily_logs')
    .select('hours_spent')
    .eq('user_id', userId);

  const totalHours = (allLogs || []).reduce((sum: number, l: any) => sum + (l.hours_spent || 0), 0);
  const totalDaysLogged = allLogs?.length || 0;

  // Subject distribution: count tags grouped by subject
  const { data: tagCounts } = await supabase
    .from('ca_tags')
    .select('subject_id, subjects(name)')
    .in(
      'ca_log_id',
      (await supabase.from('ca_daily_logs').select('id').eq('user_id', userId)).data?.map((r: any) => r.id) || []
    );

  const subjectMap: Record<string, { name: string; count: number }> = {};
  for (const tag of tagCounts || []) {
    const sid = tag.subject_id;
    const sname = (tag as any).subjects?.name || 'Unknown';
    if (!subjectMap[sid]) subjectMap[sid] = { name: sname, count: 0 };
    subjectMap[sid].count++;
  }

  const totalTags = Object.values(subjectMap).reduce((s, v) => s + v.count, 0);
  const subjectDistribution = Object.entries(subjectMap).map(([sid, v]) => ({
    subject_id: sid,
    subject_name: v.name,
    count: v.count,
    percentage: totalTags > 0 ? Math.round((v.count / totalTags) * 100) : 0,
  }));
  subjectDistribution.sort((a, b) => b.count - a.count);

  // Monthly heatmap
  const targetMonth = month || today.slice(0, 7); // YYYY-MM
  const monthStart = `${targetMonth}-01`;
  const monthEndDate = new Date(parseInt(targetMonth.slice(0, 4)), parseInt(targetMonth.slice(5, 7)), 0);
  const monthEnd = monthEndDate.toISOString().split('T')[0];

  const { data: monthLogs } = await supabase
    .from('ca_daily_logs')
    .select('log_date, completed')
    .eq('user_id', userId)
    .gte('log_date', monthStart)
    .lte('log_date', monthEnd);

  const logDates = new Set((monthLogs || []).map((l: any) => l.log_date));
  const daysInMonth = monthEndDate.getDate();
  const monthlyHeatmap: Array<{ date: string; completed: boolean }> = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${targetMonth}-${String(d).padStart(2, '0')}`;
    monthlyHeatmap.push({ date: dateStr, completed: logDates.has(dateStr) });
  }

  // Format today's log with tags
  let formattedTodayLog = null;
  if (todayLog) {
    formattedTodayLog = {
      id: todayLog.id,
      user_id: todayLog.user_id,
      log_date: todayLog.log_date,
      completed: todayLog.completed,
      hours_spent: todayLog.hours_spent,
      notes: todayLog.notes,
      created_at: todayLog.created_at,
      tags: (todayLog as any).ca_tags || [],
    };
  }

  return {
    streak,
    today_logged: todayLogged,
    today_log: formattedTodayLog,
    total_hours: Math.round(totalHours * 10) / 10,
    total_days_logged: totalDaysLogged,
    subject_distribution: subjectDistribution,
    monthly_heatmap: monthlyHeatmap,
  };
}

export async function getCASubjectGaps(userId: string): Promise<CASubjectGap[]> {
  // Get all subjects
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .order('display_order');

  if (!subjects || subjects.length === 0) return [];

  // Get all user's CA log IDs
  const { data: userLogs } = await supabase
    .from('ca_daily_logs')
    .select('id')
    .eq('user_id', userId);

  const logIds = (userLogs || []).map((l: any) => l.id);

  if (logIds.length === 0) {
    // No logs at all — every subject is a gap
    return subjects.map((s: any) => ({
      subject_id: s.id,
      subject_name: s.name,
      tag_count: 0,
      percentage: 0,
      alert: `${s.name} not covered in your CA yet`,
    }));
  }

  // Count tags per subject
  const { data: tags } = await supabase
    .from('ca_tags')
    .select('subject_id')
    .in('ca_log_id', logIds);

  const tagCountMap: Record<string, number> = {};
  for (const t of tags || []) {
    tagCountMap[t.subject_id] = (tagCountMap[t.subject_id] || 0) + 1;
  }

  const totalTags = (tags || []).length;

  const gaps: CASubjectGap[] = [];
  for (const s of subjects) {
    const count = tagCountMap[s.id] || 0;
    const pct = totalTags > 0 ? Math.round((count / totalTags) * 100) : 0;
    let alert: string | null = null;
    if (pct < 5) {
      alert = `${s.name} barely covered in your CA - look for related articles`;
    }
    gaps.push({
      subject_id: s.id,
      subject_name: s.name,
      tag_count: count,
      percentage: pct,
      alert,
    });
  }

  // Return only subjects with alerts (undercovered)
  return gaps.filter((g) => g.alert !== null).sort((a, b) => a.tag_count - b.tag_count);
}
