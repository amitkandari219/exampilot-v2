import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';

interface PersonaParamsSectionProps {
  theme: Theme;
  personaParams: Record<string, number>;
}

export function PersonaParamsSection({ theme, personaParams }: PersonaParamsSectionProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Study Parameters</Text>
      <View style={styles.paramRow}>
        <Text style={styles.paramLabel}>Energy Threshold</Text>
        <Text style={styles.paramValue}>{personaParams.fatigue_threshold || 85}</Text>
      </View>
      <View style={styles.paramRow}>
        <Text style={styles.paramLabel}>Backup Days Capacity</Text>
        <Text style={styles.paramValue}>{((personaParams.buffer_capacity || 0.15) * 100).toFixed(0)}%</Text>
      </View>
      <View style={styles.paramRow}>
        <Text style={styles.paramLabel}>Memory Target</Text>
        <Text style={styles.paramValue}>{((personaParams.fsrs_target_retention || 0.9) * 100).toFixed(0)}%</Text>
      </View>
      <View style={styles.paramRow}>
        <Text style={styles.paramLabel}>Burnout Limit</Text>
        <Text style={styles.paramValue}>{personaParams.burnout_threshold || 75}</Text>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  paramRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  paramLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  paramValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '600',
  },
});
