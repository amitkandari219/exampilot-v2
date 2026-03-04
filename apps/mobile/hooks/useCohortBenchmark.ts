import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { CohortPercentile } from '../types';

export function useCohortPercentile() {
  return useQuery<CohortPercentile | null>({
    queryKey: ['cohort-percentile'],
    queryFn: () => api.getCohortPercentile(),
    staleTime: 30 * 60_000,
  });
}
