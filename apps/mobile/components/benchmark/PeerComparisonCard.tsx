import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import { useCohortPercentile } from '../../hooks/useCohortBenchmark';
import { V4Bar } from '../v4/V4Bar';

export function PeerComparisonCard() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data: percentile } = useCohortPercentile();

  if (!percentile || percentile.sample_size < 5) return null;

  const metrics = [
    { label: 'Study Pace', value: percentile.velocity_percentile, color: theme.colors.accent },
    { label: 'Coverage', value: percentile.coverage_percentile, color: theme.colors.green },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>How You Compare</Text>
      <Text style={styles.subtitle}>Based on {percentile.sample_size} active aspirants</Text>
      {metrics.map(m => (
        <View key={m.label} style={styles.metricRow}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>{m.label}</Text>
            <Text style={[styles.metricValue, { color: m.color }]}>Top {100 - m.value}%</Text>
          </View>
          <V4Bar progress={m.value} color={m.color} height={6} />
        </View>
      ))}
      <Text style={styles.encouragement}>
        {percentile.velocity_percentile >= 75
          ? 'Outstanding pace! You\'re ahead of most aspirants.'
          : percentile.velocity_percentile >= 50
          ? 'Solid progress. Keep pushing to move into the top quarter.'
          : 'Room to grow. Consistent daily effort moves you up quickly.'}
      </Text>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  card: { backgroundColor: theme.colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: theme.colors.border },
  title: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginBottom: 2 },
  subtitle: { fontSize: 11, color: theme.colors.textMuted, marginBottom: 14 },
  metricRow: { marginBottom: 12 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  metricLabel: { fontSize: 12, color: theme.colors.textSecondary },
  metricValue: { fontSize: 12, fontWeight: '700' },
  encouragement: { fontSize: 11, color: theme.colors.textSecondary, fontStyle: 'italic', marginTop: 4, lineHeight: 16 },
});
