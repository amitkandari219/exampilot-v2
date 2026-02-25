import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import type { MockSubjectAccuracy, MockTrend } from '../../types';

interface SubjectAccuracyRow extends MockSubjectAccuracy {
  subject_name: string;
}

interface Props {
  data: SubjectAccuracyRow[];
}

function getAccuracyColor(accuracy: number, theme: Theme): string {
  if (accuracy >= 0.7) return theme.colors.success;
  if (accuracy >= 0.5) return theme.colors.warning;
  return theme.colors.error;
}

function getTrendArrow(trend: MockTrend): string {
  if (trend === 'improving') return '\u2191';
  if (trend === 'declining') return '\u2193';
  return '\u2192';
}

function getTrendColor(trend: MockTrend, theme: Theme): string {
  if (trend === 'improving') return theme.colors.success;
  if (trend === 'declining') return theme.colors.error;
  return theme.colors.textMuted;
}

export function SubjectAccuracyGrid({ data }: Props) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  if (data.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>SUBJECT ACCURACY</Text>
      <View style={styles.grid}>
        {data.map((item) => {
          const color = getAccuracyColor(item.accuracy, theme);
          const trendColor = getTrendColor(item.trend, theme);
          return (
            <View key={item.subject_id} style={[styles.tile, { borderLeftColor: color }]}>
              <Text style={styles.subjectName} numberOfLines={1}>{item.subject_name}</Text>
              <View style={styles.tileRow}>
                <Text style={[styles.accuracyText, { color }]}>
                  {(item.accuracy * 100).toFixed(0)}%
                </Text>
                <Text style={[styles.trendArrow, { color: trendColor }]}>
                  {getTrendArrow(item.trend)}
                </Text>
              </View>
              <Text style={styles.questionCount}>{item.total_questions} Qs</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tile: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    borderLeftWidth: 3,
    minWidth: '30%',
    flex: 1,
  },
  subjectName: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  tileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  accuracyText: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
  },
  trendArrow: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  questionCount: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});
