import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.js';
import { registerAuthMiddleware } from './middleware/auth.js';
import { onboardingRoutes } from './routes/onboarding.js';
import { strategyRoutes } from './routes/strategy.js';
import { pyqRoutes } from './routes/pyq.js';
import { syllabusRoutes } from './routes/syllabus.js';
import { fsrsRoutes } from './routes/fsrs.js';
import { velocityRoutes } from './routes/velocity.js';
import { burnoutRoutes } from './routes/burnout.js';
import { stressRoutes } from './routes/stress.js';
import { plannerRoutes } from './routes/planner.js';

const app = Fastify({ logger: true });

async function start() {
  await app.register(cors, { origin: config.corsOrigin });

  registerAuthMiddleware(app);

  await app.register(onboardingRoutes);
  await app.register(strategyRoutes);
  await app.register(pyqRoutes);
  await app.register(syllabusRoutes);
  await app.register(fsrsRoutes);
  await app.register(velocityRoutes);
  await app.register(burnoutRoutes);
  await app.register(stressRoutes);
  await app.register(plannerRoutes);

  app.get('/health', async () => ({ status: 'ok' }));

  await app.listen({ port: config.port, host: config.host });
  console.log(`Server running on http://${config.host}:${config.port}`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
