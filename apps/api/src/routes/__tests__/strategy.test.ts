import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildApp } from '../../__tests__/helpers/buildApp.js';

// Mock strategy service
const mockGetStrategy = vi.fn();
const mockSwitchMode = vi.fn();
const mockSwitchExamMode = vi.fn();
const mockCustomizeParams = vi.fn();

vi.mock('../../services/strategy.js', () => ({
  getStrategy: (...args: any[]) => mockGetStrategy(...args),
  switchMode: (...args: any[]) => mockSwitchMode(...args),
  switchExamMode: (...args: any[]) => mockSwitchExamMode(...args),
  customizeParams: (...args: any[]) => mockCustomizeParams(...args),
}));

import { strategyRoutes } from '../strategy.js';

describe('strategy routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/strategy returns strategy data', async () => {
    const strategyData = { strategy_mode: 'balanced', daily_hours: 6 };
    mockGetStrategy.mockResolvedValue(strategyData);

    const app = await buildApp(async (a) => { await a.register(strategyRoutes); });
    const res = await app.inject({
      method: 'GET',
      url: '/api/strategy',
      headers: { authorization: 'Bearer user-1' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(strategyData);
    expect(mockGetStrategy).toHaveBeenCalledWith('user-1');
  });

  it('POST /api/strategy/switch with valid mode', async () => {
    mockSwitchMode.mockResolvedValue({ strategy_mode: 'aggressive' });

    const app = await buildApp(async (a) => { await a.register(strategyRoutes); });
    const res = await app.inject({
      method: 'POST',
      url: '/api/strategy/switch',
      headers: { authorization: 'Bearer user-1' },
      payload: { mode: 'aggressive' },
    });

    expect(res.statusCode).toBe(200);
    expect(mockSwitchMode).toHaveBeenCalledWith('user-1', 'aggressive');
  });

  it('POST /api/strategy/switch rejects invalid mode', async () => {
    const app = await buildApp(async (a) => { await a.register(strategyRoutes); });
    const res = await app.inject({
      method: 'POST',
      url: '/api/strategy/switch',
      headers: { authorization: 'Bearer user-1' },
      payload: { mode: 'invalid_mode' },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/invalid mode/i);
  });

  it('POST /api/strategy/switch rejects missing mode', async () => {
    const app = await buildApp(async (a) => { await a.register(strategyRoutes); });
    const res = await app.inject({
      method: 'POST',
      url: '/api/strategy/switch',
      headers: { authorization: 'Bearer user-1' },
      payload: {},
    });

    expect(res.statusCode).toBe(400);
  });

  it('POST /api/strategy/customize requires non-empty params', async () => {
    const app = await buildApp(async (a) => { await a.register(strategyRoutes); });
    const res = await app.inject({
      method: 'POST',
      url: '/api/strategy/customize',
      headers: { authorization: 'Bearer user-1' },
      payload: { params: {} },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/params/i);
  });

  it('POST /api/strategy/customize with valid params', async () => {
    mockCustomizeParams.mockResolvedValue({ strategy_params: { revision_frequency: 7 } });

    const app = await buildApp(async (a) => { await a.register(strategyRoutes); });
    const res = await app.inject({
      method: 'POST',
      url: '/api/strategy/customize',
      headers: { authorization: 'Bearer user-1' },
      payload: { params: { revision_frequency: 7 } },
    });

    expect(res.statusCode).toBe(200);
    expect(mockCustomizeParams).toHaveBeenCalledWith('user-1', { params: { revision_frequency: 7 } });
  });
});
