import { FastifyInstance } from 'fastify';
import { completeOnboarding } from '../services/strategy.js';
import { OnboardingPayload } from '../types/index.js';

export async function onboardingRoutes(app: FastifyInstance) {
  app.post<{
    Body: OnboardingPayload;
  }>('/api/onboarding', async (request, reply) => {
    const userId = request.userId;
    const payload = request.body;

    if (!payload.chosen_mode || !payload.exam_date || !payload.name) {
      return reply.status(400).send({ error: 'Missing required fields: chosen_mode, exam_date, name' });
    }

    const result = await completeOnboarding(userId, payload);
    return reply.status(200).send(result);
  });
}
