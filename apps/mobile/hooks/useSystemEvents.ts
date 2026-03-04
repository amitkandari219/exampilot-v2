import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { SystemEvent } from '../types';

export function useSystemEvents(limit = 20) {
  return useQuery<SystemEvent[]>({
    queryKey: ['system-events', limit],
    queryFn: () => api.getSystemEvents(limit),
    staleTime: 60_000,
  });
}
