import { supabase } from './supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return {};
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const authHeaders = await getAuthHeader();

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}

export const api = {
  // Onboarding (no userId needed — server uses auth token)
  completeOnboarding: (body: unknown) =>
    request('/api/onboarding', { method: 'POST', body: JSON.stringify(body) }),

  // Strategy
  getStrategy: () =>
    request('/api/strategy'),

  switchMode: (mode: string) =>
    request('/api/strategy/switch', { method: 'POST', body: JSON.stringify({ mode }) }),

  customizeParams: (params: Record<string, number>) =>
    request('/api/strategy/customize', { method: 'POST', body: JSON.stringify({ params }) }),

  // PYQ
  getPyqStats: () =>
    request('/api/pyq-stats'),

  getTopicPyqDetail: (topicId: string) =>
    request(`/api/pyq/${topicId}`),

  // Syllabus
  getSyllabus: () =>
    request('/api/syllabus'),

  getSyllabusProgress: () =>
    request('/api/syllabus/progress'),

  updateTopicProgress: (topicId: string, updates: Record<string, unknown>) =>
    request(`/api/syllabus/progress/${topicId}`, { method: 'POST', body: JSON.stringify(updates) }),

  // FSRS
  recordReview: (topicId: string, rating: number) =>
    request(`/api/fsrs/review/${topicId}`, { method: 'POST', body: JSON.stringify({ rating }) }),

  recalculateConfidence: () =>
    request('/api/fsrs/recalculate', { method: 'POST' }),

  getRevisionsDue: (date?: string) =>
    request(`/api/revisions${date ? `?date=${date}` : ''}`),

  getConfidenceOverview: () =>
    request('/api/confidence/overview'),

  // Velocity
  getVelocity: () =>
    request('/api/velocity'),

  getVelocityHistory: (days = 30) =>
    request(`/api/velocity/history?days=${days}`),

  getBuffer: () =>
    request('/api/buffer'),

  // Burnout
  getBurnout: () =>
    request('/api/burnout'),

  startRecovery: () =>
    request('/api/burnout/recovery/start', { method: 'POST' }),

  endRecovery: (reason?: string) =>
    request('/api/burnout/recovery/end', { method: 'POST', body: JSON.stringify({ reason }) }),

  // Stress
  getStress: () =>
    request('/api/stress'),

  // Weakness
  getWeaknessOverview: () =>
    request('/api/weakness/overview'),

  getTopicHealth: (topicId: string) =>
    request(`/api/weakness/topic/${topicId}`),

  getTopicHealthTrend: (topicId: string, days?: number) =>
    request(`/api/weakness/topic/${topicId}/trend?days=${days || 30}`),

  recalculateHealth: () =>
    request('/api/weakness/recalculate', { method: 'POST' }),

  // Planner
  getDailyPlan: (date?: string) =>
    request(`/api/daily-plan${date ? `?date=${date}` : ''}`),

  updatePlanItem: (itemId: string, body: { status: string; actual_hours?: number }) =>
    request(`/api/daily-plan/items/${itemId}`, { method: 'PATCH', body: JSON.stringify(body) }),

  regeneratePlan: (date?: string, hours?: number) =>
    request('/api/daily-plan/regenerate', { method: 'POST', body: JSON.stringify({ date, hours }) }),

  // Recalibration
  getRecalibrationStatus: () =>
    request('/api/recalibration'),

  getRecalibrationHistory: (limit = 20) =>
    request(`/api/recalibration/history?limit=${limit}`),

  triggerRecalibration: () =>
    request('/api/recalibration/trigger', { method: 'POST' }),

  setAutoRecalibrate: (enabled: boolean) =>
    request('/api/recalibration/auto', { method: 'POST', body: JSON.stringify({ enabled }) }),
};
