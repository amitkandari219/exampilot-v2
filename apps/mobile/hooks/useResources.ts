import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { TopicResource } from '../types';

export function useTopicResources(topicId: string) {
  return useQuery<TopicResource[]>({
    queryKey: ['topic-resources', topicId],
    queryFn: () => api.getTopicResources(topicId),
    enabled: !!topicId,
  });
}
