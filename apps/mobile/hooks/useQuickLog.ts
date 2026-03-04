import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { QuickLogPayload, QuickLogEntry } from '../types';

export function useCreateQuickLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: QuickLogPayload) => api.createQuickLog(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quicklogs'] });
      queryClient.invalidateQueries({ queryKey: ['velocity'] });
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
      queryClient.invalidateQueries({ queryKey: ['daily-plan'] });
    },
  });
}

export function useQuickLogs(date?: string) {
  return useQuery<QuickLogEntry[]>({
    queryKey: ['quicklogs', date],
    queryFn: () => api.getQuickLogs(date),
  });
}
