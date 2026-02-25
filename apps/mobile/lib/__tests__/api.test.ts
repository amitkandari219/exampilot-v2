// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Must import after setting up mocks
import { api } from '../api';

describe('api client', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('includes auth header from supabase session', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ strategy_mode: 'balanced' }),
    });

    await api.getStrategy();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/strategy'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Unauthorized' }),
      statusText: 'Unauthorized',
    });

    await expect(api.getStrategy()).rejects.toThrow('Unauthorized');
  });

  it('throws generic error when error response is not JSON', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.reject(new Error('not json')),
      statusText: 'Internal Server Error',
    });

    await expect(api.getStrategy()).rejects.toThrow('Internal Server Error');
  });

  it('sends correct method and body for POST endpoints', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await api.switchMode('aggressive');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/strategy/switch'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ mode: 'aggressive' }),
      })
    );
  });

  it('sends PATCH for updatePlanItem', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'completed' }),
    });

    await api.updatePlanItem('item-1', { status: 'completed', actual_hours: 1 });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/daily-plan/items/item-1'),
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('uses correct base URL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await api.getSyllabus();

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toMatch(/^http/);
    expect(calledUrl).toContain('/api/syllabus');
  });
});
