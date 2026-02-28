import { supabase } from './supabase';
import type {
  StrategyMode, ExamMode, StrategyParams,
  GamificationProfile, BadgeWithStatus, XPTransaction,
  BenchmarkProfile, BenchmarkHistoryPoint,
  MockTest, MockAnalytics, MockTopicHistory,
  SimulationScenario, SimulationResult,
  CAStats, CASubjectGap,
  ScopeTriageResult, StrategyDelta, MockCSVResult,
} from '../types';
import type {
  VelocityData, VelocityHistoryPoint, BufferData,
  BurnoutData, StressData, DailyPlan, ConfidenceOverview,
  WeaknessOverview, TopicHealthDetail, RecalibrationStatus,
  WeeklyReviewSummary, PYQStats, RecalibrationResult, RecalibrationLogEntry,
  UserProfile,
} from '../types';

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

export interface StrategyData {
  strategy_mode: StrategyMode;
  strategy_params: StrategyParams;
  daily_hours: number;
  current_mode: ExamMode;
  fatigue_threshold?: number;
  buffer_capacity?: number;
  fsrs_target_retention?: number;
  burnout_threshold?: number;
}

interface SyllabusData {
  subjects: Array<{
    id: string;
    name: string;
    papers: string[];
    chapters: Array<{
      id: string;
      name: string;
      topics: Array<{
        id: string;
        name: string;
        importance: number;
        difficulty: number;
        estimated_hours: number;
        pyq_weight: number;
        user_progress?: { status: string; confidence_status: string } | null;
      }>;
    }>;
  }>;
}

export interface SyllabusProgressData {
  subjects: Array<{
    id: string;
    name: string;
    total_topics: number;
    completed_topics: number;
    weighted_completion: number;
    avg_confidence: number;
  }>;
}

export interface RevisionsDueData {
  revisions: Array<{
    topic_id: string;
    topic_name: string;
    due: string;
    stability: number;
    difficulty: number;
  }>;
}

