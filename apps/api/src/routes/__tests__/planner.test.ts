import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildApp } from '../../__tests__/helpers/buildApp.js';

const mockGenerateDailyPlan = vi.fn();
const mockCompletePlanItem = vi.fn();
const mockDeferPlanItem = vi.fn();
const mockRegeneratePlan = vi.fn();

vi.mock('../../services/planner.js', () => ({
  generateDailyPlan: (...args: any[]) => mockGenerateDailyPlan(...args),
  completePlanItem: (...args: any[]) => mockCompletePlanItem(...args),
  deferPlanItem: (...args: any[]) => mockDeferPlanItem(...args),
  regeneratePlan: (...args: any[]) => mockRegeneratePlan(...args),
}));

vi.mock('../../services/velocity.js', () => ({
  processEndOfDay: vi.fn().mockResolvedValue({}),
}));

// Mock supabase for the skipped status path
vi.mock('../../lib/supabase.js', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }),
  },
}));

import { plannerRoutes } from '../planner.js';

describe('planner routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/daily-plan generates plan for today by default', async () => {
    const plan = { id: 'plan-1', items: [] };
    mockGenerateDailyPlan.mockResolvedValue(plan);

    const app = await buildApp(async (a) => { await a.register(plannerRoutes); });
    const res = await app.inject({
      method: 'GET',
      url: '/api/daily-plan',
      headers: { authorization: 'Bearer user-1' },
    });

    expect(res.statusCode).toBe(200);
    expect(mockGenerateDailyPlan).toHaveBeenCalledWith('user-1', expect.any(String));
  });

  it('GET /api/daily-plan accepts date query param', async () => {
    mockGenerateDailyPlan.mockResolvedValue({ id: 'plan-1' });

    const app = await buildApp(async (a) => { await a.register(plannerRoutes); });
    await app.inject({
      method: 'GET',
      url: '/api/daily-plan?date=2025-03-15',
      headers: { authorization: 'Bearer user-1' },
    });

    expect(mockGenerateDailyPlan).toHaveBeenCalledWith('user-1', '2025-03-15');
  });

  it('PATCH /api/daily-plan/items/:itemId completes item', async () => {
    mockCompletePlanItem.mockResolvedValue({ status: 'completed', new_topic_status: 'first_pass' });

    const app = await buildApp(async (a) => { await a.register(plannerRoutes); });
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/daily-plan/items/item-1',
      headers: { authorization: 'Bearer user-1' },
      payload: { status: 'completed', actual_hours: 1.5 },
    });

    expect(res.statusCode).toBe(200);
    expect(mockCompletePlanItem).toHaveBeenCalledWith('user-1', 'item-1', 1.5);
  });

  it('PATCH /api/daily-plan/items/:itemId defers item', async () => {
    mockDeferPlanItem.mockResolvedValue({ status: 'deferred' });

    const app = await buildApp(async (a) => { await a.register(plannerRoutes); });
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/daily-plan/items/item-1',
      headers: { authorization: 'Bearer user-1' },
      payload: { status: 'deferred' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('deferred');
  });

  it('PATCH /api/daily-plan/items/:itemId rejects invalid status', async () => {
    const app = await buildApp(async (a) => { await a.register(plannerRoutes); });
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/daily-plan/items/item-1',
      headers: { authorization: 'Bearer user-1' },
      payload: { status: 'invalid' },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/invalid status/i);
  });
});
