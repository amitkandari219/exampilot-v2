import { supabase } from '../lib/supabase.js';

// ── INFRA-6: Cohort aggregation ──
// Computes anonymized percentile data across all users in a cohort

type Metric = 'completion_pct' | 'velocity_ratio' | 'benchmark_score' | 'streak_days';

interface CohortMetricRow {
  cohort_key: string;
  metric: Metric;
  percentile_25: number;
  percentile_50: number;
  percentile_75: number;
  percentile_90: number;
  mean_value: number;
  sample_size: number;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export async function computeCohortStats(cohortKey: string) {
  // Fetch all users in this cohort
  const modeFilter = cohortKey === 'all' ? undefined : cohortKey.startsWith('prelims') ? 'prelims' : 'mains';

  let userQuery = supabase.from('user_profiles').select('id');
  if (modeFilter) {
    userQuery = userQuery.eq('current_mode', modeFilter);
  }
  const { data: users } = await userQuery;
  if (!users || users.length < 5) return; // Need minimum sample

  const userIds = users.map((u) => u.id);

  // Compute completion_pct from velocity_snapshots
  const { data: velocityRows } = await supabase
    .from('velocity_snapshots')
    .select('user_id, velocity_ratio, weighted_completion_pct')
    .in('user_id', userIds)
    .order('snapshot_date', { ascending: false });

  // Take latest per user
  const latestVelocity = new Map<string, { velocity_ratio: number; completion_pct: number }>();
  for (const row of velocityRows || []) {
    if (!latestVelocity.has(row.user_id)) {
      latestVelocity.set(row.user_id, {
        velocity_ratio: row.velocity_ratio || 0,
        completion_pct: row.weighted_completion_pct || 0,
      });
    }
  }

  // Benchmark scores
  const { data: benchmarkRows } = await supabase
    .from('benchmark_snapshots')
    .select('user_id, composite_score')
    .in('user_id', userIds)
    .order('snapshot_date', { ascending: false });

  const latestBenchmark = new Map<string, number>();
  for (const row of benchmarkRows || []) {
    if (!latestBenchmark.has(row.user_id)) {
      latestBenchmark.set(row.user_id, row.composite_score || 0);
    }
  }

  // Streaks
  const { data: streakRows } = await supabase
    .from('streaks')
    .select('user_id, current_count')
    .in('user_id', userIds)
    .eq('streak_type', 'study');

  const streakMap = new Map<string, number>();
  for (const row of streakRows || []) {
    streakMap.set(row.user_id, row.current_count || 0);
  }

  // Build metric arrays
  const completionValues = Array.from(latestVelocity.values()).map((v) => v.completion_pct).sort((a, b) => a - b);
  const velocityValues = Array.from(latestVelocity.values()).map((v) => v.velocity_ratio).sort((a, b) => a - b);
  const benchmarkValues = Array.from(latestBenchmark.values()).sort((a, b) => a - b);
  const streakValues = Array.from(streakMap.values()).sort((a, b) => a - b);

  const metrics: Array<{ metric: Metric; values: number[] }> = [
    { metric: 'completion_pct', values: completionValues },
    { metric: 'velocity_ratio', values: velocityValues },
    { metric: 'benchmark_score', values: benchmarkValues },
    { metric: 'streak_days', values: streakValues },
  ];

  for (const { metric, values } of metrics) {
    if (values.length === 0) continue;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;

    await supabase.from('cohort_stats').upsert({
      cohort_key: cohortKey,
      metric,
      percentile_25: percentile(values, 25),
      percentile_50: percentile(values, 50),
      percentile_75: percentile(values, 75),
      percentile_90: percentile(values, 90),
      mean_value: Math.round(mean * 100) / 100,
      sample_size: values.length,
      computed_at: new Date().toISOString(),
    }, { onConflict: 'cohort_key,metric' });
  }
}

// ── T2-8: Peer benchmarking ──

export async function getPeerBenchmark(userId: string) {
  // Get user's current mode to determine cohort
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('current_mode')
    .eq('id', userId)
    .single();

  const mode = profile?.current_mode || 'mains';
  const cohortKey = `${mode}_all`;

  // Get user's own metrics
  const { data: velocityRow } = await supabase
    .from('velocity_snapshots')
    .select('velocity_ratio, weighted_completion_pct')
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  const { data: benchmarkRow } = await supabase
    .from('benchmark_snapshots')
    .select('composite_score')
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  const { data: streakRow } = await supabase
    .from('streaks')
    .select('current_count')
    .eq('user_id', userId)
    .eq('streak_type', 'study')
    .single();

  // Get cohort stats
  const { data: cohortRows } = await supabase
    .from('cohort_stats')
    .select('*')
    .in('cohort_key', [cohortKey, 'all']);

  const cohortMap = new Map<string, CohortMetricRow>();
  for (const row of (cohortRows || []) as unknown as CohortMetricRow[]) {
    // Prefer mode-specific cohort, fall back to 'all'
    const existing = cohortMap.get(row.metric);
    if (!existing || row.cohort_key === cohortKey) {
      cohortMap.set(row.metric, row);
    }
  }

  function computePercentile(value: number, cohort: CohortMetricRow | undefined): number | null {
    if (!cohort || cohort.sample_size < 5) return null;
    if (value >= cohort.percentile_90) return 90;
    if (value >= cohort.percentile_75) return 75;
    if (value >= cohort.percentile_50) return 50;
    if (value >= cohort.percentile_25) return 25;
    return 10;
  }

  return {
    cohort: cohortKey,
    sample_size: cohortMap.get('benchmark_score')?.sample_size || 0,
    metrics: {
      completion: {
        your_value: velocityRow?.weighted_completion_pct || 0,
        percentile: computePercentile(velocityRow?.weighted_completion_pct || 0, cohortMap.get('completion_pct')),
        cohort_median: cohortMap.get('completion_pct')?.percentile_50 || 0,
      },
      velocity: {
        your_value: velocityRow?.velocity_ratio || 0,
        percentile: computePercentile(velocityRow?.velocity_ratio || 0, cohortMap.get('velocity_ratio')),
        cohort_median: cohortMap.get('velocity_ratio')?.percentile_50 || 0,
      },
      benchmark: {
        your_value: benchmarkRow?.composite_score || 0,
        percentile: computePercentile(benchmarkRow?.composite_score || 0, cohortMap.get('benchmark_score')),
        cohort_median: cohortMap.get('benchmark_score')?.percentile_50 || 0,
      },
      streak: {
        your_value: streakRow?.current_count || 0,
        percentile: computePercentile(streakRow?.current_count || 0, cohortMap.get('streak_days')),
        cohort_median: cohortMap.get('streak_days')?.percentile_50 || 0,
      },
    },
  };
}
