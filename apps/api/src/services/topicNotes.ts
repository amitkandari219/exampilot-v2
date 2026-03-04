import { supabase } from '../lib/supabase.js';

interface TopicNote {
  id: string;
  user_id: string;
  topic_id: string;
  note_type: 'text' | 'link';
  content: string;
  created_at: string;
  updated_at: string;
}

export async function getTopicNotes(userId: string, topicId: string): Promise<TopicNote[]> {
  const { data, error } = await supabase
    .from('topic_notes')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as TopicNote[];
}

export async function addTopicNote(
  userId: string,
  topicId: string,
  noteType: 'text' | 'link',
  content: string
): Promise<TopicNote> {
  const { data, error } = await supabase
    .from('topic_notes')
    .insert({ user_id: userId, topic_id: topicId, note_type: noteType, content })
    .select()
    .single();

  if (error) throw error;
  return data as TopicNote;
}

export async function updateTopicNote(
  userId: string,
  noteId: string,
  content: string
): Promise<TopicNote> {
  const { data, error } = await supabase
    .from('topic_notes')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', noteId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Note not found');
  return data as TopicNote;
}

export async function deleteTopicNote(userId: string, noteId: string): Promise<void> {
  const { error } = await supabase
    .from('topic_notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId);

  if (error) throw error;
}
