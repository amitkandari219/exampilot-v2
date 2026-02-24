import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import type { MockAnalytics } from '../../types';

interface Props {
  analytics: MockAnalytics;
}

export function MockSummaryCard({ analytics }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>MOCK TEST SUMMARY</Text>
      <View style={styles.metricsRow}>
        <MetricPill label="Tests" value={String(analytics.tests_count)} />
        <MetricPill label="Avg Score" value={`${analytics.avg_score_pct.toFixed(1)}%`} />
        <MetricPill label="Best" value={`${analytics.best_score_pct.toFixed(1)}%`} />
      </View>
      {analytics.recommendation ? (
        <Text style={styles.recommendation}>{analytics.recommendation}</Text>
      ) : null}
    </View>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillValue}>{value}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
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
  sectionLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  pill: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    alignItems: 'center',
  },
  pillValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    color: theme.colors.text,
  },
  pillLabel: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  recommendation: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    lineHeight: 18,
  },
});