export const api = {
  // Onboarding
  completeOnboarding: (body: object): Promise<UserProfile> =>
    request<UserProfile>('/api/onboarding', { method: 'POST', body: JSON.stringify(body) }),

  resetOnboarding: (): Promise<{ success: boolean }> =>
    request<{ success: boolean }>('/api/onboarding/reset', { method: 'POST', body: '{}' }),

  // Strategy
  getStrategy: (): Promise<StrategyData> =>
    request<StrategyData>('/api/strategy'),

  switchMode: (mode: StrategyMode): Promise<void> =>
    request<void>('/api/strategy/switch', { method: 'POST', body: JSON.stringify({ mode }) }),

  customizeParams: (params: Record<string, number>): Promise<UserProfile> =>
    request<UserProfile>('/api/strategy/customize', { method: 'POST', body: JSON.stringify({ params }) }),

  switchExamMode: (examMode: ExamMode): Promise<{ current_mode: ExamMode; old_mode: ExamMode }> =>
    request<{ current_mode: ExamMode; old_mode: ExamMode }>('/api/strategy/exam-mode', { method: 'POST', body: JSON.stringify({ examMode }) }),

  getScopeTriage: (): Promise<ScopeTriageResult> =>
    request<ScopeTriageResult>('/api/strategy/scope-triage'),

  getStrategyDelta: (): Promise<StrategyDelta> =>
    request<StrategyDelta>('/api/strategy/delta'),

  // PYQ
  getPyqStats: (): Promise<PYQStats> =>
    request<PYQStats>('/api/pyq-stats'),

  getTopicPyqDetail: (topicId: string): Promise<{ topic_id: string; years: Array<{ year: number; count: number }> }> =>
    request<{ topic_id: string; years: Array<{ year: number; count: number }> }>(`/api/pyq/${topicId}`),

  // Syllabus
  getSyllabus: (): Promise<SyllabusData> =>
    request<SyllabusData>('/api/syllabus'),

  getSyllabusProgress: (): Promise<SyllabusProgressData> =>
    request<SyllabusProgressData>('/api/syllabus/progress'),

  updateTopicProgress: (topicId: string, updates: Record<string, unknown>): Promise<void> =>
    request<void>(`/api/syllabus/progress/${topicId}`, { method: 'POST', body: JSON.stringify(updates) }),

  // FSRS
  recordReview: (topicId: string, rating: number): Promise<{ card: object; next_review: string }> =>
    request<{ card: object; next_review: string }>(`/api/fsrs/review/${topicId}`, { method: 'POST', body: JSON.stringify({ rating }) }),

  recalculateConfidence: (): Promise<{ updated: number }> =>
    request<{ updated: number }>('/api/fsrs/recalculate', { method: 'POST' }),

  getRevisionsDue: (date?: string): Promise<RevisionsDueData> =>
    request<RevisionsDueData>(`/api/revisions${date ? `?date=${date}` : ''}`),

  getConfidenceOverview: (): Promise<ConfidenceOverview> =>
    request<ConfidenceOverview>('/api/confidence/overview'),

  // Velocity
  getVelocity: (): Promise<VelocityData> =>
    request<VelocityData>('/api/velocity'),

  getVelocityHistory: (days = 30): Promise<VelocityHistoryPoint[]> =>
    request<VelocityHistoryPoint[]>(`/api/velocity/history?days=${days}`),

  getBuffer: (): Promise<BufferData> =>
    request<BufferData>('/api/buffer'),

  // Burnout
  getBurnout: (): Promise<BurnoutData> =>
    request<BurnoutData>('/api/burnout'),

  startRecovery: (): Promise<{ status: string }> =>
    request<{ status: string }>('/api/burnout/recovery/start', { method: 'POST' }),

  endRecovery: (reason?: string): Promise<{ status: string }> =>
    request<{ status: string }>('/api/burnout/recovery/end', { method: 'POST', body: JSON.stringify({ reason }) }),

  // Stress
  getStress: (): Promise<StressData> =>
    request<StressData>('/api/stress'),

  // Weakness
  getWeaknessOverview: (): Promise<WeaknessOverview> =>
    request<WeaknessOverview>('/api/weakness/overview'),

  getTopicHealth: (topicId: string): Promise<TopicHealthDetail> =>
    request<TopicHealthDetail>(`/api/weakness/topic/${topicId}`),

  getTopicHealthTrend: (topicId: string, days?: number): Promise<Array<{ date: string; score: number }>> =>
    request<Array<{ date: string; score: number }>>(`/api/weakness/topic/${topicId}/trend?days=${days || 30}`),

  recalculateHealth: (): Promise<{ updated: number }> =>
    request<{ updated: number }>('/api/weakness/recalculate', { method: 'POST' }),

  // Planner
  getDailyPlan: (date?: string): Promise<DailyPlan> =>
    request<DailyPlan>(`/api/daily-plan${date ? `?date=${date}` : ''}`),

  updatePlanItem: (itemId: string, body: { status: string; actual_hours?: number }): Promise<{ status: string }> =>
    request<{ status: string }>(`/api/daily-plan/items/${itemId}`, { method: 'PATCH', body: JSON.stringify(body) }),

  regeneratePlan: (date?: string, hours?: number): Promise<DailyPlan> =>
    request<DailyPlan>('/api/daily-plan/regenerate', { method: 'POST', body: JSON.stringify({ date, hours }) }),

  // Recalibration
  getRecalibrationStatus: (): Promise<RecalibrationStatus> =>
    request<RecalibrationStatus>('/api/recalibration'),

  getRecalibrationHistory: (limit = 20): Promise<RecalibrationLogEntry[]> =>
    request<RecalibrationLogEntry[]>(`/api/recalibration/history?limit=${limit}`),

  triggerRecalibration: (): Promise<RecalibrationResult> =>
    request<RecalibrationResult>('/api/recalibration/trigger', { method: 'POST' }),

  setAutoRecalibrate: (enabled: boolean): Promise<{ auto_recalibrate: boolean }> =>
    request<{ auto_recalibrate: boolean }>('/api/recalibration/auto', { method: 'POST', body: JSON.stringify({ enabled }) }),

  // Gamification
  getGamificationProfile: (): Promise<GamificationProfile> =>
    request<GamificationProfile>('/api/gamification'),

  getBadges: (): Promise<BadgeWithStatus[]> =>
    request<BadgeWithStatus[]>('/api/gamification/badges'),

  getXPHistory: (limit = 50): Promise<XPTransaction[]> =>
    request<XPTransaction[]>(`/api/gamification/xp-history?limit=${limit}`),

  // Benchmark
  getBenchmark: (): Promise<BenchmarkProfile> =>
    request<BenchmarkProfile>('/api/benchmark'),

  getBenchmarkHistory: (days = 30): Promise<BenchmarkHistoryPoint[]> =>
    request<BenchmarkHistoryPoint[]>(`/api/benchmark/history?days=${days}`),

  // Weekly Review
  getWeeklyReview: (weekEnd?: string): Promise<WeeklyReviewSummary> =>
    request<WeeklyReviewSummary>(`/api/weekly-review${weekEnd ? `?weekEnd=${weekEnd}` : ''}`),

  getWeeklyReviewHistory: (limit = 8): Promise<WeeklyReviewSummary[]> =>
    request<WeeklyReviewSummary[]>(`/api/weekly-review/history?limit=${limit}`),

  generateWeeklyReview: (weekEnd?: string): Promise<WeeklyReviewSummary> =>
    request<WeeklyReviewSummary>('/api/weekly-review/generate', { method: 'POST', body: JSON.stringify({ weekEnd }) }),

  // Mock Tests
  createMock: (body: Record<string, unknown>): Promise<MockTest> =>
    request<MockTest>('/api/mocks', { method: 'POST', body: JSON.stringify(body) }),

  getMocks: (limit = 20): Promise<MockTest[]> =>
    request<MockTest[]>(`/api/mocks?limit=${limit}`),

  getMockAnalytics: (): Promise<MockAnalytics> =>
    request<MockAnalytics>('/api/mocks/analytics'),

  getMockTopicHistory: (topicId: string): Promise<MockTopicHistory> =>
    request<MockTopicHistory>(`/api/mocks/topic/${topicId}/history`),

  importMockCSV: (csvContent: string): Promise<MockCSVResult> =>
    request<MockCSVResult>('/api/mocks/import-csv', { method: 'POST', body: JSON.stringify({ csv: csvContent }) }),

  // Simulator
  runSimulation: (scenario: SimulationScenario): Promise<SimulationResult> =>
    request<SimulationResult>('/api/simulator/run', { method: 'POST', body: JSON.stringify(scenario) }),

  // Current Affairs
  logCA: (body: { hours_spent: number; completed: boolean; notes?: string; subject_ids?: string[] }): Promise<void> =>
    request<void>('/api/ca/log', { method: 'POST', body: JSON.stringify(body) }),
  getCAStats: (month?: string): Promise<CAStats> =>
    request<CAStats>(`/api/ca/stats${month ? `?month=${month}` : ''}`),
  getCASubjectGaps: (): Promise<CASubjectGap[]> =>
    request<CASubjectGap[]>('/api/ca/subject-gaps'),

  // Profile
  getProfile: (): Promise<UserProfile> =>
    request<UserProfile>('/api/profile'),
  updateProfile: (body: { name?: string; exam_date?: string; avatar_url?: string }): Promise<UserProfile> =>
    request<UserProfile>('/api/profile', { method: 'PATCH', body: JSON.stringify(body) }),
};
