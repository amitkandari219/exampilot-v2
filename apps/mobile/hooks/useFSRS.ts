import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type RevisionsDueData } from '../lib/api';
import { isDemoMode } from '../lib/supabase';
import { demoConfidence, demoRevisionsDue } from '../lib/demoData';
import { ConfidenceOverview } from '../types';

export function useRevisionsDue(date?: string) {
  return useQuery({
    queryKey: ['revisions-due', date],
    queryFn: () => isDemoMode ? Promise.resolve(demoRevisionsDue as unknown as RevisionsDueData) : api.getRevisionsDue(date),
  });
}

export function useRecordReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ topicId, rating }: { topicId: string; rating: number }) =>
      api.recordReview(topicId, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisions-due'] });
      queryClient.invalidateQueries({ queryKey: ['syllabus-progress'] });
      queryClient.invalidateQueries({ queryKey: ['confidence-overview'] });
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
    },
  });
}

export function useConfidenceOverview() {
  return useQuery<ConfidenceOverview>({
    queryKey: ['confidence-overview'],
    queryFn: () => isDemoMode ? Promise.resolve(demoConfidence as unknown as ConfidenceOverview) : api.getConfidenceOverview() as Promise<ConfidenceOverview>,
  });
}
