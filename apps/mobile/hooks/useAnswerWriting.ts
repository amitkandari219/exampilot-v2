import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { AnswerWritingStats, AnswerPractice } from '../types';

export function useAnswerStats() {
  return useQuery<AnswerWritingStats>({
    queryKey: ['answer-stats'],
    queryFn: () => api.getAnswerStats(),
    staleTime: 5 * 60_000,
  });
}

export function useLogAnswer() {
  const queryClient = useQueryClient();
  return useMutation<AnswerPractice, Error, { topic_id?: string; question_text?: string; word_count?: number; time_taken_minutes?: number; self_score?: number }>({
    mutationFn: (data) => api.logAnswer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answer-stats'] });
    },
  });
}
