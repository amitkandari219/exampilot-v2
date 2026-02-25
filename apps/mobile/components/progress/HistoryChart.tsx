import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';

interface HistoryChartProps {
  data: Array<{ date: string; value: number }>;
  title: string;
  color?: string;
  height?: number;
}

export function HistoryChart({ data, title, color, height = 80 }: HistoryChartProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const resolvedColor = color ?? theme.colors.primary;
  if (data.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.empty}>No data yet</Text>
      </View>
    );
  }

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const barWidth = Math.max(4, (280 - (data.length - 1) * 2) / data.length);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.latest, { color: resolvedColor }]}>{values[values.length - 1].toFixed(1)}</Text>
      </View>

      <View style={[styles.chartArea, { height }]}>
        {data.map((point, index) => {
          const barHeight = ((point.value - min) / range) * height * 0.85 + height * 0.15;
          return (
            <View
              key={index}
              style={[
                styles.bar,
                {
                  width: barWidth,
                  height: barHeight,
                  backgroundColor: resolvedColor,
                  opacity: index === data.length - 1 ? 1 : 0.4,
                  marginLeft: index > 0 ? 2 : 0,
                },
              ]}
            />
          );
        })}
      </View>

      <View style={styles.dateRow}>
        <Text style={styles.dateLabel}>
          {data[0]?.date ? new Date(data[0].date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : ''}
        </Text>
        <Text style={styles.dateLabel}>
          {data[data.length - 1]?.date ? new Date(data[data.length - 1].date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : ''}
        </Text>
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
  latest: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bar: {
    borderRadius: 2,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  dateLabel: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
  },
  empty: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
});
