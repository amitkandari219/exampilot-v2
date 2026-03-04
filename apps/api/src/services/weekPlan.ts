import { generateDailyPlan } from './planner.js';
import { toDateString } from '../utils/dateUtils.js';

interface WeekPlanDay {
  date: string;
  dayName: string;
  plan: Awaited<ReturnType<typeof generateDailyPlan>> | null;
}

export interface WeekPlanResponse {
  weekStart: string;
  weekEnd: string;
  days: WeekPlanDay[];
  totalPlannedHours: number;
  totalTargetHours: number;
  taskDistribution: Record<string, number>;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekRange(weekOffset: number): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return { start: monday, end: sunday };
}

export async function getWeekPlan(userId: string, weekOffset: number): Promise<WeekPlanResponse> {
  const { start, end } = getWeekRange(weekOffset);

  const days: WeekPlanDay[] = [];
  let totalPlannedHours = 0;
  let totalTargetHours = 0;
  const taskDistribution: Record<string, number> = {};

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dateStr = toDateString(d);
    const dayName = DAY_NAMES[d.getDay()];

    let plan: WeekPlanDay['plan'] = null;
    try {
      plan = await generateDailyPlan(userId, dateStr);
    } catch {
      // No plan for this day — leave null
    }

    if (plan) {
      const items = (plan as unknown as { items?: Array<{ estimated_hours: number; type: string }> }).items || [];
      for (const item of items) {
        totalPlannedHours += item.estimated_hours || 0;
        const type = item.type || 'new';
        taskDistribution[type] = (taskDistribution[type] || 0) + 1;
      }
      totalTargetHours += (plan as unknown as { available_hours?: number }).available_hours || 0;
    }

    days.push({ date: dateStr, dayName, plan });
  }

  return {
    weekStart: toDateString(start),
    weekEnd: toDateString(end),
    days,
    totalPlannedHours: Math.round(totalPlannedHours * 10) / 10,
    totalTargetHours: Math.round(totalTargetHours * 10) / 10,
    taskDistribution,
  };
}
