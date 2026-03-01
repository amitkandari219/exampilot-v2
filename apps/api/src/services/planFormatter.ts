import { PLANNER } from '../constants/thresholds.js';

export function buildReasonText(type: string, pyqWeight: number, difficulty: number): string {
  switch (type) {
    case 'challenge': return 'Testing mastery — high-confidence topic with strong PYQ history';
    case 'decay_revision': return 'Hasn\'t been reviewed recently — time to refresh';
    case 'revision': return pyqWeight >= 3 ? 'Due for revision — high PYQ frequency' : 'Due for revision';
    case 'stretch': return 'Bonus topic for extra progress';
    default:
      if (pyqWeight >= 4) return 'High PYQ frequency — commonly asked in exams';
      if (pyqWeight >= 3) return 'Moderate PYQ frequency — worth prioritizing';
      if (difficulty >= 4) return 'Complex topic — best tackled with fresh energy';
      return 'New topic to cover';
  }
}

export function formatPlan(plan: any) {
  if (!plan) return null;

  const items = (plan.daily_plan_items || []).map((item: any) => ({
    id: item.id,
    plan_id: item.plan_id,
    topic_id: item.topic_id,
    type: item.type,
    estimated_hours: item.estimated_hours,
    priority_score: item.priority_score,
    display_order: item.display_order,
    status: item.status,
    completed_at: item.completed_at,
    actual_hours: item.actual_hours,
    topic: item.topics ? {
      name: item.topics.name,
      chapter_id: item.topics.chapter_id,
      pyq_weight: item.topics.pyq_weight,
      difficulty: item.topics.difficulty,
    } : undefined,
    chapter_name: item.topics?.chapters?.name,
    subject_name: item.topics?.chapters?.subjects?.name,
    reason_text: buildReasonText(item.type, item.topics?.pyq_weight || 0, item.topics?.difficulty || 3),
  })).sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order);

  const fs = plan.fatigue_score || 0;
  const fatigueStatus = fs > PLANNER.FATIGUE_STATUS_CRITICAL ? 'critical' : fs > PLANNER.FATIGUE_STATUS_HIGH ? 'high' : fs > PLANNER.FATIGUE_STATUS_MODERATE ? 'moderate' : 'low';

  return {
    id: plan.id,
    plan_date: plan.plan_date,
    available_hours: plan.available_hours,
    is_light_day: plan.is_light_day,
    fatigue_score: plan.fatigue_score,
    fatigue_status: fatigueStatus,
    energy_level: plan.energy_level,
    items,
  };
}
