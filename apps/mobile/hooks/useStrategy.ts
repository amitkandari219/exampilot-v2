import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { StrategyMode, StrategyParams } from '../types';

interface StrategyData {
  strategy_mode: StrategyMode;
  strategy_params: StrategyParams;
  daily_hours: number;
  current_mode: string;
}

export function useStrategy() {
  return useQuery<StrategyData>({
    queryKey: ['strategy'],
    queryFn: () => api.getStrategy() as Promise<StrategyData>,
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
