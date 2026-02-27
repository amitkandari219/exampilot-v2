import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type SyllabusProgressData } from '../lib/api';
import { isDemoMode } from '../lib/supabase';
import { demoSyllabus } from '../lib/demoData';
import { TopicStatus } from '../types';

export function useSyllabusProgress() {
  return useQuery<SyllabusProgressData>({
    queryKey: ['syllabus-progress'],
    queryFn: () => isDemoMode ? Promise.resolve(demoSyllabus as unknown as SyllabusProgressData) : api.getSyllabusProgress(),
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
