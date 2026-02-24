import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { isDemoMode } from '../lib/supabase';
import { demoWeakness, demoTopicHealth } from '../lib/demoData';
import type { WeaknessOverview, TopicHealthDetail } from '../types';

export function useWeaknessOverview() {
  return useQuery<WeaknessOverview>({
    queryKey: ['weakness-overview'],
    queryFn: () => isDemoMode
      ? Promise.resolve(demoWeakness as unknown as WeaknessOverview)
      : api.getWeaknessOverview() as Promise<WeaknessOverview>,
  });
}

export function useTopicHealth(topicId: string) {
  return useQuery<TopicHealthDetail>({
    queryKey: ['topic-health', topicId],
    queryFn: () => isDemoMode
      ? Promise.resolve(demoTopicHealth[topicId] as unknown as TopicHealthDetail)
      : api.getTopicHealth(topicId) as Promise<TopicHealthDetail>,
    enabled: !!topicId && (!isDemoMode || !!demoTopicHealth[topicId]),
  });
}
