import { FastifyInstance } from 'fastify';
import { getStrategy, switchMode, switchExamMode, customizeParams, getStrategyDelta } from '../services/strategy.js';
import { getProactiveScopeTriage } from '../services/strategyCascade.js';
import { SwitchModePayload, CustomizePayload, ExamMode, STRATEGY_MODES, EXAM_MODES } from '../types/index.js';

export async function strategyRoutes(app: FastifyInstance) {
  app.get('/api/strategy', async (request, reply) => {
    const result = await getStrategy(request.userId);
    return reply.status(200).send(result);
  });

  app.post<{
    Body: SwitchModePayload;
  }>('/api/strategy/switch', async (request, reply) => {
    const { mode } = request.body;

    if (!mode) {
      return reply.status(400).send({ error: 'mode is required' });
    }

    if (!STRATEGY_MODES.includes(mode)) {
      return reply.status(400).send({ error: `Invalid mode. Must be one of: ${STRATEGY_MODES.join(', ')}` });
    }

    const result = await switchMode(request.userId, mode);
    return reply.status(200).send(result);
  });

  app.post<{
    Body: { examMode: string };
  }>('/api/strategy/exam-mode', async (request, reply) => {
    const { examMode } = request.body;

    if (!examMode || !EXAM_MODES.includes(examMode as ExamMode)) {
      return reply.status(400).send({ error: `Invalid examMode. Must be one of: ${EXAM_MODES.join(', ')}` });
    }

    const result = await switchExamMode(request.userId, examMode as ExamMode);
    return reply.status(200).send(result);
  });

  app.get('/api/strategy/scope-triage', async (request, reply) => {
    const result = await getProactiveScopeTriage(request.userId);
    return reply.status(200).send(result);
  });

  app.get('/api/strategy/delta', async (request, reply) => {
    const result = await getStrategyDelta(request.userId);
    return reply.status(200).send(result);
  });

  app.post<{
    Body: CustomizePayload;
  }>('/api/strategy/customize', async (request, reply) => {
    const { params } = request.body;

    if (!params || Object.keys(params).length === 0) {
      return reply.status(400).send({ error: 'params object is required and must not be empty' });
    }

    const result = await customizeParams(request.userId, { params });
    return reply.status(200).send(result);
  });
}
