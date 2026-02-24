import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { isDemoMode } from '../lib/supabase';
import { demoMockTests, demoMockAnalytics, demoMockTopicHistory } from '../lib/demoData';
import type { MockTest, MockAnalytics, MockTopicHistory } from '../types';

export function useMockTests(limit = 20) {
  return useQuery<MockTest[]>({
    queryKey: ['mocks', limit],
    queryFn: () => isDemoMode
      ? Promise.resolve(demoMockTests as MockTest[])
      : api.getMocks(limit) as Promise<MockTest[]>,
  });
}

export function useMockAnalytics() {
  return useQuery<MockAnalytics>({
    queryKey: ['mocks', 'analytics'],
    queryFn: () => isDemoMode
      ? Promise.resolve(demoMockAnalytics as MockAnalytics)
      : api.getMockAnalytics() as Promise<MockAnalytics>,
  });
}

export function useMockTopicHistory(topicId: string) {
  return useQuery<MockTopicHistory>({
    queryKey: ['mocks', 'topic', topicId],
    queryFn: () => isDemoMode
      ? Promise.resolve(demoMockTopicHistory as MockTopicHistory)
      : api.getMockTopicHistory(topicId) as Promise<MockTopicHistory>,
    enabled: !!topicId,
  });
}

export function useCreateMock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.createMock(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mocks'] });
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
      queryClient.invalidateQueries({ queryKey: ['weakness'] });
      queryClient.invalidateQueries({ queryKey: ['confidence'] });
      queryClient.invalidateQueries({ queryKey: ['benchmark'] });
    },
  });
}
