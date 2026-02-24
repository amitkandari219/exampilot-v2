import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { getDefaultParams } from '../../constants/strategyModes';
import { StrategyCard } from '../../components/settings/StrategyCard';
import { useAuth } from '../../hooks/useAuth';
import { useActivateRecovery, useExitRecovery, useBurnout } from '../../hooks/useBurnout';
import { StrategyMode, StrategyParams } from '../../types';
import { api } from '../../lib/api';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { data: burnout } = useBurnout();
  const activateRecovery = useActivateRecovery();
  const exitRecovery = useExitRecovery();

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
