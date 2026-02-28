import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import type { SimulationResult, VelocityStatus } from '../../types';

interface SimulationResultCardProps {
  result: SimulationResult;
}

function getStatusColors(theme: Theme) {
  return {
    ahead: theme.colors.success,
    on_track: theme.colors.primary,
    behind: theme.colors.warning,
    at_risk: theme.colors.error,
  };
}

function formatRatio(v: number): string {
  return `${v.toFixed(2)}x`;
}

function formatDelta(v: number, suffix = ''): string {
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}${suffix}`;
}

function formatDeltaInt(v: number, suffix = ''): string {
  const sign = v > 0 ? '+' : '';
  return `${sign}${v}${suffix}`;
}

function ComparisonRow({ label, baseline, projected, deltaText, deltaColor, styles }: {
  label: string;
  baseline: string;
  projected: string;
  deltaText: string;
  deltaColor: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowValues}>
        <Text style={styles.baselineValue}>{baseline}</Text>
        <Text style={styles.arrow}>-&gt;</Text>
        <Text style={styles.projectedValue}>{projected}</Text>
        <Text style={[styles.delta, { color: deltaColor }]}>{deltaText}</Text>
      </View>
    </View>
  );
}

function StatusBadge({ status, theme, styles }: { status: VelocityStatus; theme: Theme; styles: ReturnType<typeof createStyles> }) {
  const statusColors = getStatusColors(theme);
  return (
    <View style={[styles.badge, { backgroundColor: statusColors[status] + '22', borderColor: statusColors[status] }]}>
      <Text style={[styles.badgeText, { color: statusColors[status] }]}>
        {status.replace('_', ' ')}
      </Text>
    </View>
  );
}

export function SimulationResultCard({ result }: SimulationResultCardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { baseline, projected, delta } = result;

  const velocityDeltaColor = delta.velocity_ratio_change >= 0 ? theme.colors.success : theme.colors.error;
  const bufferDeltaColor = delta.buffer_balance_change >= 0 ? theme.colors.success : theme.colors.error;
  const daysDeltaColor = delta.days_remaining_change <= 0 ? theme.colors.error : theme.colors.success;

  const showDaysRemaining = delta.days_remaining_change !== 0;
  const showBuffer = delta.buffer_balance_change !== 0;
  const showCompletionShift = delta.completion_date_shift_days !== null && delta.completion_date_shift_days !== 0;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Simulation Results</Text>

      {/* Velocity Ratio */}
      <ComparisonRow
        styles={styles}
        label="Study Speed"
        baseline={formatRatio(baseline.velocity_ratio)}
        projected={formatRatio(projected.velocity_ratio)}
        deltaText={formatDelta(delta.velocity_ratio_change)}
        deltaColor={velocityDeltaColor}
      />

      {/* Status */}
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Status</Text>
        <View style={styles.statusRow}>
          <StatusBadge status={baseline.status} theme={theme} styles={styles} />
          {delta.status_change !== 'no change' && (
            <>
              <Text style={styles.arrow}>-&gt;</Text>
              <StatusBadge status={projected.status} theme={theme} styles={styles} />
            </>
          )}
          {delta.status_change === 'no change' && (
            <Text style={styles.noChange}>unchanged</Text>
          )}
        </View>
      </View>

      {/* Days Remaining */}
      {showDaysRemaining && (
        <ComparisonRow
          styles={styles}
          label="Days Left"
          baseline={String(baseline.days_remaining)}
          projected={String(projected.days_remaining)}
          deltaText={formatDeltaInt(delta.days_remaining_change, 'd')}
          deltaColor={daysDeltaColor}
        />
      )}

      {/* Projected Completion */}
      {showCompletionShift && (
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Completion</Text>
          <View style={styles.rowValues}>
            <Text style={styles.baselineValue}>{baseline.projected_completion_date || '—'}</Text>
            <Text style={styles.arrow}>-&gt;</Text>
            <Text style={styles.projectedValue}>{projected.projected_completion_date || '—'}</Text>
            <Text style={[styles.delta, { color: delta.completion_date_shift_days! > 0 ? theme.colors.error : theme.colors.success }]}>
              {formatDeltaInt(delta.completion_date_shift_days!, 'd')}
            </Text>
          </View>
        </View>
      )}

      {/* Buffer Balance */}
      {showBuffer && (
        <ComparisonRow
          styles={styles}
          label="Backup Days"
          baseline={baseline.buffer_balance.toFixed(1)}
          projected={projected.buffer_balance.toFixed(1)}
          deltaText={formatDelta(delta.buffer_balance_change)}
          deltaColor={bufferDeltaColor}
        />
      )}

      {/* Completion % */}
      <ComparisonRow
        styles={styles}
        label="Progress"
        baseline={`${(baseline.weighted_completion_pct * 100).toFixed(1)}%`}
        projected={`${(projected.weighted_completion_pct * 100).toFixed(1)}%`}
        deltaText={formatDelta((projected.weighted_completion_pct - baseline.weighted_completion_pct) * 100, '%')}
        deltaColor={projected.weighted_completion_pct >= baseline.weighted_completion_pct ? theme.colors.success : theme.colors.error}
      />

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {getSummaryText(result)}
        </Text>
      </View>
    </View>
  );
}

function getSummaryText(result: SimulationResult): string {
  const { scenario, delta } = result;
  const ratioChange = delta.velocity_ratio_change;
  const direction = ratioChange >= 0 ? 'improve' : 'decrease';

  switch (scenario.type) {
    case 'skip_days':
      return `Skipping ${scenario.params.days} day(s) would ${direction} your study speed by ${Math.abs(ratioChange).toFixed(2)}.`;
    case 'change_hours':
      return `Changing to ${scenario.params.daily_hours}h/day would ${direction} your study speed by ${Math.abs(ratioChange).toFixed(2)}.`;
    case 'change_strategy':
      return `Switching strategy would ${direction} your study speed by ${Math.abs(ratioChange).toFixed(2)}.`;
    case 'change_exam_date':
      return `Moving exam to ${scenario.params.exam_date} would ${direction} your study speed by ${Math.abs(ratioChange).toFixed(2)}.`;
    case 'defer_topics':
      return `Deferring ${scenario.params.count} topic(s) would ${direction} your study speed by ${Math.abs(ratioChange).toFixed(2)}.`;
    default:
      return '';
  }
}

const createStyles = (theme: Theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.md,
  },
  row: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  rowValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  baselineValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  arrow: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  projectedValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.text,
  },
  delta: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  noChange: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.sm,
  },
  summary: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.sm,
  },
  summaryText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});
