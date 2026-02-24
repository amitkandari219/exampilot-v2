import { FastifyInstance } from 'fastify';
import { runSimulation } from '../services/simulator.js';

const VALID_TYPES = ['skip_days', 'change_hours', 'change_strategy', 'change_exam_date', 'defer_topics'];

export async function simulatorRoutes(app: FastifyInstance) {
  app.post('/api/simulator/run', async (request, reply) => {
    const body = request.body as any;

    if (!body.type || !VALID_TYPES.includes(body.type)) {
      return reply.status(400).send({ error: `Invalid scenario type. Must be one of: ${VALID_TYPES.join(', ')}` });
    }

    if (!body.params || typeof body.params !== 'object') {
      return reply.status(400).send({ error: 'params object is required' });
    }

    try {
      const result = await runSimulation(request.userId, { type: body.type, params: body.params });
      return reply.status(200).send(result);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message || 'Simulation failed' });
    }
  });
}
