import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import type { DeepMockAnalysis } from '../../types';
import { V4Bar } from '../v4/V4Bar';

interface DeepAnalysisCardProps {
  analysis: DeepMockAnalysis;
}

export function DeepAnalysisCard({ analysis }: DeepAnalysisCardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Deep Analysis</Text>

      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{analysis.negative_marking_impact}</Text>
          <Text style={styles.metricLabel}>Marks lost to negatives</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{analysis.attempt_rate}%</Text>
          <Text style={styles.metricLabel}>Attempt rate</Text>
        </View>
      </View>

      {analysis.attempt_rate < 70 && (
        <Text style={styles.tip}>Low attempt rate. Consider being bolder with educated guesses.</Text>
      )}

      {analysis.topic_gaps.length > 0 && (
        <>
          <Text style={styles.subtitle}>Top Weak Topics</Text>
          {analysis.topic_gaps.map((gap, i) => (
            <View key={i} style={styles.gapRow}>
              <View style={styles.gapHeader}>
                <Text style={styles.gapTopic} numberOfLines={1}>{gap.topic}</Text>
                <Text style={styles.gapAccuracy}>{Math.round(gap.accuracy * 100)}%</Text>
              </View>
              <V4Bar progress={gap.accuracy * 100} color={gap.accuracy < 0.3 ? theme.colors.danger : theme.colors.warn} height={4} />
              <Text style={styles.gapAdvice}>{gap.advice}</Text>
            </View>
          ))}
        </>
      )}

      {analysis.cutoff_trajectory.length > 1 && (
        <>
          <Text style={styles.subtitle}>Score Trajectory</Text>
          {analysis.cutoff_trajectory.slice(-3).map((pt, i) => (
            <View key={i} style={styles.trajectoryRow}>
              <Text style={styles.trajectoryDate}>{pt.test_date}</Text>
              <Text style={styles.trajectoryScore}>{pt.score}%</Text>
            </View>
          ))}
        </>
      )}
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  card: { backgroundColor: theme.colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: theme.colors.border },
  title: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginBottom: 12 },
  subtitle: { fontSize: 13, fontWeight: '600', color: theme.colors.text, marginTop: 14, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  metric: { flex: 1, alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 10, padding: 12 },
  metricValue: { fontSize: 20, fontWeight: '800', color: theme.colors.accent },
  metricLabel: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2, textAlign: 'center' },
  tip: { fontSize: 12, color: theme.colors.warn, marginTop: 4, fontStyle: 'italic' },
  gapRow: { marginBottom: 10 },
  gapHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  gapTopic: { fontSize: 12, fontWeight: '600', color: theme.colors.text, flex: 1 },
  gapAccuracy: { fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary },
  gapAdvice: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
  trajectoryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  trajectoryDate: { fontSize: 12, color: theme.colors.textSecondary },
  trajectoryScore: { fontSize: 12, fontWeight: '700', color: theme.colors.text },
});
