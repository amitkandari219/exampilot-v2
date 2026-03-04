import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Text, View, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Platform, Alert, Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { Theme } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useProfile, useUpdateProfile } from '../../hooks/useProfile';
import { useSwitchExamMode } from '../../hooks/useStrategy';
import { useGamification, useBadges } from '../../hooks/useGamification';
import { V4Card } from '../../components/v4/V4Card';
import { V4MetricBox } from '../../components/v4/V4MetricBox';
import { V4Pill } from '../../components/v4/V4Pill';
import { V4SectionLabel } from '../../components/v4/V4SectionLabel';
import { ExamMode } from '../../types';
import { api } from '../../lib/api';

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
      if (result instanceof Promise) result.catch(() => {});
    }
  } else {
    // @ts-expect-error Alert.alert button style types are stricter than our union
    Alert.alert(title, message, buttons);
  }
}

const EXAM_MODES: { key: ExamMode; label: string }[] = [
  { key: 'prelims', label: 'Prelims' },
  { key: 'mains', label: 'Mains' },
  { key: 'post_prelims', label: 'Post-Prelims' },
];

const STUDY_APPROACHES = [
  { key: 'sequential', label: 'Sequential', desc: 'Focus on one subject at a time until complete' },
  { key: 'mixed', label: 'Mixed', desc: 'Study multiple subjects each day for variety' },
] as const;

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { user, signOut } = useAuth();
  const { daysUsed, attempt } = useUser();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const switchExamMode = useSwitchExamMode();
  const { data: gamification } = useGamification();
  const { data: badges } = useBadges();

  // Notification preferences (local-only)
  const [notifPrefs, setNotifPrefs] = useState({
    daily_reminders: true,
    weekly_alerts: true,
    streak_warnings: true,
  });
  useEffect(() => {
    AsyncStorage.getItem('v4_notification_prefs').then((val) => {
      if (val) setNotifPrefs(JSON.parse(val));
    });
  }, []);
  const toggleNotif = useCallback((key: keyof typeof notifPrefs) => {
    setNotifPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      AsyncStorage.setItem('v4_notification_prefs', JSON.stringify(next));
      return next;
    });
  }, []);

  const [hoursLocal, setHoursLocal] = useState<number | null>(null);
  const dailyHours = hoursLocal ?? profile?.daily_hours ?? 6;
  const studyApproach = profile?.study_approach || 'mixed';
  const currentExamMode = (profile?.current_mode || 'prelims') as ExamMode;

  const daysLeft = profile?.exam_date
    ? Math.max(0, Math.ceil((new Date(profile.exam_date).getTime() - Date.now()) / 86400000))
    : null;

  const strategyLabel = profile?.strategy_mode
    ? profile.strategy_mode.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    : 'Balanced';

  const attemptLabel = attempt === 1 ? '1st' : attempt === 2 ? '2nd' : '3rd+';

  const handleExamModeSwitch = useCallback((mode: ExamMode) => {
    if (mode === currentExamMode) return;
    switchExamMode.mutate(mode);
  }, [currentExamMode, switchExamMode]);

  const handleStudyApproachChange = useCallback((approach: string) => {
    if (approach === studyApproach) return;
    updateProfile.mutate({ study_approach: approach });
  }, [studyApproach, updateProfile]);

  const handleHoursCommit = useCallback((value: number) => {
    const rounded = Math.round(value * 2) / 2;
    setHoursLocal(rounded);
    updateProfile.mutate({ daily_hours: rounded });
  }, [updateProfile]);

  const handleRedoOnboarding = () => {
    crossAlert(
      'Redo Onboarding',
      'This will reset your strategy and preferences. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await api.resetOnboarding();
            router.replace('/onboarding');
          },
        },
      ]
    );
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

  // Badge counts
  const totalBadges = badges?.length ?? 0;
  const unlockedBadges = badges?.filter((b) => b.unlocked) ?? [];
  const lockedBadges = badges?.filter((b) => !b.unlocked) ?? [];
  const xpLevel = gamification?.current_level ?? 1;
  const xpTotal = gamification?.xp_total ?? 0;
  const xpForNext = gamification?.xp_for_next_level ?? 500;
  const xpProgress = gamification?.xp_progress_in_level ?? 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {/* ── Profile Section ── */}
        <V4SectionLabel text="Profile" style={styles.sectionLabel} />
        <V4Card style={styles.section}>
          <Text style={styles.profileName}>{profile?.name || user?.email || 'Student'}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          {profile?.exam_date && (
            <Text style={styles.profileMeta}>
              Target: {new Date(profile.exam_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </Text>
          )}
          <View style={styles.metricRow}>
            <V4MetricBox
              value={daysLeft ?? '--'}
              label="Days Left"
              valueColor={daysLeft !== null && daysLeft < 90 ? theme.colors.warning : theme.colors.accent}
            />
            <View style={{ width: 10 }} />
            <V4MetricBox value={daysUsed} label="Days of Prep" />
          </View>
        </V4Card>

        {/* ── Appearance ── */}
        <V4SectionLabel text="Appearance" style={styles.sectionLabel} />
        <V4Card style={styles.section}>
          <View style={styles.notifRow}>
            <Text style={styles.notifLabel}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.accent + '88' }}
              thumbColor={isDark ? theme.colors.accent : theme.colors.textMuted}
            />
          </View>
        </V4Card>

        {/* ── Exam Mode ── */}
        <V4SectionLabel text="Exam Mode" style={styles.sectionLabel} />
        <V4Card style={styles.section}>
          <View style={styles.segmentRow}>
            {EXAM_MODES.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.segment,
                  currentExamMode === key && { backgroundColor: theme.colors.accent },
                ]}
                onPress={() => handleExamModeSwitch(key)}
                disabled={switchExamMode.isPending}
              >
                <Text style={[
                  styles.segmentText,
                  currentExamMode === key && { color: theme.colors.background, fontWeight: '700' },
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.hint}>
            Switching mode regenerates tomorrow's plan and adjusts subject priorities.
          </Text>
        </V4Card>

        {/* ── Study Preference ── */}
        <V4SectionLabel text="Study Preference" style={styles.sectionLabel} />
        <V4Card style={styles.section}>
          {STUDY_APPROACHES.map(({ key, label, desc }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.optionCard,
                { borderColor: studyApproach === key ? theme.colors.accent : theme.colors.border },
              ]}
              onPress={() => handleStudyApproachChange(key)}
              disabled={updateProfile.isPending}
            >
              <View style={styles.optionHeader}>
                <Text style={[
                  styles.optionLabel,
                  studyApproach === key && { color: theme.colors.accent },
                ]}>{label}</Text>
                {studyApproach === key && <V4Pill label="Active" variant="accent" />}
              </View>
              <Text style={styles.optionDesc}>{desc}</Text>
            </TouchableOpacity>
          ))}
        </V4Card>

        {/* ── Daily Hours ── */}
        <V4SectionLabel text="Daily Hours Target" style={styles.sectionLabel} />
        <V4Card style={styles.section}>
          <Text style={styles.hoursValue}>{dailyHours.toFixed(1)}h</Text>
          <Slider
            style={styles.slider}
            minimumValue={2}
            maximumValue={12}
            step={0.5}
            value={dailyHours}
            onValueChange={setHoursLocal}
            onSlidingComplete={handleHoursCommit}
            minimumTrackTintColor={theme.colors.accent}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.accent}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderBound}>2h</Text>
            <Text style={styles.sliderBound}>12h</Text>
          </View>
        </V4Card>

        {/* ── Achievements ── */}
        <V4SectionLabel text="Achievements" style={styles.sectionLabel} />
        <V4Card style={styles.section}>
          <View style={styles.xpRow}>
            <Text style={styles.xpLevel}>Level {xpLevel}</Text>
            <Text style={styles.xpAmount}>{xpTotal.toLocaleString()} XP</Text>
          </View>
          <View style={styles.xpBarTrack}>
            <View
              style={[
                styles.xpBarFill,
                {
                  width: `${Math.min(100, (xpProgress / Math.max(xpForNext, 1)) * 100)}%`,
                  backgroundColor: theme.colors.accent,
                },
              ]}
            />
          </View>
          <Text style={styles.xpProgress}>{xpProgress} / {xpForNext} XP to next level</Text>

          {/* Badge grid */}
          {(unlockedBadges.length > 0 || lockedBadges.length > 0) && (
            <View style={styles.badgeGrid}>
              {unlockedBadges.slice(0, 8).map((b) => (
                <View key={b.id} style={styles.badgeItem}>
                  <Text style={styles.badgeIcon}>{b.icon_name}</Text>
                  <Text style={styles.badgeName} numberOfLines={1}>{b.name}</Text>
                </View>
              ))}
              {lockedBadges.slice(0, Math.max(0, 8 - unlockedBadges.length)).map((b) => (
                <View key={b.id} style={[styles.badgeItem, { opacity: 0.4 }]}>
                  <Text style={styles.badgeIcon}>{b.icon_name}</Text>
                  <Text style={styles.badgeName} numberOfLines={1}>{b.name}</Text>
                </View>
              ))}
            </View>
          )}
          {totalBadges > 8 && (
            <Text style={styles.viewAll}>{unlockedBadges.length}/{totalBadges} badges unlocked</Text>
          )}
        </V4Card>

        {/* ── Notifications ── */}
        <V4SectionLabel text="Notifications" style={styles.sectionLabel} />
        <V4Card style={styles.section}>
          <View style={styles.notifRow}>
            <Text style={styles.notifLabel}>Daily study reminders</Text>
            <Switch
              value={notifPrefs.daily_reminders}
              onValueChange={() => toggleNotif('daily_reminders')}
              trackColor={{ false: theme.colors.border, true: theme.colors.accent + '88' }}
              thumbColor={notifPrefs.daily_reminders ? theme.colors.accent : theme.colors.textMuted}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.notifRow}>
            <Text style={styles.notifLabel}>Weekly review alerts</Text>
            <Switch
              value={notifPrefs.weekly_alerts}
              onValueChange={() => toggleNotif('weekly_alerts')}
              trackColor={{ false: theme.colors.border, true: theme.colors.accent + '88' }}
              thumbColor={notifPrefs.weekly_alerts ? theme.colors.accent : theme.colors.textMuted}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.notifRow}>
            <Text style={styles.notifLabel}>Streak warnings</Text>
            <Switch
              value={notifPrefs.streak_warnings}
              onValueChange={() => toggleNotif('streak_warnings')}
              trackColor={{ false: theme.colors.border, true: theme.colors.accent + '88' }}
              thumbColor={notifPrefs.streak_warnings ? theme.colors.accent : theme.colors.textMuted}
            />
          </View>
        </V4Card>

        {/* ── Strategy Info (Read-Only) ── */}
        <V4SectionLabel text="Strategy" style={styles.sectionLabel} />
        <V4Card style={styles.section}>
          <View style={styles.strategyRow}>
            <Text style={styles.strategyLabel}>Auto-calculated mode</Text>
            <V4Pill label={strategyLabel} variant="accent" />
          </View>
          <Text style={styles.hint}>
            Based on your attempt ({attemptLabel}), daily hours ({dailyHours}h), and schedule.
            Change hours or redo onboarding to recalculate.
          </Text>
        </V4Card>

        {/* ── Actions ── */}
        <V4SectionLabel text="Actions" style={styles.sectionLabel} />
        <V4Card style={styles.section}>
          <TouchableOpacity style={styles.actionRow} onPress={handleRedoOnboarding}>
            <Text style={styles.actionText}>Redo Onboarding</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <TouchableOpacity style={styles.actionRow} onPress={handleSignOut}>
            <Text style={[styles.actionText, { color: theme.colors.error }]}>Sign Out</Text>
            <Text style={[styles.actionArrow, { color: theme.colors.error }]}>›</Text>
          </TouchableOpacity>
        </V4Card>

        {/* ── About ── */}
        <V4SectionLabel text="About" style={styles.sectionLabel} />
        <V4Card style={styles.section}>
          <View style={styles.actionRow}>
            <View>
              <Text style={styles.actionText}>About ExamPilot</Text>
              <Text style={styles.aboutVersion}>Version 4.0</Text>
            </View>
            <Text style={styles.actionArrow}>▸</Text>
          </View>
        </V4Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1 },
  content: { padding: theme.spacing.lg, paddingBottom: 100 },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 2,
  },
  section: {
    marginBottom: 4,
  },

  // Profile
  profileName: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  profileEmail: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  profileMeta: { fontSize: 12, color: theme.colors.textMuted, marginTop: 4 },
  metricRow: { flexDirection: 'row', marginTop: 14 },

  // Segment control
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  hint: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 8,
    lineHeight: 16,
  },

  // Study preference
  optionCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLabel: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  optionDesc: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },

  // Hours slider
  hoursValue: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.accent,
    textAlign: 'center',
  },
  slider: { marginTop: 8, marginHorizontal: -4 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderBound: { fontSize: 11, color: theme.colors.textMuted },

  // XP / Achievements
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xpLevel: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  xpAmount: { fontSize: 13, color: theme.colors.textSecondary },
  xpBarTrack: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  xpBarFill: { height: 6, borderRadius: 3 },
  xpProgress: { fontSize: 11, color: theme.colors.textMuted, marginTop: 4 },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    gap: 10,
  },
  badgeItem: { alignItems: 'center', width: 60 },
  badgeIcon: { fontSize: 24 },
  badgeName: { fontSize: 9, color: theme.colors.textSecondary, marginTop: 2, textAlign: 'center' },
  viewAll: { fontSize: 12, color: theme.colors.accent, marginTop: 10 },

  // Strategy
  strategyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  strategyLabel: { fontSize: 14, color: theme.colors.text },

  // Notifications
  notifRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  notifLabel: { fontSize: 14, color: theme.colors.text },

  // About
  aboutVersion: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },

  // Actions
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  actionText: { fontSize: 15, color: theme.colors.text },
  actionArrow: { fontSize: 20, color: theme.colors.textMuted },
  divider: { height: 1 },
});
