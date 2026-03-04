import { supabase } from '../lib/supabase.js';
import { toDateString } from '../utils/dateUtils.js';

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

export async function computeCohortPercentiles() {
  const today = toDateString(new Date());

  // Fetch latest velocity snapshot per user
  const { data: snapshots } = await supabase
    .from('velocity_snapshots')
    .select('user_id, velocity_ratio, weighted_completion_pct')
    .order('snapshot_date', { ascending: false });

  if (!snapshots || snapshots.length === 0) return;

  // De-duplicate: keep only the latest per user
  const latestByUser = new Map<string, { velocity_ratio: number; weighted_completion_pct: number }>();
  for (const s of snapshots) {
    if (!latestByUser.has(s.user_id)) {
      latestByUser.set(s.user_id, { velocity_ratio: s.velocity_ratio, weighted_completion_pct: s.weighted_completion_pct });
    }
  }

  const users = Array.from(latestByUser.values());
  if (users.length < 5) return; // Not enough data for meaningful percentiles

  const metrics: { name: string; values: number[] }[] = [
    { name: 'velocity_ratio', values: users.map(u => u.velocity_ratio).sort((a, b) => a - b) },
    { name: 'weighted_completion_pct', values: users.map(u => u.weighted_completion_pct).sort((a, b) => a - b) },
  ];

  for (const metric of metrics) {
    const { error } = await supabase
      .from('cohort_snapshots')
      .upsert({
        snapshot_date: today,
        metric: metric.name,
        percentile_10: percentile(metric.values, 10),
        percentile_25: percentile(metric.values, 25),
        percentile_50: percentile(metric.values, 50),
        percentile_75: percentile(metric.values, 75),
        percentile_90: percentile(metric.values, 90),
        sample_size: metric.values.length,
      }, { onConflict: 'snapshot_date,metric' });

    if (error) console.warn('[cohortBenchmark:upsert]', metric.name, error.message);
  }
}

export async function getUserPercentile(userId: string) {
  const today = toDateString(new Date());

  const [userSnapshot, cohort] = await Promise.all([
    supabase.from('velocity_snapshots')
      .select('velocity_ratio, weighted_completion_pct')
      .eq('user_id', userId)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single(),
    supabase.from('cohort_snapshots')
      .select('*')
      .eq('snapshot_date', today),
  ]);

  if (!userSnapshot.data || !cohort.data?.length) return null;

  const user = userSnapshot.data;
  const cohortMap = new Map(cohort.data.map((c: any) => [c.metric, c]));

  function computeBand(value: number, metric: string): number {
    const c = cohortMap.get(metric);
    if (!c) return 50;
    if (value >= c.percentile_90) return 95;
    if (value >= c.percentile_75) return 85;
    if (value >= c.percentile_50) return 65;
    if (value >= c.percentile_25) return 35;
    if (value >= c.percentile_10) return 15;
    return 5;
  }

  return {
    velocity_percentile: computeBand(user.velocity_ratio, 'velocity_ratio'),
    coverage_percentile: computeBand(user.weighted_completion_pct, 'weighted_completion_pct'),
    sample_size: (cohortMap.get('velocity_ratio') as unknown as { sample_size: number } | undefined)?.sample_size || 0,
  };
}
