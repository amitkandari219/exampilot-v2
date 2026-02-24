import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.js';
import { onboardingRoutes } from './routes/onboarding.js';
import { strategyRoutes } from './routes/strategy.js';

const app = Fastify({ logger: true });

async function start() {
  await app.register(cors, { origin: config.corsOrigin });

  await app.register(onboardingRoutes);
  await app.register(strategyRoutes);

  app.get('/health', async () => ({ status: 'ok' }));

  await app.listen({ port: config.port, host: config.host });
  console.log(`Server running on http://${config.host}:${config.port}`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
