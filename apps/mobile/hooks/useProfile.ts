import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface ProfileData {
  name: string;
  exam_date: string | null;
  avatar_url: string | null;
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
    mutationFn: (body: { name?: string; exam_date?: string; avatar_url?: string }) =>
      api.updateProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
