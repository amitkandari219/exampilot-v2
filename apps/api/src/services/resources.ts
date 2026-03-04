import { supabase } from '../lib/supabase.js';
import type { TopicResource } from '@exampilot/shared-types';

export async function getTopicResources(topicId: string): Promise<TopicResource[]> {
  const { data, error } = await supabase
    .from('topic_resources')
    .select('id, topic_id, resource_type, title, source_name, url, display_order')
    .eq('topic_id', topicId)
    .order('display_order');

  if (error) throw error;
  return (data ?? []) as unknown as TopicResource[];
}
