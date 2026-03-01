import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { isDemoMode } from '../lib/supabase';
import { demoBenchmark, demoBenchmarkHistory } from '../lib/demoData';
import { BenchmarkProfile, BenchmarkHistoryPoint } from '../types';

export function useBenchmark() {
  return useQuery<BenchmarkProfile>({
    queryKey: ['benchmark'],
    queryFn: () => isDemoMode
      ? Promise.resolve(demoBenchmark as BenchmarkProfile)
      : api.getBenchmark() as Promise<BenchmarkProfile>,
  });
}

export function useBenchmarkHistory(days = 30) {
  return useQuery<BenchmarkHistoryPoint[]>({
    queryKey: ['benchmark', 'history', days],
    queryFn: () => isDemoMode
      ? Promise.resolve(demoBenchmarkHistory as BenchmarkHistoryPoint[])
      : api.getBenchmarkHistory(days) as Promise<BenchmarkHistoryPoint[]>,
  });
}

export function usePeerBenchmark() {
  return useQuery({
    queryKey: ['benchmark', 'peer'],
    queryFn: () => api.getPeerBenchmark(),
  });
}
