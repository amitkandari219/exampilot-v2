import type { DailyPlan, DailyPlanItem } from '../types';
import type { WeeklyReviewSummary, PlanItemType } from '@exampilot/shared-types';

const TYPE_EMOJI: Record<PlanItemType, string> = {
  new: '🆕',
  revision: '🔄',
  decay_revision: '⚠️',
  stretch: '📝',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function minutesLabel(hours: number): string {
  const m = Math.round(hours * 60);
  return m >= 60 ? `${(m / 60).toFixed(1)}h` : `${m}m`;
}

export function formatDailyPlanForShare(plan: DailyPlan): string {
  const completedCount = plan.items.filter(i => i.status === 'completed').length;
  const totalPlannedHrs = plan.items.reduce((s, i) => s + (i.estimated_hours || 0), 0);

  const header = `📋 My Study Plan — ${formatDate(plan.plan_date)}\n⏱️ ${totalPlannedHrs.toFixed(1)}h target · ${completedCount}/${plan.items.length} done`;

  // Group items by subject
  const bySubject = new Map<string, DailyPlanItem[]>();
  for (const item of plan.items) {
    const subj = item.subject_name || 'Other';
    if (!bySubject.has(subj)) bySubject.set(subj, []);
    bySubject.get(subj)!.push(item);
  }

  const sections: string[] = [];
  for (const [subject, items] of bySubject) {
    const lines = items.map(item => {
      const check = item.status === 'completed' ? '✅' : '⬜';
      const emoji = TYPE_EMOJI[item.type] || '📝';
      const topic = item.topic?.name || 'Topic';
      const dur = minutesLabel(item.estimated_hours || 0);
      return `  ${check} ${emoji} ${topic} (${dur})`;
    });
    sections.push(`\n📚 ${subject}\n${lines.join('\n')}`);
  }

  return `${header}${sections.join('')}\n\n— Sent via ExamPilot`;
}

export function formatWeeklyReviewForShare(review: WeeklyReviewSummary): string {
  const startDate = formatDate(review.week_start_date);
  const endDate = formatDate(review.week_end_date);

  const completionPct = review.plan_total_items > 0
    ? Math.round((review.plan_completed_items / review.plan_total_items) * 100)
    : 0;

  const lines = [
    `📊 Weekly Review — ${startDate} to ${endDate}`,
    '',
    `⏱️ ${review.total_hours.toFixed(1)}h studied (target: ${review.hours_target.toFixed(1)}h)`,
    `✅ ${review.plan_completed_items}/${review.plan_total_items} tasks completed (${completionPct}%)`,
    `📚 ${review.topics_completed} topics covered · ${review.plan_revision_count} revisions`,
  ];

  if (review.current_streak > 0) {
    lines.push(`🔥 ${review.current_streak}-day streak`);
  }

  if (review.wins && review.wins.length > 0) {
    lines.push('', '🏆 Wins:');
    for (const w of review.wins.slice(0, 3)) {
      lines.push(`  • ${w}`);
    }
  }

  if (review.areas_to_improve && review.areas_to_improve.length > 0) {
    lines.push('', '🎯 Focus areas:');
    for (const a of review.areas_to_improve.slice(0, 3)) {
      lines.push(`  • ${a}`);
    }
  }

  lines.push('', '— Sent via ExamPilot');
  return lines.join('\n');
}
