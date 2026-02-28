import React, {  useState, useEffect , useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useStress } from '../../hooks/useStress';
import { useStrategy, useSwitchExamMode } from '../../hooks/useStrategy';
import { useVelocity } from '../../hooks/useVelocity';
import { useBuffer } from '../../hooks/useVelocity';
import { useBurnout } from '../../hooks/useBurnout';
import { useDailyPlan } from '../../hooks/usePlanner';
import { useConfidenceOverview } from '../../hooks/useFSRS';
import { useWeaknessOverview } from '../../hooks/useWeakness';
import { useGamification } from '../../hooks/useGamification';
import { useBenchmark } from '../../hooks/useBenchmark';
import { useCAStats } from '../../hooks/useCurrentAffairs';
import { useMockTests } from '../../hooks/useMockTest';
import { XPProgressCard } from '../../components/gamification/XPProgressCard';
import { BenchmarkScoreCard } from '../../components/benchmark/BenchmarkScoreCard';
import { CADashboardCard } from '../../components/ca/CADashboardCard';
import { StressThermometer } from '../../components/dashboard/StressThermometer';
import { VelocityCard } from '../../components/dashboard/VelocityCard';
import { BufferBankCard } from '../../components/dashboard/BufferBankCard';
import { BurnoutIndicator } from '../../components/dashboard/BurnoutIndicator';
import { WeaknessRadarCard } from '../../components/weakness/WeaknessRadarCard';
import { EmotionalBanner } from '../../components/dashboard/EmotionalBanner';
import { GuidedOrientation } from '../../components/dashboard/GuidedOrientation';
import { ConfidenceStatus, ExamMode } from '../../types';

