import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import { registerAuthMiddleware } from '../auth.js';

// Mock supabase
const mockGetUser = vi.fn();
vi.mock('../../lib/supabase.js', () => ({
  supabase: {
    auth: {
      getUser: (...args: any[]) => mockGetUser(...args),
    },
  },
}));

function buildTestApp() {
  const app = Fastify({ logger: false });
  registerAuthMiddleware(app);

  app.get('/health', async () => ({ status: 'ok' }));
  app.get('/api/test', async (request) => ({ userId: request.userId }));

  return app;
}

describe('auth middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('skips auth for /health', async () => {
    const app = buildTestApp();
    const res = await app.inject({ method: 'GET', url: '/health' });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it('returns 401 when authorization header is missing', async () => {
    const app = buildTestApp();
    const res = await app.inject({ method: 'GET', url: '/api/test' });

    expect(res.statusCode).toBe(401);
    expect(res.json().error).toMatch(/authorization/i);
  });

  it('returns 401 when authorization header is not Bearer', async () => {
    const app = buildTestApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/test',
      headers: { authorization: 'Basic abc123' },
    });

    expect(res.statusCode).toBe(401);
  });

  it('returns 401 when token is invalid', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' },
    });

    const app = buildTestApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/test',
      headers: { authorization: 'Bearer bad-token' },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error).toMatch(/invalid|expired/i);
  });

  it('sets request.userId with valid token', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-abc-123' } },
      error: null,
    });

    const app = buildTestApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/test',
      headers: { authorization: 'Bearer valid-token' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().userId).toBe('user-abc-123');
  });
});
