import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { getDefaultParams } from '../../constants/strategyModes';
import { StrategyCard } from '../../components/settings/StrategyCard';
import { StrategyMode, StrategyParams } from '../../types';

export default function SettingsScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<StrategyMode>('balanced');
  const [params, setParams] = useState<StrategyParams>(getDefaultParams('balanced'));

  useEffect(() => {
    AsyncStorage.getItem('strategy_mode').then((val) => {
      if (val) {
        const m = val as StrategyMode;
        setMode(m);
        setParams(getDefaultParams(m));
      }
    });
  }, []);

  const handleModeChange = (newMode: StrategyMode) => {
    setMode(newMode);
    setParams(getDefaultParams(newMode));
  };

  const handleParamsChange = (updates: Partial<StrategyParams>) => {
    setParams((prev) => ({ ...prev, ...updates }));
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will restart the onboarding flow. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('onboarding_completed');
            await AsyncStorage.removeItem('strategy_mode');
            await AsyncStorage.removeItem('user_id');
            router.replace('/');
          },
        },
      ],
    );
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

        <TouchableOpacity style={styles.resetButton} onPress={handleResetOnboarding}>
          <Text style={styles.resetText}>Redo Onboarding</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  resetButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  resetText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
});
