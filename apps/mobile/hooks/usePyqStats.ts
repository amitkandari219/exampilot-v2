import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { PYQStats } from '../types';

export function usePyqStats() {
  return useQuery<PYQStats>({
    queryKey: ['pyq-stats'],
    queryFn: () => api.getPyqStats() as Promise<PYQStats>,
  });
}
