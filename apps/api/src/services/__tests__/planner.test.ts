import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createChainMock } from '../../__tests__/helpers/mockSupabase.js';

const mockFrom = vi.fn();
vi.mock('../../lib/supabase.js', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

// Mock burnout service (used by planner)
vi.mock('../burnout.js', () => ({
  calculateFatigueScore: vi.fn().mockResolvedValue(30),
}));

import { completePlanItem, deferPlanItem } from '../planner.js';

function chainResolving(result: { data: any; error: any }) {
  return createChainMock(result);
}

describe('planner service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('completePlanItem', () => {
    it('marks item completed and updates user progress', async () => {
      const planItem = {
        id: 'item-1',
        topic_id: 'topic-1',
        type: 'new',
        daily_plans: { user_id: 'user-1', plan_date: '2025-01-15' },
      };

      mockFrom.mockImplementation((table: string) => {
        if (table === 'daily_plan_items') {
          return chainResolving({ data: planItem, error: null });
        }
        if (table === 'user_progress') {
          return chainResolving({ data: null, error: null });
        }
        return chainResolving({ data: null, error: null });
      });

      // Mock dynamic import of gamification
      vi.mock('../gamification.js', () => ({
        awardXP: vi.fn().mockResolvedValue({}),
      }));

      const result = await completePlanItem('user-1', 'item-1', 1.5);
      expect(result.status).toBe('completed');
      expect(result.new_topic_status).toBe('first_pass');
    });

    it('throws when item not found', async () => {
      mockFrom.mockReturnValue(chainResolving({ data: null, error: null }));

      await expect(completePlanItem('user-1', 'bad-id', 1)).rejects.toThrow('Plan item not found');
    });

    it('throws when item belongs to different user', async () => {
      mockFrom.mockReturnValue(
        chainResolving({
          data: {
            id: 'item-1',
            topic_id: 'topic-1',
            type: 'new',
            daily_plans: { user_id: 'other-user' },
          },
          error: null,
        })
      );

      await expect(completePlanItem('user-1', 'item-1', 1)).rejects.toThrow('Plan item not found');
    });
  });

  describe('deferPlanItem', () => {
    it('marks item as deferred', async () => {
      mockFrom.mockReturnValue(
        chainResolving({
          data: {
            id: 'item-1',
            daily_plans: { user_id: 'user-1' },
          },
          error: null,
        })
      );

      const result = await deferPlanItem('user-1', 'item-1');
      expect(result.status).toBe('deferred');
    });

    it('throws when item belongs to different user', async () => {
      mockFrom.mockReturnValue(
        chainResolving({
          data: {
            id: 'item-1',
            daily_plans: { user_id: 'other-user' },
          },
          error: null,
        })
      );

      await expect(deferPlanItem('user-1', 'item-1')).rejects.toThrow('Plan item not found');
    });
  });
});
