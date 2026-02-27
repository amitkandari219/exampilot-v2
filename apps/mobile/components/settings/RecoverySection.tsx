import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Theme } from '../../constants/theme';
import { BurnoutData } from '../../types';

interface RecoverySectionProps {
  theme: Theme;
  burnout: BurnoutData | null | undefined;
  handleRecoveryToggle: (value: boolean) => void;
}

export function RecoverySection({ theme, burnout, handleRecoveryToggle }: RecoverySectionProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recovery Mode</Text>
      <View style={styles.recoveryRow}>
        <View>
          <Text style={styles.paramLabel}>Recovery Active</Text>
          {burnout?.in_recovery && burnout.recovery_day && (
            <Text style={styles.recoveryDay}>Day {burnout.recovery_day}/5</Text>
          )}
        </View>
        <Switch
          value={burnout?.in_recovery || false}
          onValueChange={handleRecoveryToggle}
          trackColor={{ false: theme.colors.border, true: theme.colors.success }}
          thumbColor={theme.colors.text}
        />
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
  paramLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  recoveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recoveryDay: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.success,
    marginTop: 2,
  },
});
