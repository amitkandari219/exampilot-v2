import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { isDemoMode } from '../lib/supabase';
import { demoSyllabus } from '../lib/demoData';
import { Subject, TopicStatus } from '../types';

export function useSyllabusProgress() {
  return useQuery<Subject[]>({
    queryKey: ['syllabus-progress'],
    queryFn: () => isDemoMode ? Promise.resolve(demoSyllabus as unknown as Subject[]) : api.getSyllabusProgress() as Promise<Subject[]>,
  });
}

export function useUpdateTopicProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      topicId,
      updates,
    }: {
      topicId: string;
      updates: { status?: TopicStatus; actual_hours_spent?: number; confidence_score?: number; notes?: string };
    }) => api.updateTopicProgress(topicId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syllabus-progress'] });
      queryClient.invalidateQueries({ queryKey: ['velocity'] });
    },
  });
}
