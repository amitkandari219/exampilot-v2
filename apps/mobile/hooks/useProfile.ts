import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface ProfileData {
  name: string;
  exam_date: string | null;
  prelims_date: string | null;
  avatar_url: string | null;
  attempt_number: string | null;
  created_at: string;
  current_mode: string;
  daily_hours: number;
  study_approach: string;
  strategy_mode: string;
}

export function useProfile() {
  return useQuery<ProfileData>({
    queryKey: ['profile'],
    queryFn: () => api.getProfile() as Promise<ProfileData>,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { name?: string; exam_date?: string; avatar_url?: string; daily_hours?: number; study_approach?: string }) =>
      api.updateProfile(body),
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      const previous = queryClient.getQueryData(['profile']);
      queryClient.setQueryData(['profile'], (old: any) =>
        old ? { ...old, ...body } : old
      );
      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['daily-plan'] });
      queryClient.invalidateQueries({ queryKey: ['strategy'] });
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['profile'], context.previous);
      }
    },
  });
}
