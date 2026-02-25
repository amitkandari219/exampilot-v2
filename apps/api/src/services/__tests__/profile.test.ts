import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createChainMock } from '../../__tests__/helpers/mockSupabase.js';

const mockFrom = vi.fn();
vi.mock('../../lib/supabase.js', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

import { getProfile, updateProfile } from '../profile.js';

function chainResolving(result: { data: any; error: any }) {
  return createChainMock(result);
}

describe('profile service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    it('returns name, exam_date, avatar_url', async () => {
      mockFrom.mockReturnValue(
        chainResolving({
          data: { name: 'Amit', exam_date: '2027-06-01', avatar_url: 'https://example.com/avatar.jpg' },
          error: null,
        })
      );

      const result = await getProfile('user-1');
      expect(result).toEqual({
        name: 'Amit',
        exam_date: '2027-06-01',
        avatar_url: 'https://example.com/avatar.jpg',
      });
    });

    it('returns empty defaults for null fields', async () => {
      mockFrom.mockReturnValue(
        chainResolving({
          data: { name: null, exam_date: null, avatar_url: null },
          error: null,
        })
      );

      const result = await getProfile('user-1');
      expect(result).toEqual({ name: '', exam_date: null, avatar_url: null });
    });

    it('throws on error', async () => {
      mockFrom.mockReturnValue(
        chainResolving({ data: null, error: { message: 'DB error' } })
      );

      await expect(getProfile('user-1')).rejects.toThrow('DB error');
    });
  });

  describe('updateProfile', () => {
    it('updates allowed fields', async () => {
      mockFrom.mockReturnValue(chainResolving({ data: null, error: null }));

      const result = await updateProfile('user-1', { name: 'New Name' });
      expect(result).toEqual({ updated: true });
    });

    it('returns updated: false when no fields provided', async () => {
      const result = await updateProfile('user-1', {});
      expect(result).toEqual({ updated: false });
    });

    it('throws on DB error', async () => {
      mockFrom.mockReturnValue(chainResolving({ data: null, error: { message: 'Update failed' } }));

      await expect(updateProfile('user-1', { name: 'Test' })).rejects.toThrow('Update failed');
    });
  });
});
