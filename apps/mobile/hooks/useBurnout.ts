import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { isDemoMode } from '../lib/supabase';
import { demoBurnout } from '../lib/demoData';
import { BurnoutData } from '../types';

export function useBurnout() {
  return useQuery<BurnoutData>({
    queryKey: ['burnout'],
    queryFn: () => isDemoMode ? Promise.resolve(demoBurnout as unknown as BurnoutData) : api.getBurnout() as Promise<BurnoutData>,
  });
}

export function useActivateRecovery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.startRecovery(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['burnout'] });
      queryClient.invalidateQueries({ queryKey: ['daily-plan'] });
    },
  });
}

export function useExitRecovery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason?: string) => api.endRecovery(reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['burnout'] });
      queryClient.invalidateQueries({ queryKey: ['daily-plan'] });
    },
  });
}
