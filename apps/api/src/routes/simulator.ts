import { FastifyInstance } from 'fastify';
import { runSimulation } from '../services/simulator.js';
import type { SimulationScenarioType } from '../types/index.js';

const VALID_TYPES: SimulationScenarioType[] = ['skip_days', 'change_hours', 'change_strategy', 'change_exam_date', 'defer_topics', 'focus_subject'];

export async function simulatorRoutes(app: FastifyInstance) {
  app.post<{
    Body: { type: string; params: Record<string, unknown> };
  }>('/api/simulator/run', async (request, reply) => {
    const { type, params } = request.body;

    if (!type || !VALID_TYPES.includes(type as SimulationScenarioType)) {
      return reply.status(400).send({ error: `Invalid scenario type. Must be one of: ${VALID_TYPES.join(', ')}` });
    }

    if (!params || typeof params !== 'object') {
      return reply.status(400).send({ error: 'params object is required' });
    }

    const result = await runSimulation(request.userId, { type: type as SimulationScenarioType, params });
    return reply.status(200).send(result);
  });
}
