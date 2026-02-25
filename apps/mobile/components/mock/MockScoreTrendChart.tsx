import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';

interface TrendPoint {
  test_date: string;
  score_pct: number;
  test_name: string;
}

interface Props {
  data: TrendPoint[];
}

function getBarColor(pct: number, theme: Theme): string {
  if (pct >= 60) return theme.colors.success;
  if (pct >= 45) return theme.colors.warning;
  return theme.colors.error;
}

export function MockScoreTrendChart({ data }: Props) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  if (data.length === 0) return null;

  const maxPct = Math.max(...data.map((d) => d.score_pct), 100);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>SCORE TREND</Text>
      <View style={styles.chartContainer}>
        {data.map((point, i) => {
          const heightPct = maxPct > 0 ? (point.score_pct / maxPct) * 100 : 0;
          const color = getBarColor(point.score_pct, theme);
          return (
            <View key={i} style={styles.barCol}>
              <Text style={[styles.barValue, { color }]}>{point.score_pct.toFixed(0)}%</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { height: `${heightPct}%`, backgroundColor: color }]} />
              </View>
              <Text style={styles.barLabel} numberOfLines={1}>{point.test_name.slice(0, 10)}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
          <Text style={styles.legendText}>60%+</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.warning }]} />
          <Text style={styles.legendText}>45-60%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.error }]} />
          <Text style={styles.legendText}>&lt;45%</Text>
        </View>
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
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: theme.spacing.sm,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  barValue: {
    fontSize: theme.fontSize.xxs,
    fontWeight: '700',
    marginBottom: 4,
  },
  barTrack: {
    flex: 1,
    width: '70%',
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
  },
});
