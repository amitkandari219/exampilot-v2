import { FastifyInstance } from 'fastify';
import { completeOnboarding, completeOnboardingV2, resetUserData } from '../services/strategy.js';
import { OnboardingPayload, OnboardingV2Payload } from '../types/index.js';

export async function onboardingRoutes(app: FastifyInstance) {
  app.post<{
    Body: OnboardingPayload | OnboardingV2Payload;
  }>('/api/onboarding', async (request, reply) => {
    const userId = request.userId;
    const payload = request.body;

    // Detect V2 payload by presence of `answers` field
    if ('answers' in payload) {
      const v2 = payload as OnboardingV2Payload;
      if (!v2.chosen_mode || !v2.exam_date || !v2.answers?.name) {
        return reply.status(400).send({ error: 'Missing required fields: chosen_mode, exam_date, answers.name' });
      }
      const result = await completeOnboardingV2(userId, v2);
      return reply.status(200).send(result);
    }

    // V1 fallback
    const v1 = payload as OnboardingPayload;
    if (!v1.chosen_mode || !v1.exam_date || !v1.name) {
      return reply.status(400).send({ error: 'Missing required fields: chosen_mode, exam_date, name' });
    }

    const result = await completeOnboarding(userId, v1);
    return reply.status(200).send(result);
  });

  app.post('/api/onboarding/reset', async (request, reply) => {
    const result = await resetUserData(request.userId);
    return reply.status(200).send(result);
  });
}
