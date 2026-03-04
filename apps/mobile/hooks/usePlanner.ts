import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { isDemoMode } from '../lib/supabase';
import { demoPlan } from '../lib/demoData';
import { DailyPlan } from '../types';

export function useDailyPlan(date?: string) {
  return useQuery<DailyPlan>({
    queryKey: ['daily-plan', date],
    queryFn: () => isDemoMode ? Promise.resolve(demoPlan as unknown as DailyPlan) : api.getDailyPlan(date) as Promise<DailyPlan>,
  });
}

export function useCompletePlanItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, actualHours }: { itemId: string; actualHours: number }) =>
      api.updatePlanItem(itemId, { status: 'completed', actual_hours: actualHours }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-plan'] });
      queryClient.invalidateQueries({ queryKey: ['velocity'] });
      queryClient.invalidateQueries({ queryKey: ['syllabus-progress'] });
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
    },
  });
}

export function useDeferPlanItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) =>
      api.updatePlanItem(itemId, { status: 'deferred' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-plan'] });
    },
  });
}

export function useRegeneratePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date, hours }: { date?: string; hours?: number }) =>
      api.regeneratePlan(date, hours),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-plan'] });
    },
  });
}

export function useMovePlanItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, targetDate }: { itemId: string; targetDate: string }) =>
      api.movePlanItem(itemId, targetDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-plan'] });
    },
  });
}

export function useDeferPlanItemV2() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) =>
      api.deferPlanItemV2(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-plan'] });
    },
  });
}
