import { vi } from 'vitest';

/**
 * Chainable mock builder for Supabase queries.
 * Usage:
 *   mockSupabaseQuery({ data: [...], error: null })
 *   → mocks .from().select().eq().single() etc.
 */
export function createChainMock(result: { data: any; error: any }) {
  const chain: any = {};
  const methods = [
    'select', 'insert', 'update', 'upsert', 'delete',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'is',
    'order', 'limit', 'single', 'maybeSingle',
    'range', 'match', 'filter', 'not',
  ];

  for (const method of methods) {
    chain[method] = vi.fn().mockReturnValue(chain);
  }

  // Terminal methods resolve to the result
  chain.single = vi.fn().mockResolvedValue(result);
  chain.maybeSingle = vi.fn().mockResolvedValue(result);
  chain.then = vi.fn((resolve: any) => resolve(result));

  // Make chain thenable (auto-resolves when awaited without .single())
  Object.defineProperty(chain, Symbol.toStringTag, { value: 'Promise' });

  return chain;
}

/**
 * Creates a mock supabase instance with a `.from()` that returns chain mocks.
 * Pass a map of table → result for table-specific responses.
 */
export function mockSupabase(tableResults: Record<string, { data: any; error: any }> = {}) {
  const defaultResult = { data: null, error: null };

  const from = vi.fn((table: string) => {
    return createChainMock(tableResults[table] || defaultResult);
  });

  const auth = {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    }),
    getSession: vi.fn().mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
      error: null,
    }),
  };

  return { from, auth };
}

/**
 * Installs supabase mock for the given module path.
 * Returns the mock for further configuration.
 */
export function installSupabaseMock(tableResults: Record<string, { data: any; error: any }> = {}) {
  const mock = mockSupabase(tableResults);

  vi.mock('../lib/supabase.js', () => ({
    supabase: mock,
  }));

  return mock;
}
