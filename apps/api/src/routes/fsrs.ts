import { FastifyInstance } from 'fastify';
import { recordReview, batchRecalculateConfidence, getRevisionsDue, getRevisionsCalendar } from '../services/fsrs.js';
import { todayString } from '../utils/dateUtils.js';

export async function fsrsRoutes(app: FastifyInstance) {
  app.post<{
    Params: { topicId: string };
    Body: { rating: number };
  }>('/api/fsrs/review/:topicId', async (request, reply) => {
    const { rating } = request.body;

    if (!rating || rating < 1 || rating > 4) {
      return reply.status(400).send({ error: 'Rating must be between 1 and 4' });
    }

    const result = await recordReview(request.userId, request.params.topicId, rating);
    return reply.status(200).send(result);
  });

  app.post('/api/fsrs/recalculate', async (request, reply) => {
    await batchRecalculateConfidence(request.userId);
    return reply.status(200).send({ success: true });
  });

  app.get<{
    Querystring: { date?: string };
  }>('/api/revisions', async (request, reply) => {
    const date = request.query.date || todayString();
    const result = await getRevisionsDue(request.userId, date);
    return reply.status(200).send(result);
  });

  // Confidence overview moved to decayTrigger routes (GET /api/confidence/overview)

  app.get<{
    Querystring: { month?: string };
  }>('/api/revisions/calendar', async (request, reply) => {
    const month = request.query.month || new Date().toISOString().slice(0, 7);
    const result = await getRevisionsCalendar(request.userId, month);
    return reply.status(200).send(result);
  });
}
