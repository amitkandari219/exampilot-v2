import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, StrategyData } from '../lib/api';
import { StrategyMode, StrategyParams, ExamMode, ScopeTriageResult, StrategyDelta } from '../types';

export function useStrategy() {
  return useQuery<StrategyData>({
    queryKey: ['strategy'],
    queryFn: () => api.getStrategy(),
  });
}

export function useSwitchMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mode: StrategyMode) => api.switchMode(mode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy'] });
    },
  });
}

export function useCustomizeParams() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: Partial<StrategyParams>) =>
      api.customizeParams(params as Record<string, number>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy'] });
    },
  });
}

export function useScopeTriage() {
  return useQuery<ScopeTriageResult>({
    queryKey: ['scope-triage'],
    queryFn: () => api.getScopeTriage(),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStrategyDelta() {
  return useQuery<StrategyDelta>({
    queryKey: ['strategy-delta'],
    queryFn: () => api.getStrategyDelta(),
  });
}

export function useSwitchExamMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (examMode: ExamMode) => api.switchExamMode(examMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy'] });
      queryClient.invalidateQueries({ queryKey: ['velocity'] });
      queryClient.invalidateQueries({ queryKey: ['daily-plan'] });
    },
  });
}
