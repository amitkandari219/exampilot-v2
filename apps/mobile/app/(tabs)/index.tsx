import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useUser } from '../../context/UserContext';
import { useProfile } from '../../hooks/useProfile';
import { useDailyPlan } from '../../hooks/usePlanner';
import { useGamification } from '../../hooks/useGamification';
import { useRevisionsDue } from '../../hooks/useFSRS';
import { useBenchmark } from '../../hooks/useBenchmark';
import { useQuickLogs } from '../../hooks/useQuickLog';
import { V4Card } from '../../components/v4/V4Card';
import { V4Pill } from '../../components/v4/V4Pill';
import { V4MetricBox } from '../../components/v4/V4MetricBox';
import { V4Bar } from '../../components/v4/V4Bar';
import { V4Tip } from '../../components/v4/V4Tip';
import { isScreenUnlocked, isDashboardSectionUnlocked } from '../../lib/disclosure';
import { ActivityFeed } from '../../components/dashboard/ActivityFeed';
import { WelcomeBackBanner } from '../../components/dashboard/WelcomeBackBanner';
import { GuidedJourneyCard } from '../../components/dashboard/GuidedJourneyCard';
import { useVelocity, useBuffer } from '../../hooks/useVelocity';
import { useAnswerStats } from '../../hooks/useAnswerWriting';
import { useAlerts } from '../../hooks/useAlerts';
import { AlertBanner } from '../../components/dashboard/AlertBanner';
import { METRIC_LABELS, METRIC_TOOLTIPS } from '../../lib/labelMap';
import { toDateString } from '../../lib/dateUtils';

