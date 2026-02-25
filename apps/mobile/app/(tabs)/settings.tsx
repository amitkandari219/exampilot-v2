import React, { useEffect, useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Switch, ActivityIndicator, Platform, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation, CommonActions, useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';

function crossAlert(title: string, message: string, buttons: Array<{ text: string; style?: string; onPress?: () => void | Promise<void> }>) {
  if (Platform.OS === 'web') {
    const confirmed = window.confirm(`${title}\n\n${message}`);
    if (confirmed) {
      const destructive = buttons.find((b) => b.style === 'destructive');
      const result = destructive?.onPress?.();
      if (result && typeof (result as any).then === 'function') {
        (result as Promise<void>).catch(() => {});
      }
    }
  } else {
    Alert.alert(title, message, buttons as any);
  }
}
import { getDefaultParams } from '../../constants/strategyModes';
import { StrategyCard } from '../../components/settings/StrategyCard';
import { useAuth } from '../../hooks/useAuth';
import { useActivateRecovery, useExitRecovery, useBurnout } from '../../hooks/useBurnout';
import { useRecalibrationStatus, useTriggerRecalibration, useSetAutoRecalibrate } from '../../hooks/useRecalibration';
import { useGamification, useBadges } from '../../hooks/useGamification';
import { BadgeGrid } from '../../components/gamification/BadgeGrid';
import { StrategyMode, StrategyParams, ExamMode } from '../../types';
import { useSwitchExamMode } from '../../hooks/useStrategy';
import { useProfile, useUpdateProfile } from '../../hooks/useProfile';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';

export default function SettingsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
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
  const switchExamMode = useSwitchExamMode();

  const { data: profileData } = useProfile();
  const updateProfile = useUpdateProfile();

  const [resetting, setResetting] = useState(false);
  const [mode, setMode] = useState<StrategyMode>('balanced');
  const [examMode, setExamMode] = useState<ExamMode>('mains');
  const [params, setParams] = useState<StrategyParams>(getDefaultParams('balanced'));
  const [personaParams, setPersonaParams] = useState<Record<string, number>>({});

  // Profile edit state
  const [profileName, setProfileName] = useState('');
  const [profileExamDate, setProfileExamDate] = useState<Date | null>(null);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profileDirty, setProfileDirty] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Load profile from API if available
  useEffect(() => {
    if (profileData) {
      setProfileName(profileData.name || '');
      setProfileExamDate(profileData.exam_date ? new Date(profileData.exam_date) : null);
      setProfileAvatarUrl(profileData.avatar_url);
    }
  }, [profileData]);

  // Also load directly from Supabase (works even if API profile route isn't deployed)
  const loadProfileFromSupabase = React.useCallback(() => {
    if (!user?.id) return;
    supabase
      .from('user_profiles')
      .select('name, exam_date')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.name) setProfileName(data.name);
        if (data?.exam_date) setProfileExamDate(new Date(data.exam_date));
      });
    // avatar_url may not exist if migration hasn't run — query separately
    supabase
      .from('user_profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.avatar_url) setProfileAvatarUrl(data.avatar_url);
      })
      .catch(() => {});
  }, [user?.id]);

  useFocusEffect(loadProfileFromSupabase);

  const loadStrategy = React.useCallback(() => {
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
        if (data.current_mode) setExamMode(data.current_mode);
      }
    }).catch(() => {});
  }, []);

  useFocusEffect(loadStrategy);

  const examModeDescriptions: Record<ExamMode, string> = {
    prelims: 'MCQ focus. Velocity targets prelims date.',
    mains: 'Full GS syllabus with answer writing focus.',
    post_prelims: 'Intensive mains prep after clearing prelims.',
  };

  const handleExamModeChange = (newMode: ExamMode) => {
    setExamMode(newMode);
    switchExamMode.mutate(newMode);
  };

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

  const getInitials = (name: string, email?: string) => {
    if (name) {
      return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
    }
    return (email || '?')[0].toUpperCase();
  };

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0]) return;

    setUploadingAvatar(true);
    try {
      const asset = result.assets[0];
      const ext = asset.uri.split('.').pop() || 'jpg';
      const fileName = `${user?.id || 'avatar'}_${Date.now()}.${ext}`;

      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { contentType: asset.mimeType || 'image/jpeg', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      setProfileAvatarUrl(publicUrl);
      updateProfile.mutate({ avatar_url: publicUrl });
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message || 'Could not upload avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = () => {
    const updates: { name?: string; exam_date?: string } = {};
    if (profileName !== (profileData?.name || '')) updates.name = profileName;
    if (profileExamDate) {
      const dateStr = profileExamDate.toISOString().split('T')[0];
      if (dateStr !== profileData?.exam_date) updates.exam_date = dateStr;
    }
    if (Object.keys(updates).length > 0) {
      updateProfile.mutate(updates);
      setProfileDirty(false);
    }
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>

          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickAvatar} disabled={uploadingAvatar}>
            {profileAvatarUrl ? (
              <Image source={{ uri: profileAvatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{getInitials(profileName, user?.email)}</Text>
              </View>
            )}
            {uploadingAvatar && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
            <Text style={styles.avatarHint}>Tap to change</Text>
          </TouchableOpacity>

          <View style={styles.profileField}>
            <Text style={styles.paramLabel}>Name</Text>
            <TextInput
              style={styles.profileInput}
              value={profileName}
              onChangeText={(text) => { setProfileName(text); setProfileDirty(true); }}
              placeholder="Your name"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Email</Text>
            <Text style={styles.paramValue}>{user?.email || 'N/A'}</Text>
          </View>

          <TouchableOpacity style={styles.profileField} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.paramLabel}>Exam Date</Text>
            <Text style={styles.profileDateText}>
              {profileExamDate ? profileExamDate.toLocaleDateString() : 'Not set'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={profileExamDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={(event, date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (date) { setProfileExamDate(date); setProfileDirty(true); }
              }}
            />
          )}

          {profileDirty && (
            <TouchableOpacity
              style={styles.saveProfileButton}
              onPress={handleSaveProfile}
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Text style={styles.saveProfileText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.recoveryRow}>
            <Text style={styles.paramLabel}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.text}
            />
          </View>
        </View>

        {gamification && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Level & Achievements</Text>
            <View style={styles.paramRow}>
              <Text style={styles.paramLabel}>Level</Text>
              <Text style={styles.paramValue}>{gamification.current_level}</Text>
            </View>
            <View style={styles.paramRow}>
              <Text style={styles.paramLabel}>Total XP</Text>
              <Text style={styles.paramValue}>{gamification.xp_total.toLocaleString()}</Text>
            </View>
            <View style={styles.paramRow}>
              <Text style={styles.paramLabel}>Badges Unlocked</Text>
              <Text style={styles.paramValue}>{gamification.total_badges_unlocked}</Text>
            </View>
            {badges && badges.length > 0 && (
              <BadgeGrid badges={badges} />
            )}
          </View>
        )}

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
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.resetButton, resetting && { opacity: 0.5 }]}
          disabled={resetting}
          onPress={() => {
            crossAlert(
              'Reset Onboarding',
              'This will clear all your progress, plans, and data, and restart onboarding from scratch. This cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset Everything',
                  style: 'destructive',
                  onPress: async () => {
                    setResetting(true);
                    // Save profile values before reset so onboarding can pre-fill
                    // Try Supabase first, fall back to local state
                    let saveName = profileName || '';
                    let saveDate = profileExamDate ? profileExamDate.toISOString().split('T')[0] : '';
                    try {
                      if (user?.id) {
                        const { data: freshProfile } = await supabase
                          .from('user_profiles')
                          .select('name, exam_date')
                          .eq('id', user.id)
                          .single();
                        if (freshProfile?.name) saveName = freshProfile.name;
                        if (freshProfile?.exam_date) saveDate = freshProfile.exam_date;
                      }
                    } catch {
                      // Use local state values
                    }
                    if (Platform.OS === 'web') {
                      if (saveName) localStorage.setItem('prefill_name', saveName);
                      if (saveDate) localStorage.setItem('prefill_exam_date', saveDate);
                    } else {
                      if (saveName) await AsyncStorage.setItem('prefill_name', saveName);
                      if (saveDate) await AsyncStorage.setItem('prefill_exam_date', saveDate);
                    }
                    try {
                      await api.resetOnboarding();
                    } catch {
                      // Continue even if API fails
                    }
                    // Reset theme to light mode
                    if (isDark) toggleTheme();
                    queryClient.clear();
                    if (Platform.OS === 'web') {
                      window.location.href = '/onboarding';
                    } else {
                      const root = navigation.getParent() ?? navigation;
                      root.dispatch(
                        CommonActions.reset({
                          index: 0,
                          routes: [{ name: 'onboarding' }],
                        })
                      );
                    }
                  },
                },
              ]
            );
          }}
        >
          {resetting ? (
            <ActivityIndicator size="small" color={theme.colors.textSecondary} />
          ) : (
            <Text style={styles.resetText}>Redo Onboarding</Text>
          )}
        </TouchableOpacity>
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
  examModeToggle: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  examModeButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  examModeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  examModeButtonText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
  },
  examModeButtonTextActive: {
    color: theme.colors.background,
  },
  examModeDesc: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center' as const,
  },
  avatarContainer: {
    alignItems: 'center' as const,
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary + '30',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  avatarInitials: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700' as const,
    color: theme.colors.primary,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 36,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: 72,
    height: 72,
    alignSelf: 'center' as const,
    position: 'absolute' as const,
    top: 0,
  },
  avatarHint: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  profileField: {
    paddingVertical: theme.spacing.xs,
  },
  profileInput: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.xs,
  },
  profileDateText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '600' as const,
    paddingVertical: theme.spacing.xs,
  },
  saveProfileButton: {
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    alignItems: 'center' as const,
    marginTop: theme.spacing.sm,
  },
  saveProfileText: {
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
