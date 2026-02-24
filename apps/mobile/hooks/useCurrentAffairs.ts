import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { isDemoMode } from '../lib/supabase';
import { demoCAStats, demoCASubjectGaps } from '../lib/demoData';
import type { CAStats, CASubjectGap } from '../types';

export function useCAStats(month?: string) {
  return useQuery<CAStats>({
    queryKey: ['ca', 'stats', month],
    queryFn: () => isDemoMode
      ? Promise.resolve(demoCAStats as CAStats)
      : api.getCAStats(month) as Promise<CAStats>,
  });
}

export function useCASubjectGaps() {
  return useQuery<CASubjectGap[]>({
    queryKey: ['ca', 'gaps'],
    queryFn: () => isDemoMode
      ? Promise.resolve(demoCASubjectGaps as CASubjectGap[])
      : api.getCASubjectGaps() as Promise<CASubjectGap[]>,
  });
}

export function useLogCA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { hours_spent: number; completed: boolean; notes?: string; subject_ids?: string[] }) =>
      api.logCA(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ca'] });
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
    },
  });
}
