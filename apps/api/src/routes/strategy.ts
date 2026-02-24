import { FastifyInstance } from 'fastify';
import { getStrategy, switchMode, customizeParams } from '../services/strategy.js';
import { SwitchModePayload, CustomizePayload } from '../types/index.js';

export async function strategyRoutes(app: FastifyInstance) {
  // GET /api/strategy/:userId — Returns current mode + all params
  app.get<{
    Params: { userId: string };
  }>('/api/strategy/:userId', async (request, reply) => {
    const { userId } = request.params;
    const result = await getStrategy(userId);
    return reply.status(200).send(result);
  });

  // POST /api/strategy/:userId/switch — Switch mode, repopulate params from defaults
  app.post<{
    Params: { userId: string };
    Body: SwitchModePayload;
  }>('/api/strategy/:userId/switch', async (request, reply) => {
    const { userId } = request.params;
    const { mode } = request.body;

    if (!mode) {
      return reply.status(400).send({ error: 'mode is required' });
    }

    const validModes = ['conservative', 'aggressive', 'balanced', 'working_professional'];
    if (!validModes.includes(mode)) {
      return reply.status(400).send({ error: `Invalid mode. Must be one of: ${validModes.join(', ')}` });
    }

    const result = await switchMode(userId, mode);
    return reply.status(200).send(result);
  });

  // POST /api/strategy/:userId/customize — Merge individual param overrides
  app.post<{
    Params: { userId: string };
    Body: CustomizePayload;
  }>('/api/strategy/:userId/customize', async (request, reply) => {
    const { userId } = request.params;
    const { params } = request.body;

    if (!params || Object.keys(params).length === 0) {
      return reply.status(400).send({ error: 'params object is required and must not be empty' });
    }

    const result = await customizeParams(userId, { params });
    return reply.status(200).send(result);
  });
}
