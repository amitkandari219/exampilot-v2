import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { BenchmarkProfile } from '../../types';

interface Props {
  profile: BenchmarkProfile;
  compact?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  exam_ready: 'Exam Ready',
  on_track: 'On Track',
  needs_work: 'Needs Work',
  at_risk: 'At Risk',
};

function getScoreColor(score: number): string {
  if (score >= 80) return theme.colors.success;
  if (score >= 60) return theme.colors.primary;
  if (score >= 40) return theme.colors.warning;
  return theme.colors.error;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'exam_ready': return theme.colors.success;
    case 'on_track': return theme.colors.primary;
    case 'needs_work': return theme.colors.warning;
    case 'at_risk': return theme.colors.error;
    default: return theme.colors.textMuted;
  }
}

interface BarProps {
  label: string;
  value: number;
}

function ComponentBar({ label, value }: BarProps) {
  const color = getScoreColor(value);
  const pct = Math.min(100, Math.max(0, value));

  return (
    <View style={barStyles.row}>
      <Text style={barStyles.label}>{label}</Text>
      <View style={barStyles.track}>
        <View style={[barStyles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={[barStyles.value, { color }]}>{Math.round(value)}</Text>
    </View>
  );
}

export function BenchmarkScoreCard({ profile, compact = false }: Props) {
  const scoreColor = getScoreColor(profile.composite_score);
  const statusColor = getStatusColor(profile.status);
  const trendSymbol = profile.trend_delta > 0 ? '+' : '';
  const trendLabel = profile.trend === 'improving' ? 'improving' : profile.trend === 'declining' ? 'declining' : 'stable';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>EXAM READINESS</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {STATUS_LABELS[profile.status] || profile.status}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreNumber, { color: scoreColor }]}>{profile.composite_score}</Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>

        <View style={styles.barsContainer}>
          <ComponentBar label="Coverage" value={profile.components.coverage} />
          <ComponentBar label="Confidence" value={profile.components.confidence} />
          <ComponentBar label="Weakness" value={profile.components.weakness} />
          <ComponentBar label="Consistency" value={profile.components.consistency} />
          <ComponentBar label="Velocity" value={profile.components.velocity} />
        </View>
      </View>

      {profile.trend_delta !== 0 && (
        <Text style={styles.trendText}>
          {trendSymbol}{profile.trend_delta} pts {trendLabel} vs last week
        </Text>
      )}

      {!compact && profile.recommendations.length > 0 && (
        <>
          <View style={styles.divider} />
          {profile.recommendations.map((rec: string, i: number) => (
            <Text key={i} style={styles.recommendation}>{rec}</Text>
          ))}
        </>
      )}
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    width: 72,
  },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: theme.spacing.xs,
  },
  fill: {
    height: 6,
    borderRadius: 3,
  },
  value: {
    fontSize: theme.fontSize.xxs,
    fontWeight: '700',
    width: 24,
    textAlign: 'right',
  },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
  },
  scoreMax: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    marginTop: -2,
  },
  barsContainer: {
    flex: 1,
  },
  trendText: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  recommendation: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    lineHeight: 18,
  },
});
