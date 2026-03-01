import { FastifyInstance } from 'fastify';
import { getProfile, updateProfile } from '../services/profile.js';
import { importScorecard, getScorecardAnalysis } from '../services/scorecard.js';

export async function profileRoutes(app: FastifyInstance) {
  app.get('/api/profile', async (request, reply) => {
    const result = await getProfile(request.userId);
    return reply.status(200).send(result);
  });

  app.patch('/api/profile', async (request, reply) => {
    const body = request.body as { name?: string; exam_date?: string; avatar_url?: string };
    const result = await updateProfile(request.userId, body);
    return reply.status(200).send(result);
  });

  app.post('/api/profile/scorecard', async (request, reply) => {
    const body = request.body as {
      attempt_year: number; stage: 'prelims' | 'mains' | 'interview';
      gs1_marks?: number; gs2_marks?: number; gs3_marks?: number; gs4_marks?: number;
      essay_marks?: number; optional_marks?: number; prelims_score?: number; total_marks?: number;
    };
    const result = await importScorecard(request.userId, body);
    return reply.status(200).send(result);
  });

  app.get('/api/profile/scorecard', async (request, reply) => {
    const result = await getScorecardAnalysis(request.userId);
    return reply.status(200).send(result);
  });
}
