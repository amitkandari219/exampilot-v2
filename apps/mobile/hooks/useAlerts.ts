import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { SmartAlert } from '../types';

export function useAlerts() {
  return useQuery<SmartAlert[]>({
    queryKey: ['alerts'],
    queryFn: () => api.getAlerts(),
    staleTime: 10 * 60_000,
  });
}
