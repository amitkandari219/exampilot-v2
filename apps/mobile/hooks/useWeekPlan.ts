import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { DailyPlan } from '../types';

interface WeekPlanDay {
  date: string;
  dayName: string;
  plan: (DailyPlan & { items: DailyPlan['items'] }) | null;
}

export interface WeekPlanData {
  weekStart: string;
  weekEnd: string;
  days: WeekPlanDay[];
  totalPlannedHours: number;
  totalTargetHours: number;
  taskDistribution: Record<string, number>;
}

export function useWeekPlan(weekOffset: number = 0) {
  return useQuery<WeekPlanData>({
    queryKey: ['week-plan', weekOffset],
    queryFn: () => api.getWeekPlan(weekOffset === 0 ? 'current' : 'next'),
  });
}