export default function DashboardScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const { user } = useAuth();
  const { daysUsed, isVeteran, examMode } = useUser();
  const { data: profile } = useProfile();
  const today = toDateString(new Date());
  const { data: plan, isLoading: planLoading } = useDailyPlan(today);
  const { data: gamification } = useGamification();
  const { data: revisionsDue } = useRevisionsDue(today);
  const { data: benchmark } = useBenchmark();
  const { data: quickLogs } = useQuickLogs(today);
  const { data: velocity } = useVelocity();
  const { data: buffer } = useBuffer();
  const { data: answerStats } = useAnswerStats();
  const { data: alerts } = useAlerts();
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fadeAnim]);

  // Detect missed days: streak is 0 and user has been around > 1 day
  const missedDays = useMemo(() => {
    if (!velocity?.streak || daysUsed <= 1) return 0;
    if (velocity.streak.current_count === 0) return 1;
    return 0;
  }, [velocity, daysUsed]);

  useEffect(() => {
    if (missedDays <= 0) return;
    const key = 'welcome_back_dismissed_' + toDateString(new Date());
    AsyncStorage.getItem(key).then(val => {
      if (val !== 'true') setShowWelcomeBack(true);
    });
  }, [missedDays]);

  const greeting = getGreeting();
  const isMains = examMode === 'mains';

  // Calculate days until exam (use prelims_date in prelims mode, exam_date otherwise)
  const daysUntilExam = useMemo(() => {
    const targetDate = (examMode === 'prelims' && profile?.prelims_date)
      ? profile.prelims_date : profile?.exam_date;
    if (!targetDate) return null;
    const diff = Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86400000);
    return diff > 0 ? diff : null;
  }, [profile?.exam_date, profile?.prelims_date, examMode]);

  // Find first incomplete plan item for hero card
  const firstIncomplete = useMemo(() => {
    if (!plan?.items) return null;
    return plan.items.find(i => i.status !== 'completed') || null;
  }, [plan]);

  // Calculate metrics
  const hoursToday = useMemo(() => {
    if (!plan?.items) return 0;
    const planMinutes = plan.items
      .filter(i => i.status === 'completed')
      .reduce((sum, i) => sum + (i.estimated_hours || 0) * 60, 0);
    const loggedMinutes = (quickLogs || []).reduce((sum: number, l: any) => sum + (l.hours || 0) * 60, 0);
    return ((planMinutes + loggedMinutes) / 60);
  }, [plan, quickLogs]);

  const tasksDone = useMemo(() => {
    if (!plan?.items) return { done: 0, total: 0 };
    const done = plan.items.filter(i => i.status === 'completed').length;
    return { done, total: plan.items.length };
  }, [plan]);

  const revisionCount = typeof revisionsDue === 'object' && revisionsDue !== null && 'count' in revisionsDue
    ? (revisionsDue as any).count || 0
    : Array.isArray(revisionsDue) ? (revisionsDue as any[]).length : 0;

  // GamificationProfile doesn't include streak yet — use 0 until backend adds it
  const currentStreak = (gamification as any)?.current_streak ?? 0;
  const readinessScore = benchmark?.composite_score || 0;

  // Backlog count (deferred items)
  const backlogCount = useMemo(() => {
    if (!plan?.items) return 0;
    return plan.items.filter(i => i.status === 'deferred').length;
  }, [plan]);

  // Navigation cards with progressive disclosure
  const navItems = useMemo(() => {
    const items = [
      { id: 'revision' as const, label: 'Revision Hub', icon: '↻', route: '/revision' },
      { id: 'mocks' as const, label: 'Mock Analysis', icon: 'M', route: '/mocks' },
      { id: 'weeklyReview' as const, label: 'Weekly Review', icon: 'W', route: '/weeklyreview' },
      { id: 'lowDay' as const, label: 'Low Day Mode', icon: '~', route: '/lowday' },
      { id: 'ranker' as const, label: 'Ranker Mode', icon: 'R', route: '/ranker' },
      { id: 'fullSyllabus' as const, label: 'Full Syllabus', icon: 'S', route: '/fullsyllabus' },
    ];
    return items.filter(item => isScreenUnlocked(item.id, daysUsed, isVeteran));
  }, [daysUsed, isVeteran]);

  if (planLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingSection}>
          <ActivityIndicator color={theme.colors.accent} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.ScrollView style={[styles.container, { opacity: fadeAnim }]} showsVerticalScrollIndicator={false}>

        {/* 2.1.1 — Header Row */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingSmall}>{greeting}</Text>
            <Text style={styles.countdown}>
              {examMode === 'mains' ? 'Mains' : examMode === 'post_prelims' ? 'Mains' : 'Prelims'} in{' '}
              <Text style={{ color: theme.colors.accent }}>
                {daysUntilExam ?? '—'} days
              </Text>
            </Text>
          </View>
          <V4Pill
            label={isMains ? 'MAINS' : 'PRELIMS'}
            variant={isMains ? 'purple' : 'accent'}
          />
        </View>

        {/* Welcome-back banner for returning users */}
        {showWelcomeBack && missedDays > 0 && (
          <WelcomeBackBanner
            missedDays={missedDays}
            bufferBalance={buffer?.balance || 0}
            onDismiss={() => setShowWelcomeBack(false)}
          />
        )}

        {/* 2.1.2 — Guided Journey Card (day 1-3 only) */}
        {!isVeteran && daysUsed <= 3 && (
          <GuidedJourneyCard day={Math.max(daysUsed, 1)} />
        )}

        {/* Smart Alerts */}
        {isDashboardSectionUnlocked('activityFeed', daysUsed, isVeteran) && alerts?.[0] && (
          <AlertBanner alert={alerts[0]} />
        )}

        {/* 2.1.3 — Hero START HERE Card */}
        {firstIncomplete && (
          <TouchableOpacity
            style={styles.heroCard}
            activeOpacity={0.85}
            onPress={() => {
              router.push({
                pathname: '/(tabs)/planner',
                params: { autoStartItemId: firstIncomplete.id },
              });
            }}
          >
            <Text style={styles.heroLabel}>START HERE</Text>
            <Text style={styles.heroTitle}>
              {firstIncomplete.subject_name || 'Subject'} — {firstIncomplete.topic?.name || 'Topic'}
            </Text>
            <Text style={styles.heroMeta}>
              {firstIncomplete.type === 'new' ? 'New topic' : firstIncomplete.type === 'revision' ? 'Revision' : firstIncomplete.type.replace('_', ' ')} · ~{Math.round((firstIncomplete.estimated_hours || 1) * 60)} min
            </Text>
            <V4Tip
              message="PYQ = Previous Year Questions. Topics asked more often in past exams are prioritized."
              variant="info"
            />
            <View style={styles.heroButtonContainer}>
              <View style={styles.heroButton}>
                <Text style={styles.heroButtonText}>▶ Start Studying</Text>
              </View>
            </View>
            <Text style={styles.heroHint}>→ Opens Planner & starts timer</Text>
          </TouchableOpacity>
        )}

        {/* Full Study Plan link */}
        {firstIncomplete && (
          <TouchableOpacity onPress={() => router.push('/study-plan' as any)} activeOpacity={0.7}>
            <Text style={styles.fullPlanLink}>How will I cover everything? →</Text>
          </TouchableOpacity>
        )}

        {/* Summary line for day 1-2 freshers when metrics hidden */}
        {!isDashboardSectionUnlocked('metricRow', daysUsed, isVeteran) && (
          <Text style={styles.summaryLine}>
            Just focus on the task above. Metrics will appear as you build history.
          </Text>
        )}

        {/* 2.1.4 — 5-Metric Row */}
        {isDashboardSectionUnlocked('metricRow', daysUsed, isVeteran) && <View style={styles.metricRow}>
          <V4MetricBox
            value={hoursToday.toFixed(1)}
            label="hrs today"
            sublabel={`of ${plan?.available_hours || 6} target`}
            valueColor={theme.colors.accent}
            tooltip={METRIC_TOOLTIPS.hoursToday}
          />
          <V4MetricBox
            value={`${tasksDone.done}/${tasksDone.total}`}
            label="tasks done"
            valueColor={theme.colors.green}
            tooltip={METRIC_TOOLTIPS.tasksDone}
          />
          {isMains ? (
            <V4MetricBox
              value={answerStats?.today_count ?? 0}
              label="answers today"
              sublabel={answerStats?.total_count ? `${answerStats.total_count} total` : undefined}
              valueColor={theme.colors.purple}
              tooltip={METRIC_TOOLTIPS.answersToday}
            />
          ) : (
            <V4MetricBox
              value={currentStreak}
              label="day streak"
              valueColor={theme.colors.purple}
              tooltip={METRIC_TOOLTIPS.streak}
            />
          )}
        </View>}

        {isDashboardSectionUnlocked('metricRow', daysUsed, isVeteran) && <View style={[styles.metricRow, styles.section]}>
          <V4MetricBox
            value={revisionCount}
            label="revisions due"
            valueColor={theme.colors.warn}
            tooltip={METRIC_TOOLTIPS.revisionsDue}
          />
          <V4MetricBox
            value={readinessScore || '—'}
            label="momentum"
            sublabel="7-day score"
            valueColor={theme.colors.accent}
            tooltip={METRIC_TOOLTIPS.momentum}
          />
        </View>}
        {isDashboardSectionUnlocked('metricRow', daysUsed, isVeteran) && revisionCount > 0 && (
          <V4Tip
            message="Topics starting to fade from memory. A quick 20-min revision brings them back."
            variant="info"
            dismissible
          />
        )}

        {/* 2.1.5 — Prelims/Mains Split Bar (mains only) */}
        {isDashboardSectionUnlocked('splitBar', daysUsed, isVeteran) && isMains && (
          <V4Card bordered style={styles.section}>
            <Text style={styles.splitTitle}>This Week's Focus Split</Text>
            <View style={styles.splitBar}>
              <View style={[styles.splitSegment, { flex: 65, backgroundColor: theme.colors.accent }]}>
                <Text style={styles.splitSegmentText}>Prelims 65%</Text>
              </View>
              <View style={[styles.splitSegment, { flex: 35, backgroundColor: theme.colors.purple }]}>
                <Text style={styles.splitSegmentText}>Mains 35%</Text>
              </View>
            </View>
            <Text style={styles.splitCaption}>
              Answer writing: {answerStats?.total_count ?? 0} logged · Avg score: {answerStats?.avg_self_score ? answerStats.avg_self_score.toFixed(1) : '—'}/10
            </Text>
          </V4Card>
        )}

        {/* 2.1.6 — Exam Readiness Card */}
        {isDashboardSectionUnlocked('examReadiness', daysUsed, isVeteran) && (
          <V4Card bordered style={styles.section}>
            <View style={styles.readinessHeader}>
              <Text style={styles.readinessTitle}>Exam Readiness</Text>
              <Text style={styles.readinessScore}>
                {readinessScore || '—'}
                <Text style={styles.readinessMax}>/100</Text>
              </Text>
            </View>
            <View style={styles.barGroup}>
              <ReadinessBar label="Coverage" progress={benchmark?.components?.coverage || 0} color={theme.colors.warn} theme={theme} />
              <ReadinessBar label="Confidence" progress={benchmark?.components?.confidence || 0} color={theme.colors.accent} theme={theme} />
              <ReadinessBar label="Consistency" progress={benchmark?.components?.consistency || 0} color={theme.colors.green} theme={theme} />
              <ReadinessBar label={METRIC_LABELS.velocity} progress={benchmark?.components?.velocity || 0} color={theme.colors.purple} theme={theme} />
              <ReadinessBar label={METRIC_LABELS.weakness} progress={benchmark?.components?.weakness || 0} color={theme.colors.danger} theme={theme} />
            </View>
            <V4Tip
              message="Composite score based on coverage, confidence, consistency, speed, and weakness handling."
              dismissible
            />
          </V4Card>
        )}

        {/* Activity Feed */}
        {isDashboardSectionUnlocked('activityFeed', daysUsed, isVeteran) && <ActivityFeed />}

        {/* 2.1.7 — Backlog Card */}
        {isDashboardSectionUnlocked('backlog', daysUsed, isVeteran) && backlogCount > 0 && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/planner')}
          >
            <V4Card style={[styles.section, styles.backlogCard, {
              borderWidth: 1,
              borderColor: theme.colors.warn + '33',
              backgroundColor: theme.colors.warnDim,
            }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.backlogTitle, { color: theme.colors.warn }]}>
                  {backlogCount} item{backlogCount > 1 ? 's' : ''} rolled over
                </Text>
                <Text style={styles.backlogSub}>from yesterday — tap to adjust</Text>
              </View>
              <Text style={[styles.backlogAction, { color: theme.colors.warn }]}>Adjust →</Text>
            </V4Card>
          </TouchableOpacity>
        )}

        {/* 2.1.8 — Navigation Cards */}
        {isDashboardSectionUnlocked('navCards', daysUsed, isVeteran) && navItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.navSectionTitle}>EXPLORE</Text>
            <View style={styles.navGrid}>
              {navItems.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.navCard}
                  activeOpacity={0.7}
                  onPress={() => router.push(item.route as any)}
                >
                  <Text style={styles.navIcon}>{item.icon}</Text>
                  <Text style={styles.navLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: theme.spacing.xxl }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

