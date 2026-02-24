import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { StrategyMode, StrategyParams } from '../types';

interface StrategyData {
  strategy_mode: StrategyMode;
  strategy_params: StrategyParams;
  daily_hours: number;
  current_mode: string;
}

export function useStrategy(userId: string | null) {
  return useQuery<StrategyData>({
    queryKey: ['strategy', userId],
    queryFn: () => api.getStrategy(userId!) as Promise<StrategyData>,
    enabled: !!userId,
  });
}

export function useSwitchMode(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mode: StrategyMode) => api.switchMode(userId!, mode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy', userId] });
    },
  });
}

export function useCustomizeParams(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: Partial<StrategyParams>) =>
      api.customizeParams(userId!, params as Record<string, number>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy', userId] });
    },
  });
}
