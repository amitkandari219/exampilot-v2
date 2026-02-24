const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}

export const api = {
  completeOnboarding: (userId: string, body: unknown) =>
    request(`/api/onboarding/${userId}`, { method: 'POST', body: JSON.stringify(body) }),

  getStrategy: (userId: string) =>
    request(`/api/strategy/${userId}`),

  switchMode: (userId: string, mode: string) =>
    request(`/api/strategy/${userId}/switch`, { method: 'POST', body: JSON.stringify({ mode }) }),

  customizeParams: (userId: string, params: Record<string, number>) =>
    request(`/api/strategy/${userId}/customize`, { method: 'POST', body: JSON.stringify({ params }) }),
};
