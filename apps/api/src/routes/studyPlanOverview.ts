import { FastifyInstance } from 'fastify';
import { getStudyPlanOverview } from '../services/studyPlanOverview.js';

export async function studyPlanOverviewRoutes(app: FastifyInstance) {
  app.get('/api/study-plan-overview', async (request) => {
    return getStudyPlanOverview(request.userId);
  });
}
