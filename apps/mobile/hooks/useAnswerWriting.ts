import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useAnswerTemplates(topicId: string) {
  return useQuery({
    queryKey: ['answer-templates', topicId],
    queryFn: () => api.getAnswerTemplates(topicId),
    enabled: !!topicId,
  });
}

export function useSubmitAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: {
      template_id: string; topic_id: string; word_count?: number; time_taken_minutes?: number;
      score_structure?: number; score_intro?: number; score_examples?: number;
      score_analysis?: number; score_conclusion?: number; notes?: string;
    }) => api.submitAnswer(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answer-history'] });
      queryClient.invalidateQueries({ queryKey: ['answer-stats'] });
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
    },
  });
}

export function useAnswerHistory(topicId?: string) {
  return useQuery({
    queryKey: ['answer-history', topicId],
    queryFn: () => api.getAnswerHistory(topicId),
  });
}

export function useAnswerStats() {
  return useQuery({
    queryKey: ['answer-stats'],
    queryFn: () => api.getAnswerStats(),
  });
}
