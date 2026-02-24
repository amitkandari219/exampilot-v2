import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { isDemoMode } from '../lib/supabase';
import { demoWeeklyReview } from '../lib/demoData';
import { WeeklyReviewSummary } from '../types';

export function useWeeklyReview(weekEnd?: string) {
  return useQuery<WeeklyReviewSummary>({
    queryKey: ['weekly-review', weekEnd],
    queryFn: () =>
      isDemoMode
        ? Promise.resolve(demoWeeklyReview as WeeklyReviewSummary)
        : api.getWeeklyReview(weekEnd) as Promise<WeeklyReviewSummary>,
  });
}

export function useWeeklyReviewHistory(limit = 8) {
  return useQuery<WeeklyReviewSummary[]>({
    queryKey: ['weekly-review-history', limit],
    queryFn: () =>
      isDemoMode
        ? Promise.resolve([demoWeeklyReview as WeeklyReviewSummary])
        : api.getWeeklyReviewHistory(limit) as Promise<WeeklyReviewSummary[]>,
  });
}

export function useRegenerateWeeklyReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (weekEnd?: string) => api.generateWeeklyReview(weekEnd) as Promise<WeeklyReviewSummary>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['weekly-review'] });
      qc.invalidateQueries({ queryKey: ['weekly-review-history'] });
    },
  });
}
