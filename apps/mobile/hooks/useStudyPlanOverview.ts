import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { StudyPlanOverview } from '../types';

export function useStudyPlanOverview() {
  return useQuery<StudyPlanOverview>({
    queryKey: ['study-plan-overview'],
    queryFn: () => api.getStudyPlanOverview(),
    staleTime: 5 * 60_000,
  });
}
