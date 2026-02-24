import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { EnergyBattery } from './EnergyBattery';
import type { EnergyLevel } from '../../types';

interface PlanHeaderProps {
  date: string;
  availableHours: number;
  energyLevel: EnergyLevel;
  isLightDay: boolean;
  onHoursPress?: () => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function PlanHeader({
  date,
  availableHours,
  energyLevel,
  isLightDay,
  onHoursPress,
}: PlanHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.dateText}>{formatDate(date)}</Text>
      <Text style={styles.title}>Today's Mission</Text>

      <View style={styles.metaRow}>
        <TouchableOpacity
          style={styles.hoursBadge}
          onPress={onHoursPress}
          activeOpacity={onHoursPress ? 0.7 : 1}
          disabled={!onHoursPress}
        >
          <Text style={styles.hoursValue}>{availableHours}</Text>
          <Text style={styles.hoursLabel}>hrs available</Text>
        </TouchableOpacity>

        <View style={styles.energyContainer}>
          <EnergyBattery level={energyLevel} />
          <Text style={styles.energyLabel}>{energyLevel}</Text>
        </View>

        {isLightDay && (
          <View style={styles.lightDayBadge}>
            <Text style={styles.lightDayText}>Light Day</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  dateText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  hoursBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  hoursValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.primary,
    marginRight: theme.spacing.xs,
  },
  hoursLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  energyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  energyLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  lightDayBadge: {
    backgroundColor: '#1E3A5F',
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  lightDayText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