function ReadinessBar({ label, progress, color, theme }: { label: string; progress: number; color: string; theme: Theme }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>{label}</Text>
        <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>{Math.round(progress)}%</Text>
      </View>
      <V4Bar progress={progress} color={color} height={6} />
    </View>
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
  section: { marginBottom: theme.spacing.md },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  greetingSmall: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  countdown: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 2,
  },

  // Welcome card
  welcomeTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  welcomeBody: {
    fontSize: 12,
    color: theme.colors.text,
    lineHeight: 19,
  },

  // Hero card
  heroCard: {
    backgroundColor: theme.colors.accentDim,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: theme.colors.accent + '33',
    padding: 22,
    marginBottom: theme.spacing.md,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.accent,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  heroMeta: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 14,
  },
  heroButtonContainer: {
    flexDirection: 'row',
  },
  heroButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  heroButtonText: {
    color: theme.colors.background,
    fontWeight: '700',
    fontSize: 14,
  },
  heroHint: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 6,
  },

  // Full plan link
  fullPlanLink: {
    fontSize: 13,
    color: theme.colors.accent,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },

  // Summary line for new users
  summaryLine: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    lineHeight: 19,
  },

  // Metrics
  metricRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },

  // Split bar
  splitTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  splitBar: {
    flexDirection: 'row',
    height: 22,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
    gap: 2,
  },
  splitSegment: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitSegmentText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.background,
  },
  splitCaption: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },

  // Readiness
  readinessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  readinessTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  readinessScore: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.accent,
  },
  readinessMax: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  barGroup: {
    marginBottom: 10,
  },

  // Backlog
  backlogCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backlogTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  backlogSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  backlogAction: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Nav cards
  navSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  navCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minWidth: '47%',
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  navIcon: {
    fontSize: 20,
    color: theme.colors.accent,
    marginBottom: 6,
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },

  // Loading
  loadingSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
});