export default function DashboardScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const { user } = useAuth();
  const { data: stress, isLoading: stressLoading } = useStress();
  const { data: velocity } = useVelocity();
  const { data: buffer } = useBuffer();
  const { data: burnout } = useBurnout();
  const { data: plan } = useDailyPlan();
  const { data: confidence } = useConfidenceOverview();
  const { data: weakness } = useWeaknessOverview();
  const { data: gamification } = useGamification();
  const { data: benchmark } = useBenchmark();
  const { data: caStats } = useCAStats();
  const { data: mocks } = useMockTests(1);
  const { data: strategyData } = useStrategy();
  const switchExamMode = useSwitchExamMode();
  const [examMode, setExamMode] = useState<ExamMode>('mains');

  useEffect(() => {
    if (strategyData?.current_mode) setExamMode(strategyData.current_mode);
  }, [strategyData]);

  const handleExamModeChange = (newMode: ExamMode) => {
    setExamMode(newMode);
    switchExamMode.mutate(newMode);
  };

  const greeting = getGreeting();
  const userName = user?.user_metadata?.name || 'Aspirant';

  // Progressive disclosure: hide advanced metrics for users in first 14 days
  const accountAgeDays = user?.created_at
    ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86400000)
    : 999;
  const isNewUser = accountAgeDays < 14;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}, {userName}</Text>
            <Text style={styles.subtitle}>ExamPilot Dashboard</Text>
          </View>
          {burnout && (
            <BurnoutIndicator
              briScore={burnout.bri_score}
              status={burnout.status}
              inRecovery={burnout.in_recovery}
            />
          )}
        </View>

        <View style={styles.examModeToggle}>
          {(['prelims', 'mains', 'post_prelims'] as ExamMode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.examModeBtn, examMode === m && styles.examModeBtnActive]}
              onPress={() => handleExamModeChange(m)}
              disabled={switchExamMode.isPending}
            >
              <Text style={[styles.examModeBtnText, examMode === m && styles.examModeBtnTextActive]}>
                {m === 'post_prelims' ? 'After Prelims' : m.charAt(0).toUpperCase() + m.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {velocity?.days_remaining != null && (
          <View style={styles.countdownBar}>
            <Text style={styles.countdownNumber}>{velocity.days_remaining}</Text>
            <Text style={styles.countdownLabel}>days to exam</Text>
          </View>
        )}

        {accountAgeDays <= 3 && (
          <GuidedOrientation dayNumber={Math.max(1, accountAgeDays)} />
        )}

        <EmotionalBanner
          streakCount={velocity?.streak?.current_count ?? 0}
          inRecovery={burnout?.in_recovery ?? false}
          isLightDay={plan?.is_light_day ?? false}
          lastMockScore={mocks?.[0] ? (mocks[0].score / mocks[0].max_score) * 100 : null}
          consecutiveMissedDays={burnout?.consecutive_missed_days ?? 0}
          briScore={burnout?.bri_score ?? 80}
        />

        {plan && plan.items && plan.items.length > 0 && (
          <View style={styles.section}>
            <View style={styles.planPreview}>
              <View style={styles.planHeader}>
                <Text style={styles.sectionTitle}>Today's Plan</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/planner')}>
                  <Text style={styles.viewAll}>View full plan</Text>
                </TouchableOpacity>
              </View>
              {plan.items.slice(0, 3).map((item) => (
                <View key={item.id} style={styles.planItem}>
                  <View style={[styles.statusDot, {
                    backgroundColor: item.status === 'completed' ? theme.colors.success : theme.colors.border,
                  }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.planItemName, item.status === 'completed' && styles.completed]}>
                      {item.topic?.name || 'Topic'}
                    </Text>
                    <Text style={styles.planItemMeta}>
                      {item.type.toUpperCase()} - {item.estimated_hours}h
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {velocity && (
          <View style={styles.section}>
            <VelocityCard
              velocityRatio={velocity.velocity_ratio}
              status={velocity.status}
              trend={velocity.trend}
              projectedDate={velocity.projected_completion_date}
              streak={velocity.streak}
            />
          </View>
        )}

        {benchmark && (
          <View style={styles.section}>
            <BenchmarkScoreCard profile={benchmark} compact />
          </View>
        )}

        {!isNewUser && stress && (
          <View style={styles.section}>
            <StressThermometer
              score={stress.score}
              status={stress.status}
              label={stress.label}
              signals={stress.signals}
              recommendation={stress.recommendation}
              history={stress.history?.map((h) => h.score)}
            />
          </View>
        )}

        {!isNewUser && buffer && (
          <View style={styles.section}>
            <BufferBankCard
              balance={buffer.balance}
              capacity={buffer.capacity}
              lastTransaction={buffer.transactions?.[0] || null}
            />
          </View>
        )}

        {!isNewUser && weakness && (
          <View style={styles.section}>
            <WeaknessRadarCard data={weakness} />
          </View>
        )}

        {gamification && (
          <View style={styles.section}>
            <XPProgressCard profile={gamification} />
          </View>
        )}

        {caStats && (
          <View style={styles.section}>
            <CADashboardCard stats={caStats} />
          </View>
        )}

        {!isNewUser && (
          <TouchableOpacity
            style={styles.simulatorButton}
            onPress={() => router.push('/simulator')}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.simulatorTitle}>What If Simulator</Text>
              <Text style={styles.simulatorSubtitle}>Project hypothetical scenarios</Text>
            </View>
            <Text style={styles.simulatorArrow}>&rsaquo;</Text>
          </TouchableOpacity>
        )}

        {!isNewUser && confidence && (
          <View style={styles.section}>
            <View style={styles.confCard}>
              <Text style={styles.sectionTitle}>Revision Health</Text>
              <View style={styles.confRow}>
                {(['fresh', 'fading', 'stale', 'decayed'] as ConfidenceStatus[]).map((status) => {
                  const count = confidence.distribution[status] || 0;
                  const colors: Record<ConfidenceStatus, string> = {
                    fresh: theme.colors.success,
                    fading: theme.colors.warning,
                    stale: theme.colors.orange,
                    decayed: theme.colors.error,
                  };
                  const friendlyLabels: Record<ConfidenceStatus, string> = {
                    fresh: 'Strong',
                    fading: 'Needs review',
                    stale: 'Rusty',
                    decayed: 'Forgotten',
                  };
                  return (
                    <View key={status} style={styles.confItem}>
                      <Text style={[styles.confCount, { color: colors[status] }]}>{count}</Text>
                      <Text style={styles.confLabel}>{friendlyLabels[status]}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {stressLoading && !stress && (
          <View style={styles.loadingSection}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        )}

        <View style={{ height: theme.spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const createStyles = (theme: Theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, padding: theme.spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  greeting: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  planPreview: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  viewAll: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  planItemName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  completed: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  planItemMeta: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  confCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  confRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.sm,
  },
  confItem: { alignItems: 'center' },
  confCount: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
  },
  confLabel: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    textTransform: 'capitalize',
  },
  countdownBar: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  countdownNumber: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  countdownLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  examModeToggle: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  examModeBtn: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  examModeBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  examModeBtnText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  examModeBtnTextActive: {
    color: theme.colors.background,
  },
  simulatorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  simulatorTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.text,
  },
  simulatorSubtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  simulatorArrow: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.sm,
  },
  loadingSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
});
