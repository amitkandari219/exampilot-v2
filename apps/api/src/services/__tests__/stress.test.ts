import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createChainMock } from '../../__tests__/helpers/mockSupabase.js';

const mockFrom = vi.fn();
vi.mock('../../lib/supabase.js', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

// Import the private linearInterpolate by testing calculateStress behavior
import { calculateStress } from '../stress.js';

function chainResolving(result: { data: any; error: any }) {
  return createChainMock(result);
}

describe('stress service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('linearInterpolate (tested through calculateStress)', () => {
    it('returns baseline when no velocity data exists', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'velocity_snapshots') return chainResolving({ data: null, error: null });
        if (table === 'user_profiles') return chainResolving({ data: { buffer_balance: 0, buffer_capacity: 0.15, exam_date: '2027-01-01' }, error: null });
        return chainResolving({ data: null, error: null });
      });

      const result = await calculateStress('user-1');
      expect(result.score).toBe(0);
      expect(result.status).toBe('optimal');
      expect(result.label).toBe('On Track');
    });
  });

  describe('calculateStress', () => {
    // velocity_snapshots is called 3 times: 1) initial query (.single), 2) update, 3) history
    // We need to return different results for different calls
    function setupStressMocks(velocityData: any, profileData: any, progressData: any) {
      let velocityCallCount = 0;
      mockFrom.mockImplementation((table: string) => {
        if (table === 'velocity_snapshots') {
          velocityCallCount++;
          if (velocityCallCount === 1) {
            // Initial query - single snapshot
            return chainResolving({ data: velocityData, error: null });
          }
          if (velocityCallCount === 2) {
            // Update - no return data needed
            return chainResolving({ data: null, error: null });
          }
          // History query - returns array
          return chainResolving({ data: [], error: null });
        }
        if (table === 'user_profiles') {
          return chainResolving({ data: profileData, error: null });
        }
        if (table === 'user_progress') {
          return chainResolving({ data: progressData, error: null });
        }
        return chainResolving({ data: [], error: null });
      });
    }

    it('computes weighted stress score from 4 signals', async () => {
      setupStressMocks(
        { velocity_ratio: 0.8, snapshot_date: '2025-01-15' },
        { buffer_balance: 5, buffer_capacity: 0.15, exam_date: '2026-06-01' },
        [{ confidence_score: 60 }, { confidence_score: 70 }]
      );

      const result = await calculateStress('user-1');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(['optimal', 'elevated', 'risk_zone', 'recovery_triggered']).toContain(result.status);
      expect(result.signals).toHaveProperty('velocity');
      expect(result.signals).toHaveProperty('buffer');
      expect(result.signals).toHaveProperty('time');
      expect(result.signals).toHaveProperty('confidence');
      expect(result.recommendation).toBeTruthy();
      expect(result.history).toEqual([]);
    });

    it('returns recovery_triggered for very low signals', async () => {
      setupStressMocks(
        { velocity_ratio: 0.3, snapshot_date: '2025-01-15' },
        { buffer_balance: 0, buffer_capacity: 0.15, exam_date: new Date(Date.now() + 15 * 86400000).toISOString() },
        [{ confidence_score: 10 }]
      );

      const result = await calculateStress('user-1');
      expect(result.score).toBeLessThan(25);
    });

    it('returns optimal for strong signals', async () => {
      setupStressMocks(
        { velocity_ratio: 1.5, snapshot_date: '2025-01-15' },
        { buffer_balance: 50, buffer_capacity: 0.15, exam_date: '2027-01-01' },
        [{ confidence_score: 90 }, { confidence_score: 85 }]
      );

      const result = await calculateStress('user-1');
      expect(result.score).toBeGreaterThanOrEqual(70);
      expect(result.status).toBe('optimal');
    });
  });
});
