import { supabase } from '../lib/supabase.js';
import type { BenchmarkProfile, BenchmarkHistoryPoint, BenchmarkStatus } from '../types/index.js';
import { toDateString, daysAgo } from '../utils/dateUtils.js';
import { clamp } from '../utils/math.js';
import { BENCHMARK_WEIGHTS } from '../constants/thresholds.js';

function linearInterpolate(value: number, low: number, high: number): number {
  if (value <= low) return 0;
  if (value >= high) return 100;
  return ((value - low) / (high - low)) * 100;
}

function getStatus(score: number): BenchmarkStatus {
  if (score >= 80) return 'exam_ready';
  if (score >= 60) return 'on_track';
  if (score >= 40) return 'needs_work';
  return 'at_risk';
}

const COMPONENT_RECOMMENDATIONS: Record<string, string> = {
  coverage: 'Focus on completing more topics — especially high PYQ-weight ones to boost coverage.',
  confidence: 'Several topics are fading or stale. Schedule quick revision sessions to keep them fresh.',
  weakness: 'Several topics are in critical or weak zones. Prioritize targeted study on your weakest areas.',
  consistency: 'Build a stronger study habit — aim for daily sessions and complete your plan items.',
  velocity: 'Your study pace is below target. Try to increase daily output on high-gravity topics.',
};

export async function calculateBenchmark(userId: string): Promise<BenchmarkProfile> {
  const snapshotDate = toDateString(new Date());

  // --- Coverage (weight 0.30): weighted_completion_pct * 100 ---
  const { data: velocitySnapshot } = await supabase
    .from('velocity_snapshots')
    .select('weighted_completion_pct, velocity_ratio')
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  const coverageScore = clamp((velocitySnapshot?.weighted_completion_pct || 0) * 100, 0, 100);

  // --- Confidence (weight 0.25): fresh_count / total_with_status * 100 ---
  const { data: progressRows } = await supabase
    .from('user_progress')
    .select('confidence_status')
    .eq('user_id', userId)
    .neq('status', 'untouched');

  const totalWithStatus = progressRows?.length || 0;
  const freshCount = progressRows?.filter((p: any) => p.confidence_status === 'fresh').length || 0;
  const confidenceScore = totalWithStatus > 0 ? clamp((freshCount / totalWithStatus) * 100, 0, 100) : 0;

  // --- Weakness (weight 0.20): healthy_pct * 100 where healthy = health_score >= 65 ---
  const { data: healthRows } = await supabase
    .from('user_progress')
    .select('health_score')
    .eq('user_id', userId)
    .neq('status', 'untouched');

  const totalHealth = healthRows?.length || 0;
  const healthyCount = healthRows?.filter((h: any) => h.health_score >= 65).length || 0;
  const weaknessScore = totalHealth > 0 ? clamp((healthyCount / totalHealth) * 100, 0, 100) : 0;

  // --- Consistency (weight 0.15): streakScore * 0.5 + planCompletionRate * 0.5 ---
  const { data: streak } = await supabase
    .from('streaks')
    .select('current_count')
    .eq('user_id', userId)
    .eq('streak_type', 'study')
    .single();

  const streakDays = streak?.current_count || 0;
  const streakScore = clamp((streakDays / 14) * 100, 0, 100);

  // Get plan completion rate from last 7 days of weekly reviews
  const { data: recentReview } = await supabase
    .from('weekly_reviews')
    .select('plan_completion_rate')
    .eq('user_id', userId)
    .order('week_end_date', { ascending: false })
    .limit(1)
    .single();

  const planCompletionRate = recentReview?.plan_completion_rate || 0;
  const consistencyScore = clamp(streakScore * 0.5 + planCompletionRate * 0.5, 0, 100);

  // --- Velocity (weight 0.10): linearInterpolate(velocity_ratio, 0.5, 1.2) ---
  const velocityRatio = velocitySnapshot?.velocity_ratio || 0;
  const velocityScore = clamp(linearInterpolate(velocityRatio, 0.5, 1.2), 0, 100);

  // --- Composite ---
  const composite = coverageScore * BENCHMARK_WEIGHTS.COVERAGE + confidenceScore * BENCHMARK_WEIGHTS.CONFIDENCE + weaknessScore * BENCHMARK_WEIGHTS.WEAKNESS + consistencyScore * BENCHMARK_WEIGHTS.CONSISTENCY + velocityScore * BENCHMARK_WEIGHTS.VELOCITY;
  const compositeScore = Math.round(clamp(composite, 0, 100));
  const status = getStatus(compositeScore);

  // --- Trend: compare to 7-day-old snapshot ---
  const { data: oldSnapshot } = await supabase
    .from('benchmark_snapshots')
    .select('composite_score')
    .eq('user_id', userId)
    .lte('snapshot_date', toDateString(daysAgo(7)))
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  const trendDelta = oldSnapshot ? compositeScore - oldSnapshot.composite_score : 0;
  let trend: string;
  if (trendDelta > 2) trend = 'improving';
  else if (trendDelta < -2) trend = 'declining';
  else trend = 'stable';

  // --- Recommendations: bottom 2 (or 3 if score < 60) ---
  const components = [
    { key: 'coverage', score: coverageScore },
    { key: 'confidence', score: confidenceScore },
    { key: 'weakness', score: weaknessScore },
    { key: 'consistency', score: consistencyScore },
    { key: 'velocity', score: velocityScore },
  ];
  components.sort((a, b) => a.score - b.score);
  const takeCount = compositeScore < 60 ? 3 : 2;
  const recommendations = components.slice(0, takeCount).map((c) => COMPONENT_RECOMMENDATIONS[c.key]);

  // --- Upsert snapshot ---
  await supabase
    .from('benchmark_snapshots')
    .upsert({
      user_id: userId,
      snapshot_date: snapshotDate,
      composite_score: compositeScore,
      status,
      coverage_score: coverageScore,
      confidence_score: confidenceScore,
      weakness_score: weaknessScore,
      consistency_score: consistencyScore,
      velocity_score: velocityScore,
      trend,
      trend_delta: trendDelta,
      recommendations,
    }, { onConflict: 'user_id,snapshot_date' });

  return {
    composite_score: compositeScore,
    status,
    components: {
      coverage: Math.round(coverageScore),
      confidence: Math.round(confidenceScore),
      weakness: Math.round(weaknessScore),
      consistency: Math.round(consistencyScore),
      velocity: Math.round(velocityScore),
    },
    trend,
    trend_delta: trendDelta,
    recommendations,
    snapshot_date: snapshotDate,
  };
}

