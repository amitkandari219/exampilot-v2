import { supabase } from '../lib/supabase.js';
import { toDateString, daysAgo } from '../utils/dateUtils.js';

interface SmartAlert {
  type: 'subject_neglect' | 'confidence_decay' | 'buffer_critical' | 'streak_risk';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  action_label?: string;
  action_route?: string;
}

export async function getActiveAlerts(userId: string): Promise<SmartAlert[]> {
  const alerts: SmartAlert[] = [];
  const today = toDateString(new Date());

  // 1. Subject neglect: subjects with topics not touched in 14+ days
  const cutoff = daysAgo(14, new Date(today));
  const { data: staleTopics } = await supabase
    .from('user_progress')
    .select('topic_id, topics!inner(chapters!inner(subjects!inner(name)))')
    .eq('user_id', userId)
    .lt('last_touched', cutoff.toISOString())
    .not('status', 'in', '("deferred_scope","exam_ready")');

  if (staleTopics && staleTopics.length > 0) {
    const neglectedSubjects = new Set<string>();
    for (const row of staleTopics as unknown as Array<{ topics: { chapters: { subjects: { name: string } } } }>) {
      neglectedSubjects.add(row.topics.chapters.subjects.name);
    }
    if (neglectedSubjects.size > 0) {
      const names = Array.from(neglectedSubjects).slice(0, 3).join(', ');
      alerts.push({
        type: 'subject_neglect',
        severity: 'warning',
        title: 'Subject gap detected',
        message: `${names} ${neglectedSubjects.size > 3 ? `and ${neglectedSubjects.size - 3} more` : ''} not studied in 14+ days.`,
        action_label: 'View Syllabus',
        action_route: '/(tabs)/syllabus',
      });
    }
  }

  // 2. Confidence decay: 5+ topics with low confidence
  const { data: decayed, count: decayedCount } = await supabase
    .from('user_progress')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .lt('confidence_score', 30)
    .gt('confidence_score', 0);

  if (decayedCount && decayedCount >= 5) {
    alerts.push({
      type: 'confidence_decay',
      severity: 'warning',
      title: 'Memory fading',
      message: `${decayedCount} topics need revision before they fade further.`,
      action_label: 'View Revisions',
      action_route: '/revision',
    });
  }

  // 3. Buffer critical: buffer < -2
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('buffer_balance')
    .eq('id', userId)
    .single();

  if (profile && profile.buffer_balance < -2) {
    alerts.push({
      type: 'buffer_critical',
      severity: 'critical',
      title: 'Safety margin depleted',
      message: 'You\'re behind schedule. Consider a focused catch-up session today.',
      action_label: 'Open Planner',
      action_route: '/(tabs)/planner',
    });
  }

  // 4. Streak at risk: studied yesterday but not today, after 6pm local
  const now = new Date();
  if (now.getHours() >= 18) {
    const { data: todayLog } = await supabase
      .from('daily_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('log_date', today)
      .limit(1);

    if (!todayLog || todayLog.length === 0) {
      const yesterday = toDateString(daysAgo(1, new Date(today)));
      const { data: yesterdayLog } = await supabase
        .from('daily_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('log_date', yesterday)
        .limit(1);

      if (yesterdayLog && yesterdayLog.length > 0) {
        alerts.push({
          type: 'streak_risk',
          severity: 'info',
          title: 'Streak at risk',
          message: 'You studied yesterday but not today yet. Even 15 minutes keeps your streak alive.',
          action_label: 'Start Studying',
          action_route: '/(tabs)/planner',
        });
      }
    }
  }

  // Sort by severity (critical first)
  const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts;
}
