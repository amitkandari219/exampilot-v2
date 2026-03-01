import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useMicroMockQuestions(topicId: string) {
  return useQuery({
    queryKey: ['micro-mock', topicId],
    queryFn: () => api.getMicroMockQuestions(topicId),
    enabled: !!topicId,
  });
}

export function useActiveRecallQuestions(topicId: string) {
  return useQuery({
    queryKey: ['active-recall', topicId],
    queryFn: () => api.getActiveRecallQuestions(topicId),
    enabled: !!topicId,
  });
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: {
      quiz_type: 'micro_mock' | 'active_recall';
      topic_id: string;
      answers: Array<{ question_id: string; selected_option: string }>;
      time_taken_seconds?: number;
    }) => api.submitQuiz(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-history'] });
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
    },
  });
}

export function useQuizHistory(topicId?: string) {
  return useQuery({
    queryKey: ['quiz-history', topicId],
    queryFn: () => api.getQuizHistory(topicId),
  });
}

export function useDeepMockAnalysis() {
  return useQuery({
    queryKey: ['deep-mock-analysis'],
    queryFn: () => api.getDeepMockAnalysis(),
  });
}

export function usePaperAnalysis() {
  return useQuery({
    queryKey: ['paper-analysis'],
    queryFn: () => api.getPaperAnalysis(),
  });
}
