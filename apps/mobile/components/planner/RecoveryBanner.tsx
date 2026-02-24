import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface RecoveryBannerProps {
  day: number;
  totalDays: number;
}

export function RecoveryBanner({ day, totalDays }: RecoveryBannerProps) {
  const progress = totalDays > 0 ? day / totalDays : 0;

  return (
    <View style={styles.banner}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          Recovery Mode &ndash; Day {day}/{totalDays}
        </Text>
        <Text style={styles.subtitle}>Calibrated for sustainable progress</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <Text style={styles.encouragement}>Optimized for peak performance</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#065F46',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  textContainer: {
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.success,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: '#A7F3D0',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#064E3B',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.success,
    borderRadius: 3,
  },
  encouragement: {
    fontSize: theme.fontSize.xs,
    color: '#6EE7B7',
    fontStyle: 'italic',
  },
});
