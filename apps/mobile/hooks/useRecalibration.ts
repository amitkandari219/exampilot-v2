import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { isDemoMode } from '../lib/supabase';
import { demoRecalibration } from '../lib/demoData';
import { RecalibrationStatus, RecalibrationLogEntry, RecalibrationResult } from '../types';

export function useRecalibrationStatus() {
  return useQuery<RecalibrationStatus>({
    queryKey: ['recalibration-status'],
    queryFn: () => isDemoMode
      ? Promise.resolve(demoRecalibration.status as RecalibrationStatus)
      : api.getRecalibrationStatus() as Promise<RecalibrationStatus>,
  });
}

export function useRecalibrationHistory(limit = 20) {
  return useQuery<RecalibrationLogEntry[]>({
    queryKey: ['recalibration-history', limit],
    queryFn: () => isDemoMode
      ? Promise.resolve(demoRecalibration.history as RecalibrationLogEntry[])
      : api.getRecalibrationHistory(limit) as Promise<RecalibrationLogEntry[]>,
  });
}

export function useTriggerRecalibration() {
  const queryClient = useQueryClient();

  return useMutation<RecalibrationResult>({
    mutationFn: () => isDemoMode
      ? Promise.resolve({ status: 'applied' as const, adjustments: [], newParams: { fatigue_threshold: 87, buffer_capacity: 0.14, fsrs_target_retention: 0.91, burnout_threshold: 73 } })
      : api.triggerRecalibration() as Promise<RecalibrationResult>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recalibration-status'] });
      queryClient.invalidateQueries({ queryKey: ['recalibration-history'] });
      queryClient.invalidateQueries({ queryKey: ['strategy'] });
    },
  });
}

export function useSetAutoRecalibrate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) => isDemoMode
      ? Promise.resolve({ auto_recalibrate: enabled })
      : api.setAutoRecalibrate(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recalibration-status'] });
    },
  });
}
