import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { isDemoMode } from '../lib/supabase';
import { demoGamification, demoBadges } from '../lib/demoData';
import { GamificationProfile, BadgeWithStatus, XPTransaction } from '../types';

export function useGamification() {
  return useQuery<GamificationProfile>({
    queryKey: ['gamification'],
    queryFn: () => isDemoMode
      ? Promise.resolve(demoGamification as GamificationProfile)
      : api.getGamificationProfile() as Promise<GamificationProfile>,
  });
}

export function useBadges() {
  return useQuery<BadgeWithStatus[]>({
    queryKey: ['gamification', 'badges'],
    queryFn: () => isDemoMode
      ? Promise.resolve(demoBadges as BadgeWithStatus[])
      : api.getBadges() as Promise<BadgeWithStatus[]>,
  });
}

export function useXPHistory(limit = 50) {
  return useQuery<XPTransaction[]>({
    queryKey: ['gamification', 'xp-history', limit],
    queryFn: () => isDemoMode
      ? Promise.resolve([])
      : api.getXPHistory(limit) as Promise<XPTransaction[]>,
  });
}
