import { FastifyInstance } from 'fastify';
import { getTopicNotes, addTopicNote, updateTopicNote, deleteTopicNote } from '../services/topicNotes.js';

export async function topicNotesRoutes(app: FastifyInstance) {
  app.get<{
    Params: { topicId: string };
  }>('/api/topics/:topicId/notes', async (request) => {
    return getTopicNotes(request.userId, request.params.topicId);
  });

  app.post<{
    Params: { topicId: string };
    Body: { note_type: 'text' | 'link'; content: string };
  }>('/api/topics/:topicId/notes', async (request) => {
    const { note_type, content } = request.body;
    return addTopicNote(request.userId, request.params.topicId, note_type, content);
  });

  app.patch<{
    Params: { noteId: string };
    Body: { content: string };
  }>('/api/notes/:noteId', async (request) => {
    return updateTopicNote(request.userId, request.params.noteId, request.body.content);
  });

  app.delete<{
    Params: { noteId: string };
  }>('/api/notes/:noteId', async (request) => {
    await deleteTopicNote(request.userId, request.params.noteId);
    return { success: true };
  });
}
