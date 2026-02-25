import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import { BurnoutStatus } from '../../types';

interface BurnoutIndicatorProps {
  briScore: number;
  status: BurnoutStatus;
  inRecovery: boolean;
  onPress?: () => void;
}

function getStatusColors(theme: Theme) {
  return {
    low: theme.colors.success,
    moderate: theme.colors.warning,
    high: theme.colors.orange,
    critical: theme.colors.error,
  };
}

const statusLabels: Record<BurnoutStatus, string> = {
  low: 'Feeling good',
  moderate: 'Moderate',
  high: 'Take it easy',
  critical: 'Rest needed',
};

export function BurnoutIndicator({ briScore, status, inRecovery, onPress }: BurnoutIndicatorProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const color = getStatusColors(theme)[status];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.heartDot, { backgroundColor: color }]} />
      <View>
        <Text style={styles.label}>{inRecovery ? 'Recovery' : 'Burnout'}</Text>
        <Text style={[styles.status, { color }]}>{inRecovery ? 'Resting' : statusLabels[status]}</Text>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
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
  status: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },
});
