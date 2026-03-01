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

  // Resume point (T5-9)
  getResumePoint: (): Promise<{ topic_id: string; topic_name: string; subject_name: string; chapter_name: string; status: string; last_touched: string } | null> =>
    request('/api/daily-plan/resume-point'),

  // Topic urgency (T4-11)
  getTopicUrgency: (): Promise<{ days_remaining: number; topics: Array<{ topic_id: string; topic_name: string; urgency_score: number; level: string }> }> =>
    request('/api/weakness/urgency'),

  // Diminishing returns (T4-16)
  getDiminishingReturns: (): Promise<{ topics: Array<{ topic_id: string; topic_name: string; hours_spent: number; score_delta: number; suggestion: string }> }> =>
    request('/api/weakness/diminishing-returns'),

  // PYQ volatility (T4-20)
  getPyqVolatility: (): Promise<{ topics: Array<{ topic_id: string; topic_name: string; volatility_score: number; volatility_label: string }> }> =>
    request('/api/pyq-volatility'),

  // PYQ correlation (T4-5)
  getPyqCorrelation: (): Promise<{ high_risk_topics: Array<{ topic_id: string; topic_name: string; risk_score: number; risk_level: string }> }> =>
    request('/api/pyq-correlation'),

  // Maintenance mode (T4-22)
  getMaintenanceTopics: (): Promise<Array<{ topic_id: string; topic_name: string; maintenance_eligible: boolean }>> =>
    request('/api/fsrs/maintenance'),

  enableMaintenanceMode: (topicId: string): Promise<{ maintenance_active: boolean }> =>
    request(`/api/fsrs/maintenance/${topicId}`, { method: 'POST' }),

  // Work pressure (T4-24)
  updateWorkPressure: (level: number): Promise<{ work_pressure_level: number }> =>
    request('/api/stress/work-pressure', { method: 'POST', body: JSON.stringify({ level }) }),

  // CA with workplace source (T5-5)
  logCAWithSource: (body: { hours_spent: number; completed: boolean; notes?: string; subject_ids?: string[]; source?: 'personal' | 'workplace' }): Promise<{ success: boolean; study_credit_hours?: number }> =>
    request('/api/ca/log', { method: 'POST', body: JSON.stringify(body) }),

  // Mains delta (T2-22)
  getMainsDelta: (): Promise<{ total_enriched: number; mains_gaps: Array<{ topic_id: string; topic_name: string; mains_importance: number }> }> =>
    request('/api/strategy/mains-delta'),

  // Scorecard (T2-17)
  importScorecard: (body: { attempt_year: number; stage: string; gs1_marks?: number; gs2_marks?: number; gs3_marks?: number; gs4_marks?: number; essay_marks?: number }): Promise<{ success: boolean }> =>
    request('/api/profile/scorecard', { method: 'POST', body: JSON.stringify(body) }),

  getScorecardAnalysis: (): Promise<{ scorecards: unknown[]; weak_zones: unknown[]; weak_subject_ids: string[] }> =>
    request('/api/profile/scorecard'),

  // Micro-session plan (T2-10)
  getMicroSessionPlan: (minutes = 15): Promise<{ items: Array<{ topic_id: string; topic_name: string; subject_name: string; chapter_name: string; estimated_minutes: number; type: string; difficulty: number; pyq_weight: number }>; available_minutes: number; total_minutes: number }> =>
    request(`/api/daily-plan/micro?minutes=${minutes}`),

  // Resources (INFRA-3 + T2-9)
  getResources: (): Promise<Array<{ id: string; title: string; author: string | null; resource_type: string; is_standard: boolean }>> =>
    request('/api/resources'),

  getResourcesForTopic: (topicId: string): Promise<Array<{ resource_id: string; title: string; author: string | null; chapter_range: string | null; relevance: number }>> =>
    request(`/api/resources/topic/${topicId}`),

  // Reading progress (T4-2)
  getReadingProgress: (): Promise<Array<{ id: string; resource_id: string; title: string; author: string | null; total_pages: number | null; pages_read: number; completion_pct: number; last_read_at: string | null }>> =>
    request('/api/reading-progress'),

  updateReadingProgress: (resourceId: string, body: { pages_read?: number; total_pages?: number; notes?: string }): Promise<{ completion_pct: number }> =>
    request(`/api/reading-progress/${resourceId}`, { method: 'POST', body: JSON.stringify(body) }),

  // Answer writing (INFRA-4 + T2-7)
  getAnswerTemplates: (topicId: string): Promise<Array<{ id: string; prompt: string; word_limit: number; question_type: string; structure_hints: string[]; key_points: string[] }>> =>
    request(`/api/answers/templates/${topicId}`),

  submitAnswer: (body: { template_id: string; topic_id: string; word_count?: number; time_taken_minutes?: number; score_structure?: number; score_intro?: number; score_examples?: number; score_analysis?: number; score_conclusion?: number; notes?: string }): Promise<{ total_score: number | null }> =>
    request('/api/answers/submit', { method: 'POST', body: JSON.stringify(body) }),

  getAnswerHistory: (topicId?: string): Promise<Array<{ id: string; topic_id: string; prompt: string; total_score: number | null; submitted_at: string }>> =>
    request(`/api/answers/history${topicId ? `?topicId=${topicId}` : ''}`),

  getAnswerStats: (): Promise<{ total_submissions: number; avg_score: number; topics_practiced: number; avg_time_minutes: number }> =>
    request('/api/answers/stats'),

  // Peer benchmarking (T2-8)
  getPeerBenchmark: (): Promise<{ cohort: string; sample_size: number; metrics: Record<string, { your_value: number; percentile: number | null; cohort_median: number }> }> =>
    request('/api/benchmark/peer'),

  // Deep mock analysis (T2-4)
  getDeepMockAnalysis: (): Promise<{ question_type_breakdown: Array<{ type: string; total: number; correct: number; accuracy: number }>; difficulty_breakdown: Array<{ level: string; total: number; correct: number; accuracy: number }>; negative_marking_impact: number; total_questions: number }> =>
    request('/api/mocks/deep-analysis'),

  // Paper analysis (T4-13)
  getPaperAnalysis: (): Promise<{ papers: Array<{ paper: string; total: number; correct: number; accuracy: number }> }> =>
    request('/api/mocks/paper-analysis'),

  // Micro-mock questions (T4-3)
  getMicroMockQuestions: (topicId: string): Promise<{ questions: Array<{ id: string; question_text: string; option_a: string; option_b: string; option_c: string; option_d: string }>; topic_id: string }> =>
    request(`/api/quiz/micro-mock/${topicId}`),

  // Active recall prompts (T4-12)
  getActiveRecallQuestions: (topicId: string): Promise<{ questions: Array<{ id: string; question_text: string; option_a: string; option_b: string; option_c: string; option_d: string }>; topic_id: string }> =>
    request(`/api/quiz/recall/${topicId}`),

  // Submit quiz
  submitQuiz: (body: { quiz_type: 'micro_mock' | 'active_recall'; topic_id: string; answers: Array<{ question_id: string; selected_option: string }>; time_taken_seconds?: number }): Promise<{ correct: number; total: number; accuracy: number }> =>
    request('/api/quiz/submit', { method: 'POST', body: JSON.stringify(body) }),

  // Quiz history
  getQuizHistory: (topicId?: string): Promise<Array<{ id: string; quiz_type: string; topic_id: string; correct: number; accuracy: number; created_at: string }>> =>
    request(`/api/quiz/history${topicId ? `?topicId=${topicId}` : ''}`),
};
