import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { isDemoMode } from '../lib/supabase';
import { demoStress } from '../lib/demoData';
import { StressData } from '../types';

export function useStress() {
  return useQuery<StressData>({
    queryKey: ['stress'],
    queryFn: () => isDemoMode ? Promise.resolve(demoStress as unknown as StressData) : api.getStress() as Promise<StressData>,
  });
}

export function useUpdateWorkPressure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (level: number) => api.updateWorkPressure(level),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stress'] });
    },
  });
}
