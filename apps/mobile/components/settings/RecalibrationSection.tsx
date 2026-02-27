import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Theme } from '../../constants/theme';
import { RecalibrationStatus, RecalibrationResult } from '../../types';

interface RecalibrationSectionProps {
  theme: Theme;
  recalStatus: RecalibrationStatus | null | undefined;
  triggerRecalibration: {
    mutate: (
      variables: undefined,
      options?: { onSuccess?: (result: RecalibrationResult) => void }
    ) => void;
    isPending: boolean;
  };
  setAutoRecalibrate: {
    mutate: (value: boolean) => void;
  };
}

function formatParamChange(entry: RecalibrationStatus['last_entry']) {
  if (!entry || !entry.params_changed) return null;
  const changes: string[] = [];
  if (entry.old_fatigue_threshold !== entry.new_fatigue_threshold) {
    changes.push(`Fatigue: ${entry.old_fatigue_threshold} → ${entry.new_fatigue_threshold}`);
  }
  if (entry.old_buffer_capacity !== entry.new_buffer_capacity) {
    changes.push(`Buffer: ${((entry.old_buffer_capacity || 0) * 100).toFixed(0)}% → ${((entry.new_buffer_capacity || 0) * 100).toFixed(0)}%`);
  }
  if (entry.old_fsrs_target_retention !== entry.new_fsrs_target_retention) {
    changes.push(`Retention: ${((entry.old_fsrs_target_retention || 0) * 100).toFixed(0)}% → ${((entry.new_fsrs_target_retention || 0) * 100).toFixed(0)}%`);
  }
  if (entry.old_burnout_threshold !== entry.new_burnout_threshold) {
    changes.push(`Burnout: ${entry.old_burnout_threshold} → ${entry.new_burnout_threshold}`);
  }
  return changes.length > 0 ? changes.join('\n') : null;
}

export function RecalibrationSection({ theme, recalStatus, triggerRecalibration, setAutoRecalibrate }: RecalibrationSectionProps) {
  const styles = createStyles(theme);

  const handleAutoRecalibrateToggle = (value: boolean) => {
    setAutoRecalibrate.mutate(value);
  };

  const handleManualRecalibrate = () => {
    Alert.alert(
      'Recalibrate Now',
      'This will re-evaluate your persona parameters based on recent performance. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Recalibrate',
          onPress: () => {
            triggerRecalibration.mutate(undefined, {
              onSuccess: (result) => {
                if (result.status === 'applied') {
                  Alert.alert('Recalibrated', 'Your parameters have been updated based on recent performance.');
                } else if (result.status === 'no_change') {
                  Alert.alert('No Changes', 'Your current parameters are already well-suited to your performance.');
                } else if (result.skipped_reason === 'cooldown') {
                  Alert.alert('Cooldown Active', 'Please wait at least 3 days between recalibrations.');
                } else if (result.skipped_reason === 'recovery_mode_active') {
                  Alert.alert('Recovery Active', 'Recalibration is paused during recovery mode.');
                } else if (result.skipped_reason === 'insufficient_data') {
                  Alert.alert('Not Enough Data', 'Need at least 5 days of study data to recalibrate.');
                } else {
                  Alert.alert('Skipped', result.skipped_reason || 'Recalibration was skipped.');
                }
              },
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recalibration Engine</Text>
      <View style={styles.recoveryRow}>
        <Text style={styles.paramLabel}>Auto-Recalibrate</Text>
        <Switch
          value={recalStatus?.auto_recalibrate ?? true}
          onValueChange={handleAutoRecalibrateToggle}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={theme.colors.text}
        />
      </View>
      {recalStatus?.last_recalibrated_at && (
        <View style={styles.paramRow}>
          <Text style={styles.paramLabel}>Last Recalibrated</Text>
          <Text style={styles.paramValue}>
            {new Date(recalStatus.last_recalibrated_at).toLocaleDateString()}
          </Text>
        </View>
      )}
      {recalStatus?.last_entry?.params_changed && (
        <View style={styles.recalChanges}>
          <Text style={styles.recalChangesLabel}>Last Adjustment</Text>
          <Text style={styles.recalChangesText}>
            {formatParamChange(recalStatus.last_entry)}
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.recalibrateButton}
        onPress={handleManualRecalibrate}
        disabled={triggerRecalibration.isPending}
      >
        {triggerRecalibration.isPending ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <Text style={styles.recalibrateText}>Recalibrate Now</Text>
        )}
      </TouchableOpacity>
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
  recoveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recalChanges: {
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  recalChangesLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  recalChangesText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    lineHeight: 18,
  },
  recalibrateButton: {
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    alignItems: 'center' as const,
    marginTop: theme.spacing.sm,
  },
  recalibrateText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as const,
  },
});
