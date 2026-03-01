import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useResources() {
  return useQuery({
    queryKey: ['resources'],
    queryFn: () => api.getResources(),
  });
}

export function useResourcesForTopic(topicId: string) {
  return useQuery({
    queryKey: ['resources', 'topic', topicId],
    queryFn: () => api.getResourcesForTopic(topicId),
    enabled: !!topicId,
  });
}

export function useReadingProgress() {
  return useQuery({
    queryKey: ['reading-progress'],
    queryFn: () => api.getReadingProgress(),
  });
}

export function useUpdateReadingProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resourceId, body }: { resourceId: string; body: { pages_read?: number; total_pages?: number; notes?: string } }) =>
      api.updateReadingProgress(resourceId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-progress'] });
    },
  });
}
