import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import type { WeaknessOverview, HealthCategory } from '../../types';

interface WeaknessRadarCardProps {
  data: WeaknessOverview;
}

const CATEGORY_COLORS: Record<HealthCategory, string> = {
  critical: theme.colors.error,
  weak: '#F97316',
  moderate: theme.colors.warning,
  strong: theme.colors.success,
  exam_ready: theme.colors.primary,
};

export function WeaknessRadarCard({ data }: WeaknessRadarCardProps) {
  const { summary, weakest_topics } = data;
  const alertCount = summary.critical + summary.weak;
  const top3 = weakest_topics.slice(0, 3);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Weakness Radar</Text>
        {alertCount > 0 && (
          <View style={styles.alertBadge}>
            <Text style={styles.alertText}>{alertCount} need attention</Text>
          </View>
        )}
      </View>

      <View style={styles.summaryRow}>
        {(['critical', 'weak', 'moderate', 'strong', 'exam_ready'] as HealthCategory[]).map((cat) => {
          const count = summary[cat];
          const color = CATEGORY_COLORS[cat];
          const label = cat === 'exam_ready' ? 'ready' : cat;
          return (
            <View key={cat} style={styles.summaryItem}>
              <Text style={[styles.summaryCount, { color }]}>{count}</Text>
              <Text style={styles.summaryLabel}>{label}</Text>
            </View>
          );
        })}
      </View>

      {top3.length > 0 && (
        <View style={styles.weakestSection}>
          <Text style={styles.weakestTitle}>Weakest Topics</Text>
          {top3.map((t) => (
            <View key={t.topic_id} style={styles.weakItem}>
              <View style={[styles.dot, { backgroundColor: CATEGORY_COLORS[t.category] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.weakName} numberOfLines={1}>{t.topic_name}</Text>
                <Text style={styles.weakSubject}>{t.subject_name}</Text>
                <Text style={styles.weakRec} numberOfLines={2}>{t.recommendation}</Text>
              </View>
              <Text style={[styles.weakScore, { color: CATEGORY_COLORS[t.category] }]}>
                {t.health_score}
              </Text>
            </View>
          ))}
        </View>
      )}
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
  alertBadge: {
    backgroundColor: theme.colors.error + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  alertText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.error,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.sm,
  },
  summaryItem: { alignItems: 'center' },
  summaryCount: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textTransform: 'capitalize',
  },
  weakestSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
  },
  weakestTitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  weakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  weakName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  weakSubject: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  weakRec: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  weakScore: {
    fontSize: theme.fontSize.sm,
    fontWeight: '800',
    minWidth: 24,
    textAlign: 'right',
  },
});
