import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock api module
jest.mock('../../lib/api', () => ({
  api: {
    getStrategy: jest.fn().mockResolvedValue({
      strategy_mode: 'balanced',
      strategy_params: { revision_frequency: 4 },
      daily_hours: 6,
      current_mode: 'mains',
    }),
    switchMode: jest.fn().mockResolvedValue({ strategy_mode: 'aggressive' }),
    customizeParams: jest.fn().mockResolvedValue({}),
    switchExamMode: jest.fn().mockResolvedValue({}),
  },
}));

import { useStrategy, useSwitchMode } from '../useStrategy';
import { api } from '../../lib/api';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useStrategy', () => {
  it('uses ["strategy"] as query key', async () => {
    const { result } = renderHook(() => useStrategy(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.getStrategy).toHaveBeenCalled();
    expect(result.current.data).toEqual({
      strategy_mode: 'balanced',
      strategy_params: { revision_frequency: 4 },
      daily_hours: 6,
      current_mode: 'mains',
    });
  });
});

describe('useSwitchMode', () => {
  it('calls api.switchMode and invalidates strategy query', async () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useSwitchMode(), { wrapper });

    result.current.mutate('aggressive');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.switchMode).toHaveBeenCalledWith('aggressive');
  });
});
