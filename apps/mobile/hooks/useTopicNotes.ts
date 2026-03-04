import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { TopicNote, TopicNoteType } from '../types';

export function useTopicNotes(topicId: string | undefined) {
  return useQuery<TopicNote[]>({
    queryKey: ['topic-notes', topicId],
    queryFn: () => api.getTopicNotes(topicId!),
    enabled: !!topicId,
  });
}

export function useAddTopicNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ topicId, noteType, content }: { topicId: string; noteType: TopicNoteType; content: string }) =>
      api.addTopicNote(topicId, { note_type: noteType, content }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['topic-notes', variables.topicId] });
    },
  });
}

export function useUpdateTopicNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string }) =>
      api.updateTopicNote(noteId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topic-notes'] });
    },
  });
}

export function useDeleteTopicNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => api.deleteTopicNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topic-notes'] });
    },
  });
}
