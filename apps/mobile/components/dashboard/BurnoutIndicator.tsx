import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { BurnoutStatus } from '../../types';

interface BurnoutIndicatorProps {
  briScore: number;
  status: BurnoutStatus;
  inRecovery: boolean;
  onPress?: () => void;
}

const statusColors: Record<BurnoutStatus, string> = {
  low: theme.colors.success,
  moderate: theme.colors.warning,
  high: theme.colors.orange,
  critical: theme.colors.error,
};

export function BurnoutIndicator({ briScore, status, inRecovery, onPress }: BurnoutIndicatorProps) {
  const color = statusColors[status];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.heartDot, { backgroundColor: color }]} />
      <View>
        <Text style={styles.label}>{inRecovery ? 'Recovery' : 'BRI'}</Text>
        <Text style={[styles.score, { color }]}>{briScore}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  heartDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  label: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  score: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
  },
});
