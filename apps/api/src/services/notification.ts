import { supabase } from '../lib/supabase.js';

export type NotificationType =
  | 'recalibration_triggered'
  | 'weekly_review_ready'
  | 'recovery_suggestion'
  | 'topic_decay_alert'
  | 'streak_milestone'
  | 'badge_unlocked'
  | 'mock_improvement'
  | 'buffer_debt';

const NOTIFICATION_TEMPLATES: Record<NotificationType, { title: string; body: string }> = {
  recalibration_triggered: { title: 'Your plan needs a small adjustment', body: 'Tap to see recovery options' },
  weekly_review_ready: { title: 'Your Weekly Review is ready', body: '5 minutes to review your week' },
  recovery_suggestion: { title: 'Your burnout risk is elevated', body: 'Consider activating a light week' },
  topic_decay_alert: { title: '{count} topics decayed', body: 'Quick revisions will restore them' },
  streak_milestone: { title: '{count}-day streak!', body: 'Keep the momentum going!' },
  badge_unlocked: { title: 'Badge Unlocked: {name}', body: '{description}' },
  mock_improvement: { title: 'Mock score improved!', body: 'Your {subject} accuracy went up {pct}%' },
  buffer_debt: { title: 'Buffer in debt', body: 'Complete extra topics to recover' },
};

export async function queueNotification(
  userId: string,
  type: NotificationType,
  data: Record<string, any> = {},
) {
  const template = NOTIFICATION_TEMPLATES[type];
  let title = template.title;
  let body = template.body;

  // Interpolate template variables
  for (const [key, value] of Object.entries(data)) {
    title = title.replace(`{${key}}`, String(value));
    body = body.replace(`{${key}}`, String(value));
  }

  await supabase.from('notification_queue').insert({
    user_id: userId,
    type,
    title,
    body,
    data,
    status: 'pending',
  });
}

export async function processQueue(): Promise<{ sent: number; failed: number }> {
  const { data: pending } = await supabase
    .from('notification_queue')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(100);

  if (!pending || pending.length === 0) return { sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;

  // Group by user to batch push tokens
  const byUser = new Map<string, typeof pending>();
  for (const n of pending) {
    const list = byUser.get(n.user_id) || [];
    list.push(n);
    byUser.set(n.user_id, list);
  }

  for (const [userId, notifications] of byUser) {
    // Get push token
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('push_token')
      .eq('id', userId)
      .single();

    if (!profile?.push_token) {
      // No push token — mark as failed
      for (const n of notifications) {
        await supabase
          .from('notification_queue')
          .update({ status: 'failed' })
          .eq('id', n.id);
        failed++;
      }
      continue;
    }

    // Send via Expo Push API
    for (const n of notifications) {
      try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: profile.push_token,
            title: n.title,
            body: n.body,
            data: n.data,
          }),
        });

        if (response.ok) {
          await supabase
            .from('notification_queue')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', n.id);
          sent++;
        } else {
          await supabase
            .from('notification_queue')
            .update({ status: 'failed' })
            .eq('id', n.id);
          failed++;
        }
      } catch (e) { console.warn('[notification:push-send]', e);
        await supabase
          .from('notification_queue')
          .update({ status: 'failed' })
          .eq('id', n.id);
        failed++;
      }
    }
  }

  return { sent, failed };
}
