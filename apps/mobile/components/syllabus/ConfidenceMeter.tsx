import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import type { ConfidenceStatus } from '../../types';

interface ConfidenceMeterProps {
  score: number;
  status: ConfidenceStatus;
}

export function ConfidenceMeter({ score, status }: ConfidenceMeterProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const statusColors: Record<ConfidenceStatus, string> = {
    fresh: theme.colors.success,
    fading: theme.colors.warning,
    stale: theme.colors.orange,
    decayed: theme.colors.error,
  };
  const clampedScore = Math.max(0, Math.min(100, score));
  const barColor = statusColors[status];

  return (
    <View style={styles.wrapper}>
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
      <Text style={styles.label}>Confidence</Text>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  wrapper: {
    flexDirection: 'column',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  label: {
    fontSize: theme.fontSize.xxs,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginTop: 2,
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
