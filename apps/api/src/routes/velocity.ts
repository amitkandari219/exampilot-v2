import { FastifyInstance } from 'fastify';
import { calculateVelocity, getVelocityHistory, getBufferDetails } from '../services/velocity.js';

export async function velocityRoutes(app: FastifyInstance) {
  app.get('/api/velocity', async (request, reply) => {
    const velocity = await calculateVelocity(request.userId);

    // Get streak
    const { supabase } = await import('../lib/supabase.js');
    const { data: streak } = await supabase
      .from('streaks')
      .select('current_count, best_count')
      .eq('user_id', request.userId)
      .eq('streak_type', 'study')
      .single();

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('buffer_balance, buffer_capacity')
      .eq('id', request.userId)
      .single();

    return reply.status(200).send({
      ...velocity,
      streak: streak || null,
      buffer_balance: profile?.buffer_balance || 0,
      buffer_capacity: profile?.buffer_capacity || 0.15,
    });
  });

  app.get<{
    Querystring: { days?: string };
  }>('/api/velocity/history', async (request, reply) => {
    const days = parseInt((request.query as any).days || '30', 10);
    const result = await getVelocityHistory(request.userId, days);
    return reply.status(200).send(result);
  });

  app.get('/api/buffer', async (request, reply) => {
    const result = await getBufferDetails(request.userId);
    return reply.status(200).send(result);
  });
}
