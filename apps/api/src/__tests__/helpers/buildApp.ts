import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';

/**
 * Builds a Fastify app for integration tests.
 * Injects a fake auth middleware that sets request.userId from the Authorization header.
 */
export async function buildApp(
  registerRoutes: (app: FastifyInstance) => Promise<void>,
  options?: { userId?: string }
): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  // Fake auth middleware: extracts userId from "Bearer <userId>" or uses default
  app.addHook('preHandler', async (request, reply) => {
    if (request.url === '/health') return;

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Missing or invalid authorization header' });
    }

    request.userId = options?.userId || authHeader.slice(7);
  });

  await registerRoutes(app);

  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}
