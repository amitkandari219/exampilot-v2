import { FastifyInstance } from 'fastify';
import { switchExamMode, previewModeSwitch } from '../services/mode.js';
import type { ExamMode } from '../types/index.js';

export async function modeRoutes(app: FastifyInstance) {
  // POST /api/mode/switch — switch exam mode with full cascade
  app.post<{
    Body: { mode: string };
  }>('/api/mode/switch', async (request, reply) => {
    const { mode } = request.body;

    const validModes: ExamMode[] = ['mains', 'prelims', 'post_prelims'];
    if (!mode || !validModes.includes(mode as ExamMode)) {
      return reply.status(400).send({ error: `Invalid mode. Must be one of: ${validModes.join(', ')}` });
    }

    const result = await switchExamMode(request.userId, mode as ExamMode);
    return reply.status(200).send(result);
  });

  // GET /api/mode/preview?mode=prelims — show diff WITHOUT applying
  app.get<{
    Querystring: { mode?: string };
  }>('/api/mode/preview', async (request, reply) => {
    const { mode } = request.query as { mode?: string };

    const validModes: ExamMode[] = ['mains', 'prelims', 'post_prelims'];
    if (!mode || !validModes.includes(mode as ExamMode)) {
      return reply.status(400).send({ error: `mode query param required. Must be one of: ${validModes.join(', ')}` });
    }

    const result = await previewModeSwitch(request.userId, mode as ExamMode);
    return reply.status(200).send(result);
  });
}
