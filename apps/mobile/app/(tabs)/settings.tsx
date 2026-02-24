import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Switch, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { getDefaultParams } from '../../constants/strategyModes';
import { StrategyCard } from '../../components/settings/StrategyCard';
import { useAuth } from '../../hooks/useAuth';
import { useActivateRecovery, useExitRecovery, useBurnout } from '../../hooks/useBurnout';
import { useRecalibrationStatus, useTriggerRecalibration, useSetAutoRecalibrate } from '../../hooks/useRecalibration';
import { StrategyMode, StrategyParams } from '../../types';
import { api } from '../../lib/api';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { data: burnout } = useBurnout();
  const activateRecovery = useActivateRecovery();
  const exitRecovery = useExitRecovery();
  const { data: recalStatus } = useRecalibrationStatus();
  const triggerRecalibration = useTriggerRecalibration();
  const setAutoRecalibrate = useSetAutoRecalibrate();

  const [mode, setMode] = useState<StrategyMode>('balanced');
  const [params, setParams] = useState<StrategyParams>(getDefaultParams('balanced'));
  const [personaParams, setPersonaParams] = useState<Record<string, number>>({});

  useEffect(() => {
    api.getStrategy().then((data: any) => {
      if (data?.strategy_mode) {
        setMode(data.strategy_mode);
        setParams(data.strategy_params || getDefaultParams(data.strategy_mode));
        setPersonaParams({
          fatigue_threshold: data.fatigue_threshold || 85,
          buffer_capacity: data.buffer_capacity || 0.15,
          fsrs_target_retention: data.fsrs_target_retention || 0.9,
          burnout_threshold: data.burnout_threshold || 75,
        });
      }
    }).catch(() => {});
  }, []);

  const handleModeChange = async (newMode: StrategyMode) => {
    setMode(newMode);
    setParams(getDefaultParams(newMode));
    try {
      await api.switchMode(newMode);
    } catch {}
  };

  const handleParamsChange = (updates: Partial<StrategyParams>) => {
    setParams((prev) => ({ ...prev, ...updates }));
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/');
        },
      },
    ]);
  };

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

  const formatParamChange = (entry: NonNullable<typeof recalStatus>['last_entry']) => {
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
  };

  const handleRecoveryToggle = (value: boolean) => {
    if (value) {
      activateRecovery.mutate();
    } else {
      exitRecovery.mutate('manual');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <StrategyCard
          currentMode={mode}
          params={params}
          onModeChange={handleModeChange}
          onParamsChange={handleParamsChange}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Persona Parameters</Text>
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Fatigue Threshold</Text>
            <Text style={styles.paramValue}>{personaParams.fatigue_threshold || 85}</Text>
          </View>
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Buffer Capacity</Text>
            <Text style={styles.paramValue}>{((personaParams.buffer_capacity || 0.15) * 100).toFixed(0)}%</Text>
          </View>
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>FSRS Target Retention</Text>
            <Text style={styles.paramValue}>{((personaParams.fsrs_target_retention || 0.9) * 100).toFixed(0)}%</Text>
          </View>
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Burnout Threshold</Text>
            <Text style={styles.paramValue}>{personaParams.burnout_threshold || 75}</Text>
          </View>
        </View>

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Email</Text>
            <Text style={styles.paramValue}>{user?.email || 'N/A'}</Text>
          </View>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            Alert.alert('Reset Onboarding', 'This will restart the onboarding flow. Continue?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Reset',
                style: 'destructive',
                onPress: () => router.replace('/onboarding'),
              },
            ]);
          }}
        >
          <Text style={styles.resetText}>Redo Onboarding</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, padding: theme.spacing.lg },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
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
  recoveryDay: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.success,
    marginTop: 2,
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
  signOutButton: {
    backgroundColor: theme.colors.error + '20',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  signOutText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  resetText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
});
