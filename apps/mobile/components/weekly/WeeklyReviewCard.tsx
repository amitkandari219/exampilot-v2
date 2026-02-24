import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { WeeklyReviewSummary } from '../../types';

interface Props {
  review: WeeklyReviewSummary;
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const sMonth = months[s.getMonth()];
  const eMonth = months[e.getMonth()];
  if (sMonth === eMonth) {
    return `${sMonth} ${s.getDate()}-${e.getDate()}`;
  }
  return `${sMonth} ${s.getDate()} - ${eMonth} ${e.getDate()}`;
}

function MetricPill({ value, label }: { value: string; label: string }) {
  return (
    <View style={pillStyles.container}>
      <Text style={pillStyles.value}>{value}</Text>
      <Text style={pillStyles.label}>{label}</Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  value: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    color: theme.colors.text,
  },
  label: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

function GridItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={gridStyles.item}>
      <Text style={[gridStyles.value, color ? { color } : null]}>{value}</Text>
      <Text style={gridStyles.label}>{label}</Text>
    </View>
  );
}

const gridStyles = StyleSheet.create({
  item: {
    width: '50%' as any,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  value: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.text,
  },
  label: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
});

function DeltaChip({ label, value }: { label: string; value: number }) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const color = isPositive ? theme.colors.success : isNegative ? theme.colors.error : theme.colors.textMuted;
  const prefix = isPositive ? '+' : '';
  return (
    <View style={deltaStyles.chip}>
      <Text style={[deltaStyles.value, { color }]}>{prefix}{value}</Text>
      <Text style={deltaStyles.label}>{label}</Text>
    </View>
  );
}

const deltaStyles = StyleSheet.create({
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  value: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  label: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
});

function benchmarkStatusColor(status: string | null): string {
  switch (status) {
    case 'exam_ready': return theme.colors.success;
    case 'on_track': return theme.colors.primary;
    case 'needs_work': return theme.colors.warning;
    case 'at_risk': return theme.colors.error;
    default: return theme.colors.textMuted;
  }
}

function formatBenchmarkStatus(status: string | null): string {
  switch (status) {
    case 'exam_ready': return 'Exam Ready';
    case 'on_track': return 'On Track';
    case 'needs_work': return 'Needs Work';
    case 'at_risk': return 'At Risk';
    default: return '';
  }
}

export function WeeklyReviewCard({ review }: Props) {
  const velocityColor = review.avg_velocity_ratio >= 0.9 ? theme.colors.success : review.avg_velocity_ratio >= 0.7 ? theme.colors.warning : theme.colors.error;
  const briColor = review.avg_bri >= 60 ? theme.colors.success : review.avg_bri >= 40 ? theme.colors.warning : theme.colors.error;

  const xpEarned = review.xp_earned || 0;
  const badgesUnlocked = review.badges_unlocked || [];
  const levelStart = review.level_start || 1;
  const levelEnd = review.level_end || 1;
  const leveledUp = levelStart !== levelEnd;
  const levelLabel = leveledUp ? `Lv ${levelStart}\u2192${levelEnd}` : `Lv ${levelEnd}`;
  const benchmarkDelta = (review.benchmark_score_start != null && review.benchmark_score_end != null)
    ? review.benchmark_score_end - review.benchmark_score_start
    : null;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>WEEKLY REVIEW</Text>
        <Text style={styles.dateRange}>{formatDateRange(review.week_start_date, review.week_end_date)}</Text>
      </View>

      {/* Highlights */}
      {review.highlights.length > 0 && (
        <View style={styles.highlights}>
          {review.highlights.map((h, i) => (
            <View key={i} style={styles.highlightRow}>
              <View style={styles.highlightDot} />
              <Text style={styles.highlightText}>{h}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Study Metrics */}
      <View style={styles.divider} />
      <View style={styles.metricsRow}>
        <MetricPill value={`${review.total_hours}h`} label="Hours" />
        <MetricPill value={`${review.topics_completed}`} label="Topics" />
        <MetricPill value={`${review.avg_hours_per_day}h/d`} label="Daily" />
      </View>

      {/* XP & Level */}
      <View style={styles.divider} />
      <View style={styles.metricsRow}>
        <MetricPill value={`+${xpEarned.toLocaleString()}`} label="XP" />
        <MetricPill value={levelLabel} label="Level" />
        <MetricPill value={`${badgesUnlocked.length}`} label="Badges" />
      </View>

      {/* Benchmark */}
      {review.benchmark_score_end != null && (
        <>
          <View style={styles.divider} />
          <View style={styles.grid}>
            <GridItem
              label="Readiness"
              value={`${review.benchmark_score_end}${benchmarkDelta != null ? ` (${benchmarkDelta >= 0 ? '+' : ''}${benchmarkDelta})` : ''}`}
              color={benchmarkStatusColor(review.benchmark_status)}
            />
            <GridItem
              label="Status"
              value={formatBenchmarkStatus(review.benchmark_status)}
              color={benchmarkStatusColor(review.benchmark_status)}
            />
          </View>
        </>
      )}

      {/* Grid */}
      <View style={styles.divider} />
      <View style={styles.grid}>
        <GridItem label="Velocity" value={`${review.avg_velocity_ratio.toFixed(2)}x`} color={velocityColor} />
        <GridItem label="Plan Adherence" value={`${review.plan_completion_rate}%`} />
        <GridItem label="Stress" value={`${review.avg_stress}`} />
        <GridItem label="BRI" value={`${review.avg_bri}`} color={briColor} />
        <GridItem label="Buffer" value={`${review.buffer_balance_change >= 0 ? '+' : ''}${review.buffer_balance_change.toFixed(1)}d`} color={review.buffer_balance_change >= 0 ? theme.colors.success : theme.colors.error} />
        <GridItem label="Streak" value={`${review.current_streak}d`} />
      </View>

      {/* Deltas */}
      <View style={styles.divider} />
      <View style={styles.deltasRow}>
        <DeltaChip label="Improved" value={review.topics_improved} />
        <DeltaChip label="Decayed" value={-review.topics_decayed} />
        <DeltaChip label="Crit" value={review.critical_count_change} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateRange: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  highlights: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    paddingLeft: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  highlightDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  highlightText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  metricsRow: {
    flexDirection: 'row',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  deltasRow: {
    flexDirection: 'row',
  },
});
