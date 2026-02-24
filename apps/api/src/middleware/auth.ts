import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../lib/supabase.js';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }

  request.userId = data.user.id;
}

export function registerAuthMiddleware(app: FastifyInstance) {
  app.addHook('preHandler', async (request, reply) => {
    // Skip auth for health check
    if (request.url === '/health') return;
    // Skip auth for non-API routes
    if (!request.url.startsWith('/api/')) return;

    await authMiddleware(request, reply);
  });
}
