import { FastifyInstance } from 'fastify';
import { getUserPercentile } from '../services/cohortBenchmark.js';

export async function cohortBenchmarkRoutes(app: FastifyInstance) {
  app.get('/api/cohort/percentile', async (request) => {
    return getUserPercentile(request.userId);
  });
}
