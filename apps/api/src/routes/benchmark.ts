import { FastifyInstance } from 'fastify';
import {
  getBenchmarkProfile,
  getBenchmarkHistory,
  calculateBenchmark,
} from '../services/benchmark.js';

export async function benchmarkRoutes(app: FastifyInstance) {
  app.get('/api/benchmark', async (request, reply) => {
    const result = await getBenchmarkProfile(request.userId);
    return reply.status(200).send(result);
  });

  app.get('/api/benchmark/history', async (request, reply) => {
    const { days } = request.query as { days?: string };
    const result = await getBenchmarkHistory(request.userId, days ? parseInt(days, 10) : 30);
    return reply.status(200).send(result);
  });

  app.post('/api/benchmark/calculate', async (request, reply) => {
    const result = await calculateBenchmark(request.userId);
    return reply.status(200).send(result);
  });
}
