import { FastifyInstance } from 'fastify';
import { getStrategy, switchMode, customizeParams } from '../services/strategy.js';
import { SwitchModePayload, CustomizePayload } from '../types/index.js';

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

    const validModes = ['conservative', 'aggressive', 'balanced', 'working_professional'];
    if (!validModes.includes(mode)) {
      return reply.status(400).send({ error: `Invalid mode. Must be one of: ${validModes.join(', ')}` });
    }

    const result = await switchMode(request.userId, mode);
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
