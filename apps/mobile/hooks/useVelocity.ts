import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { isDemoMode } from '../lib/supabase';
import { demoVelocity, demoBuffer } from '../lib/demoData';
import { VelocityData, VelocityHistoryPoint, BufferData } from '../types';

export function useVelocity() {
  return useQuery<VelocityData>({
    queryKey: ['velocity'],
    queryFn: () => isDemoMode ? Promise.resolve(demoVelocity as unknown as VelocityData) : api.getVelocity() as Promise<VelocityData>,
  });
}

export function useVelocityHistory(days = 30) {
  return useQuery<VelocityHistoryPoint[]>({
    queryKey: ['velocity-history', days],
    queryFn: () => isDemoMode ? Promise.resolve([]) : api.getVelocityHistory(days) as Promise<VelocityHistoryPoint[]>,
  });
}

export function useBuffer() {
  return useQuery<BufferData>({
    queryKey: ['buffer'],
    queryFn: () => isDemoMode ? Promise.resolve(demoBuffer as unknown as BufferData) : api.getBuffer() as Promise<BufferData>,
  });
}
