import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildApp } from '../../__tests__/helpers/buildApp.js';

const mockCompleteOnboarding = vi.fn();
const mockCompleteOnboardingV2 = vi.fn();
const mockResetUserData = vi.fn();

vi.mock('../../services/strategy.js', () => ({
  completeOnboarding: (...args: any[]) => mockCompleteOnboarding(...args),
  completeOnboardingV2: (...args: any[]) => mockCompleteOnboardingV2(...args),
  resetUserData: (...args: any[]) => mockResetUserData(...args),
}));

import { onboardingRoutes } from '../onboarding.js';

describe('onboarding routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /api/onboarding V1 payload', async () => {
    mockCompleteOnboarding.mockResolvedValue({ id: 'user-1', strategy_mode: 'balanced' });

    const app = await buildApp(async (a) => { await a.register(onboardingRoutes); });
    const res = await app.inject({
      method: 'POST',
      url: '/api/onboarding',
      headers: { authorization: 'Bearer user-1' },
      payload: {
        chosen_mode: 'balanced',
        exam_date: '2027-06-01',
        name: 'Test User',
        daily_hours: 6,
        is_working_professional: false,
        attempt_number: 'first',
        study_approach: 'strategic',
        fallback_strategy: 'adjust_plan',
        recommended_mode: 'balanced',
      },
    });

    expect(res.statusCode).toBe(200);
    expect(mockCompleteOnboarding).toHaveBeenCalled();
  });

  it('POST /api/onboarding V2 payload (detected by answers field)', async () => {
    mockCompleteOnboardingV2.mockResolvedValue({ id: 'user-1', strategy_mode: 'aggressive' });

    const app = await buildApp(async (a) => { await a.register(onboardingRoutes); });
    const res = await app.inject({
      method: 'POST',
      url: '/api/onboarding',
      headers: { authorization: 'Bearer user-1' },
      payload: {
        answers: {
          name: 'Test',
          target_exam_year: 2027,
          attempt_number: 'second',
          user_type: 'student',
          challenges: ['time_management'],
        },
        chosen_mode: 'aggressive',
        targets: { daily_hours: 8, daily_new_topics: 3, weekly_revisions: 5, weekly_tests: 3, weekly_answer_writing: 4, weekly_ca_hours: 6 },
        exam_date: '2027-06-01',
      },
    });

    expect(res.statusCode).toBe(200);
    expect(mockCompleteOnboardingV2).toHaveBeenCalled();
    expect(mockCompleteOnboarding).not.toHaveBeenCalled();
  });

  it('POST /api/onboarding V1 rejects missing required fields', async () => {
    const app = await buildApp(async (a) => { await a.register(onboardingRoutes); });
    const res = await app.inject({
      method: 'POST',
      url: '/api/onboarding',
      headers: { authorization: 'Bearer user-1' },
      payload: { chosen_mode: 'balanced' }, // missing exam_date, name
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/missing required/i);
  });

  it('POST /api/onboarding V2 rejects missing answers.name', async () => {
    const app = await buildApp(async (a) => { await a.register(onboardingRoutes); });
    const res = await app.inject({
      method: 'POST',
      url: '/api/onboarding',
      headers: { authorization: 'Bearer user-1' },
      payload: {
        answers: { target_exam_year: 2027, attempt_number: 'first', user_type: 'student', challenges: [] },
        chosen_mode: 'balanced',
        exam_date: '2027-06-01',
      },
    });

    expect(res.statusCode).toBe(400);
  });

  it('POST /api/onboarding/reset calls resetUserData', async () => {
    mockResetUserData.mockResolvedValue({ success: true });

    const app = await buildApp(async (a) => { await a.register(onboardingRoutes); });
    const res = await app.inject({
      method: 'POST',
      url: '/api/onboarding/reset',
      headers: { authorization: 'Bearer user-1' },
      payload: {},
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ success: true });
    expect(mockResetUserData).toHaveBeenCalledWith('user-1');
  });

  it('POST /api/onboarding/reset returns 500 on error', async () => {
    mockResetUserData.mockRejectedValue(new Error('Reset failed'));

    const app = await buildApp(async (a) => { await a.register(onboardingRoutes); });
    const res = await app.inject({
      method: 'POST',
      url: '/api/onboarding/reset',
      headers: { authorization: 'Bearer user-1' },
      payload: {},
    });

    expect(res.statusCode).toBe(500);
    expect(res.json().error).toBe('Reset failed');
  });
});
