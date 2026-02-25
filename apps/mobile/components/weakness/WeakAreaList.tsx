import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import type { WeaknessOverview, HealthCategory } from '../../types';

interface WeakAreaListProps {
  data: WeaknessOverview;
}

function getCategoryColors(theme: Theme) {
  return {
    critical: theme.colors.error,
    weak: theme.colors.orange,
    moderate: theme.colors.warning,
    strong: theme.colors.success,
    exam_ready: theme.colors.primary,
  };
}

export function WeakAreaList({ data }: WeakAreaListProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  if (data.by_subject.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No weak areas detected. Keep it up!</Text>
      </View>
    );
  }

  return (
    <View>
      {data.by_subject.map((group) => (
        <View key={group.subject_id} style={styles.subjectGroup}>
          <View style={styles.subjectHeader}>
            <Text style={styles.subjectName}>{group.subject_name}</Text>
            <View style={styles.countsRow}>
              {group.critical_count > 0 && (
                <Text style={[styles.countBadge, { color: theme.colors.error }]}>
                  {group.critical_count} critical
                </Text>
              )}
              {group.weak_count > 0 && (
                <Text style={[styles.countBadge, { color: theme.colors.orange }]}>
                  {group.weak_count} weak
                </Text>
              )}
            </View>
          </View>

          {group.topics.map((t) => (
            <View key={t.topic_id} style={styles.topicItem}>
              <View style={[styles.dot, { backgroundColor: getCategoryColors(theme)[t.category] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.topicName} numberOfLines={1}>{t.topic_name}</Text>
                <Text style={styles.chapterName}>{t.chapter_name}</Text>
                <Text style={styles.recommendation}>{t.recommendation}</Text>
              </View>
              <Text style={[styles.score, { color: getCategoryColors(theme)[t.category] }]}>
                {t.health_score}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  empty: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  subjectGroup: {
    marginBottom: theme.spacing.md,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  subjectName: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.text,
  },
  countsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  countBadge: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.xs,
    paddingLeft: theme.spacing.sm,
    gap: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  topicName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  chapterName: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  recommendation: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  score: {
    fontSize: theme.fontSize.sm,
    fontWeight: '800',
    minWidth: 24,
    textAlign: 'right',
  },
});
