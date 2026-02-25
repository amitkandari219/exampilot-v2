import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createChainMock } from '../../__tests__/helpers/mockSupabase.js';

// Mock supabase before importing services
const mockFrom = vi.fn();
vi.mock('../../lib/supabase.js', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
    auth: { getUser: vi.fn() },
  },
}));

import {
  getDefaultParams,
  getPersonaDefaults,
  getStrategy,
  switchMode,
  customizeParams,
  resetUserData,
  completeOnboarding,
  completeOnboardingV2,
} from '../strategy.js';

function chainResolving(result: { data: any; error: any }) {
  return createChainMock(result);
}

describe('strategy service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDefaultParams', () => {
    it('returns DB params when available', async () => {
      const dbParams = [
        { param_name: 'revision_frequency', param_value: '7' },
        { param_name: 'daily_new_topics', param_value: '2' },
      ];
      mockFrom.mockReturnValue(chainResolving({ data: dbParams, error: null }));

      const result = await getDefaultParams('balanced');
      expect(mockFrom).toHaveBeenCalledWith('strategy_mode_defaults');
      expect(result).toEqual({ revision_frequency: 7, daily_new_topics: 2 });
    });

    it('falls back to hardcoded defaults when DB returns empty', async () => {
      mockFrom.mockReturnValue(chainResolving({ data: [], error: null }));

      const result = await getDefaultParams('conservative');
      expect(result.revision_frequency).toBe(5);
      expect(result.daily_new_topics).toBe(1);
      expect(result.pyq_weight).toBe(35);
    });

    it('falls back to hardcoded defaults when DB returns null', async () => {
      mockFrom.mockReturnValue(chainResolving({ data: null, error: null }));

      const result = await getDefaultParams('aggressive');
      expect(result.daily_new_topics).toBe(3);
      expect(result.pyq_weight).toBe(50);
    });
  });

  describe('getPersonaDefaults', () => {
    it('returns persona for each mode', () => {
      const conservative = getPersonaDefaults('conservative');
      expect(conservative.buffer_capacity).toBe(0.20);
      expect(conservative.burnout_threshold).toBe(65);

      const aggressive = getPersonaDefaults('aggressive');
      expect(aggressive.fsrs_target_retention).toBe(0.95);
      expect(aggressive.buffer_capacity).toBe(0.10);

      const balanced = getPersonaDefaults('balanced');
      expect(balanced.burnout_threshold).toBe(75);

      const wp = getPersonaDefaults('working_professional');
      expect(wp.buffer_capacity).toBe(0.25);
    });
  });

  describe('getStrategy', () => {
    it('returns profile strategy columns', async () => {
      const profileData = {
        strategy_mode: 'balanced',
        strategy_params: { revision_frequency: 4 },
        daily_hours: 6,
        current_mode: 'mains',
      };
      mockFrom.mockReturnValue(chainResolving({ data: profileData, error: null }));

      const result = await getStrategy('user-1');
      expect(mockFrom).toHaveBeenCalledWith('user_profiles');
      expect(result).toEqual(profileData);
    });

    it('throws on error', async () => {
      mockFrom.mockReturnValue(
        chainResolving({ data: null, error: { message: 'not found' } })
      );

      await expect(getStrategy('user-1')).rejects.toEqual({ message: 'not found' });
    });
  });

  describe('resetUserData', () => {
    it('deletes from all tables and resets profile', async () => {
      // All delete calls succeed, profile update succeeds
      mockFrom.mockReturnValue(chainResolving({ data: null, error: null }));

      const result = await resetUserData('user-1');
      expect(result).toEqual({ success: true });
      // Should have called from() many times (20+ tables + profile update)
      expect(mockFrom.mock.calls.length).toBeGreaterThan(20);
    });
  });

  describe('completeOnboardingV2', () => {
    it('resets data, upserts profile, targets, promise, and snapshot', async () => {
      const profileResult = { id: 'user-1', strategy_mode: 'balanced' };
      mockFrom.mockReturnValue(chainResolving({ data: profileResult, error: null }));

      const payload = {
        answers: {
          name: 'Test User',
          target_exam_year: 2027,
          attempt_number: 'first' as const,
          user_type: 'student' as const,
          challenges: ['time_management' as const],
        },
        chosen_mode: 'balanced' as const,
        targets: {
          daily_hours: 6,
          daily_new_topics: 2,
          weekly_revisions: 4,
          weekly_tests: 2,
          weekly_answer_writing: 3,
          weekly_ca_hours: 5,
        },
        promise_text: 'I will study hard',
        exam_date: '2027-06-01',
      };

      const result = await completeOnboardingV2('user-1', payload);
      expect(result).toEqual(profileResult);

      // Verify tables touched: should include user_profiles, user_targets, user_promises, persona_snapshots
      const tablesUsed = mockFrom.mock.calls.map((c: any[]) => c[0]);
      expect(tablesUsed).toContain('user_profiles');
      expect(tablesUsed).toContain('user_targets');
      expect(tablesUsed).toContain('user_promises');
      expect(tablesUsed).toContain('persona_snapshots');
    });
  });

  describe('customizeParams', () => {
    it('merges new params with existing', async () => {
      const existingParams = { revision_frequency: 4, daily_new_topics: 2 };
      const updatedProfile = { strategy_params: { revision_frequency: 4, daily_new_topics: 5 } };

      // First call fetches current, second updates
      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount <= 1) {
          return chainResolving({ data: { strategy_params: existingParams }, error: null });
        }
        return chainResolving({ data: updatedProfile, error: null });
      });

      const result = await customizeParams('user-1', { params: { daily_new_topics: 5 } });
      expect(result).toEqual(updatedProfile);
    });
  });
});
