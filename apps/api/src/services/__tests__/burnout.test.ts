import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createChainMock } from '../../__tests__/helpers/mockSupabase.js';

const mockFrom = vi.fn();
vi.mock('../../lib/supabase.js', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

import { calculateFatigueScore, calculateBRI, checkRecoveryTrigger } from '../burnout.js';

function chainResolving(result: { data: any; error: any }) {
  return createChainMock(result);
}

describe('burnout service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateFatigueScore', () => {
    it('returns 0 with no study logs', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return chainResolving({ data: { daily_hours: 6 }, error: null });
        }
        if (table === 'daily_logs') {
          return chainResolving({ data: [], error: null });
        }
        return chainResolving({ data: null, error: null });
      });

      const score = await calculateFatigueScore('user-1');
      // No consecutive days, no difficulty, no hours → negative clamped to 0
      // formula: (0*10) + (0*8) + (0/6*20) - (7*15) = -105 → clamped to 0
      expect(score).toBe(0);
    });

    it('returns high fatigue for intensive study patterns', async () => {
      const today = new Date();
      const logs = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        return {
          log_date: d.toISOString().split('T')[0],
          hours_studied: 10,
          avg_difficulty: 4,
        };
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return chainResolving({ data: { daily_hours: 6 }, error: null });
        }
        if (table === 'daily_logs') {
          return chainResolving({ data: logs, error: null });
        }
        return chainResolving({ data: null, error: null });
      });

      const score = await calculateFatigueScore('user-1');
      // 7 consecutive days, high difficulty, high hours, no rest
      expect(score).toBeGreaterThan(50);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('clamps score between 0 and 100', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return chainResolving({ data: { daily_hours: 6 }, error: null });
        }
        if (table === 'daily_logs') {
          return chainResolving({ data: [], error: null });
        }
        return chainResolving({ data: null, error: null });
      });

      const score = await calculateFatigueScore('user-1');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateBRI', () => {
    it('returns BRI object with score and signals', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'velocity_snapshots') {
          return chainResolving({ data: { signal_velocity: 70, stress_score: 50 }, error: null });
        }
        if (table === 'burnout_snapshots') {
          return chainResolving({ data: [], error: null });
        }
        if (table === 'buffer_transactions') {
          return chainResolving({ data: [], error: null });
        }
        if (table === 'daily_logs') {
          return chainResolving({ data: [], error: null });
        }
        return chainResolving({ data: null, error: null });
      });

      const result = await calculateBRI('user-1');
      expect(result).toHaveProperty('bri_score');
      expect(result).toHaveProperty('signals');
      expect(result.bri_score).toBeGreaterThanOrEqual(0);
      expect(result.bri_score).toBeLessThanOrEqual(100);
      expect(result.signals).toHaveProperty('stress');
      expect(result.signals).toHaveProperty('buffer');
      expect(result.signals).toHaveProperty('velocity');
      expect(result.signals).toHaveProperty('engagement');
    });

    it('returns high BRI when all signals are healthy', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'velocity_snapshots') {
          return chainResolving({ data: { signal_velocity: 90, stress_score: 20 }, error: null });
        }
        if (table === 'burnout_snapshots') {
          return chainResolving({ data: [], error: null });
        }
        if (table === 'buffer_transactions') {
          return chainResolving({ data: [], error: null });
        }
        if (table === 'daily_logs') {
          return chainResolving({ data: [], error: null });
        }
        return chainResolving({ data: null, error: null });
      });

      const result = await calculateBRI('user-1');
      // No stress persistence, no buffer hemorrhage, low velocity collapse, no engagement decay
      expect(result.bri_score).toBeGreaterThan(80);
    });
  });

  describe('checkRecoveryTrigger', () => {
    it('returns false when already in recovery', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return chainResolving({
            data: { burnout_threshold: 75, recovery_mode_active: true },
            error: null,
          });
        }
        return chainResolving({ data: null, error: null });
      });

      const result = await checkRecoveryTrigger('user-1');
      expect(result).toBe(false);
    });

    it('returns false with insufficient snapshots', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return chainResolving({
            data: { burnout_threshold: 75, recovery_mode_active: false },
            error: null,
          });
        }
        if (table === 'burnout_snapshots') {
          return chainResolving({ data: [{ bri_score: 10 }], error: null });
        }
        return chainResolving({ data: null, error: null });
      });

      const result = await checkRecoveryTrigger('user-1');
      expect(result).toBe(false);
    });

    it('returns true when BRI below threshold for 2 days', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return chainResolving({
            data: { burnout_threshold: 75, recovery_mode_active: false },
            error: null,
          });
        }
        if (table === 'burnout_snapshots') {
          // BRI must be < (100 - 75) = 25 for 2 consecutive days
          return chainResolving({
            data: [{ bri_score: 20 }, { bri_score: 15 }],
            error: null,
          });
        }
        return chainResolving({ data: null, error: null });
      });

      const result = await checkRecoveryTrigger('user-1');
      expect(result).toBe(true);
    });
  });
});
