import { FastifyInstance } from 'fastify';
import { getAnswerStats, logAnswer } from '../services/answerWriting.js';

export async function answerWritingRoutes(app: FastifyInstance) {
  app.get('/api/answer-writing/stats', async (request) => {
    return getAnswerStats(request.userId);
  });

  app.post('/api/answer-writing', async (request) => {
    return logAnswer(request.userId, request.body as Record<string, unknown>);
  });
}