export async function getBenchmarkProfile(userId: string): Promise<BenchmarkProfile> {
  const { data: snapshot } = await supabase
    .from('benchmark_snapshots')
    .select('*')
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  if (!snapshot) {
    return calculateBenchmark(userId);
  }

  return {
    composite_score: snapshot.composite_score,
    status: snapshot.status as BenchmarkStatus,
    components: {
      coverage: Math.round(snapshot.coverage_score),
      confidence: Math.round(snapshot.confidence_score),
      weakness: Math.round(snapshot.weakness_score),
      consistency: Math.round(snapshot.consistency_score),
      velocity: Math.round(snapshot.velocity_score),
    },
    trend: snapshot.trend || 'stable',
    trend_delta: snapshot.trend_delta,
    recommendations: snapshot.recommendations as string[],
    snapshot_date: snapshot.snapshot_date,
  };
}

export async function getBenchmarkHistory(userId: string, days = 30): Promise<BenchmarkHistoryPoint[]> {
  const { data, error } = await supabase
    .from('benchmark_snapshots')
    .select('snapshot_date, composite_score, status')
    .eq('user_id', userId)
    .gte('snapshot_date', toDateString(daysAgo(days)))
    .order('snapshot_date', { ascending: true });

  if (error) throw error;

  return (data || []).map((d: any) => ({
    snapshot_date: d.snapshot_date,
    composite_score: d.composite_score,
    status: d.status as BenchmarkStatus,
  }));
}
