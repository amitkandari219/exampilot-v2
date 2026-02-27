import React, { useState, useMemo } from 'react';
import { Text, StyleSheet, SafeAreaView, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import { getDefaultParams } from '../../constants/strategyModes';
import { StrategyCard } from '../../components/settings/StrategyCard';
import { ProfileSection } from '../../components/settings/ProfileSection';
import { AppearanceSection } from '../../components/settings/AppearanceSection';
import { GamificationSection } from '../../components/settings/GamificationSection';
import { PersonaParamsSection } from '../../components/settings/PersonaParamsSection';
import { RecalibrationSection } from '../../components/settings/RecalibrationSection';
import { RecoverySection } from '../../components/settings/RecoverySection';
import { AccountSection } from '../../components/settings/AccountSection';
import { useAuth } from '../../hooks/useAuth';
import { useStrategy, useCustomizeParams, useSwitchMode } from '../../hooks/useStrategy';
import { useActivateRecovery, useExitRecovery, useBurnout } from '../../hooks/useBurnout';
import { useRecalibrationStatus, useTriggerRecalibration, useSetAutoRecalibrate } from '../../hooks/useRecalibration';
import { useGamification, useBadges } from '../../hooks/useGamification';
import { StrategyMode, StrategyParams } from '../../types';
import { useProfile, useUpdateProfile } from '../../hooks/useProfile';


function crossAlert(
  title: string,
  message: string,
  buttons: Array<{ text: string; style?: string; onPress?: () => void | Promise<void> }>
) {
  if (Platform.OS === 'web') {
    const confirmed = window.confirm(`${title}\n\n${message}`);
    if (confirmed) {
      const destructive = buttons.find((b) => b.style === 'destructive');
      const result = destructive?.onPress?.();
      if (result instanceof Promise) {
        result.catch(() => {});
      }
    }
  } else {
    // @ts-expect-error Alert.alert button style types are stricter than our union
    Alert.alert(title, message, buttons);
  }
}

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { user, signOut } = useAuth();
  const { data: burnout } = useBurnout();
  const activateRecovery = useActivateRecovery();
  const exitRecovery = useExitRecovery();
  const { data: recalStatus } = useRecalibrationStatus();
  const triggerRecalibration = useTriggerRecalibration();
  const setAutoRecalibrate = useSetAutoRecalibrate();
  const { data: gamification } = useGamification();
  const { data: badges } = useBadges();
  const { data: profileData } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: strategyData } = useStrategy();
  const customizeParams = useCustomizeParams();
  const switchMode = useSwitchMode();

  const [mode, setMode] = useState<StrategyMode>('balanced');
  const [params, setParams] = useState<StrategyParams>(getDefaultParams('balanced'));
  const [personaParams, setPersonaParams] = useState<Record<string, number>>({});

  // Derive profile state from useProfile hook data (no direct Supabase call)
  const profileName = profileData?.name || '';
  const profileExamDate = profileData?.exam_date ? new Date(profileData.exam_date) : null;

  // Initialize local state from strategy hook data
  React.useEffect(() => {
    if (strategyData?.strategy_mode) {
      setMode(strategyData.strategy_mode);
      setParams(strategyData.strategy_params || getDefaultParams(strategyData.strategy_mode));
      setPersonaParams({
        fatigue_threshold: strategyData.fatigue_threshold ?? 85,
        buffer_capacity: strategyData.buffer_capacity ?? 0.15,
        fsrs_target_retention: strategyData.fsrs_target_retention ?? 0.9,
        burnout_threshold: strategyData.burnout_threshold ?? 75,
      });
    }
  }, [strategyData]);

  const handleModeChange = (newMode: StrategyMode) => {
    setMode(newMode);
    setParams(getDefaultParams(newMode));
    switchMode.mutate(newMode);
  };

  const handleParamsChange = (updates: Partial<StrategyParams>) => {
    setParams((prev) => ({ ...prev, ...updates }));
    customizeParams.mutate(updates);
  };

  const handleSignOut = () => {
    crossAlert('Sign Out', 'Are you sure?', [
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

        <ProfileSection
          theme={theme}
          user={user}
          profileData={profileData}
          updateProfile={updateProfile}
        />

        <AppearanceSection
          theme={theme}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />

        <GamificationSection
          theme={theme}
          gamification={gamification}
          badges={badges}
        />

        <StrategyCard
          currentMode={mode}
          params={params}
          onModeChange={handleModeChange}
          onParamsChange={handleParamsChange}
        />

        <PersonaParamsSection
          theme={theme}
          personaParams={personaParams}
        />

        <RecalibrationSection
          theme={theme}
          recalStatus={recalStatus}
          triggerRecalibration={triggerRecalibration}
          setAutoRecalibrate={setAutoRecalibrate}
        />

        <RecoverySection
          theme={theme}
          burnout={burnout}
          handleRecoveryToggle={handleRecoveryToggle}
        />

        <AccountSection
          theme={theme}
          handleSignOut={handleSignOut}
          isDark={isDark}
          toggleTheme={toggleTheme}
          userId={user?.id}
          profileName={profileName}
          profileExamDate={profileExamDate}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, padding: theme.spacing.lg },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
});
