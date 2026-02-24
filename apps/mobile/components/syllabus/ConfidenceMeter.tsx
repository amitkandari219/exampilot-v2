import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import type { ConfidenceStatus } from '../../types';

interface ConfidenceMeterProps {
  score: number;
  status: ConfidenceStatus;
}

const STATUS_COLORS: Record<ConfidenceStatus, string> = {
  fresh: '#34D399',
  fading: '#FBBF24',
  stale: '#F97316',
  decayed: '#F87171',
};

export function ConfidenceMeter({ score, status }: ConfidenceMeterProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const barColor = STATUS_COLORS[status];

  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            {
              width: `${clampedScore}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
      <Text style={[styles.scoreText, { color: barColor }]}>{clampedScore}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  barBackground: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  scoreText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'right',
  },
});
