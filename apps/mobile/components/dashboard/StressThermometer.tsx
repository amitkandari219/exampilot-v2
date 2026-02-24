import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { Sparkline } from '../common/Sparkline';

interface StressThermometerProps {
  score: number;
  status: string;
  label: string;
  signals: {
    velocity: number;
    buffer: number;
    time: number;
    confidence: number;
  };
  recommendation: string;
  history?: number[];
}

function getColor(score: number): string {
  if (score >= 70) return theme.colors.success;
  if (score >= 45) return theme.colors.warning;
  if (score >= 25) return theme.colors.orange;
  return theme.colors.error;
}

export function StressThermometer({ score, status, label, signals, recommendation, history }: StressThermometerProps) {
  const color = getColor(score);

  const signalEntries = [
    { name: 'Velocity', value: signals.velocity },
    { name: 'Buffer', value: signals.buffer },
    { name: 'Time', value: signals.time },
    { name: 'Confidence', value: signals.confidence },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Stress Level</Text>
        <View style={[styles.badge, { backgroundColor: color + '20' }]}>
          <Text style={[styles.badgeText, { color }]}>{label}</Text>
        </View>
      </View>

      <View style={styles.gaugeRow}>
        <View style={styles.gaugeContainer}>
          <View style={styles.gaugeTrack}>
            <View
              style={[
                styles.gaugeFill,
                { width: `${score}%`, backgroundColor: color },
              ]}
            />
          </View>
          <Text style={[styles.scoreText, { color }]}>{score}</Text>
        </View>
        {history && history.length > 1 && (
          <Sparkline data={history} color={color} width={60} height={20} />
        )}
      </View>

      <View style={styles.signalsRow}>
        {signalEntries.map((signal) => (
          <View key={signal.name} style={styles.signalItem}>
            <View style={styles.signalBarBg}>
              <View
                style={[
                  styles.signalBarFill,
                  { height: `${signal.value}%`, backgroundColor: getColor(signal.value) },
                ]}
              />
            </View>
            <Text style={styles.signalLabel}>{signal.name.slice(0, 3)}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.recommendation}>{recommendation}</Text>
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
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },
  gaugeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  gaugeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  gaugeTrack: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    marginLeft: theme.spacing.sm,
    minWidth: 30,
  },
  signalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.sm,
  },
  signalItem: {
    alignItems: 'center',
  },
  signalBarBg: {
    width: 12,
    height: 32,
    backgroundColor: theme.colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  signalBarFill: {
    width: '100%',
    borderRadius: 6,
  },
  signalLabel: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  recommendation: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
  },
});
