import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity, Alert, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import { useDailyPlan, useCompletePlanItem, useDeferPlanItem } from '../../hooks/usePlanner';
import { useQuickLogs } from '../../hooks/useQuickLog';
import { useTimer } from '../../context/TimerContext';
import { useUser } from '../../context/UserContext';
import { RecoveryBanner } from '../../components/planner/RecoveryBanner';
import { useBurnout } from '../../hooks/useBurnout';
import { V4Card } from '../../components/v4/V4Card';
import { V4Bar } from '../../components/v4/V4Bar';
import { V4Pill } from '../../components/v4/V4Pill';
import { V4Tip } from '../../components/v4/V4Tip';
import { DailyPlanItem, PlanItemType } from '../../types';
import { WarmEmptyState } from '../../components/common/WarmEmptyState';
import { ShareButton } from '../../components/common/ShareButton';
import { useVelocity } from '../../hooks/useVelocity';
import { toDateString } from '../../lib/dateUtils';
import { formatDailyPlanForShare } from '../../lib/shareFormatters';

// Color map for task type left borders and pills
const TYPE_COLORS: Record<PlanItemType, { color: string; variant: 'accent' | 'purple' | 'danger' | 'warn' }> = {
  new: { color: '#3ECFB4', variant: 'accent' },
  revision: { color: '#A78BFA', variant: 'purple' },
  decay_revision: { color: '#EF4444', variant: 'danger' },
  stretch: { color: '#F59E42', variant: 'warn' },
};

const TYPE_LABELS: Record<PlanItemType, string> = {
  new: 'NEW',
  revision: 'REVISION',
  decay_revision: 'DECAY',
  stretch: 'DAILY',
};

function CompletedLabel({ color }: { color: string }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [opacity]);
  return <Animated.Text style={{ fontSize: 11, marginTop: 4, color, opacity, fontWeight: '700' }}>Done</Animated.Text>;
}

function AnimatedStrikethrough({ children, textStyle, mutedColor }: { children: string; textStyle: object; mutedColor: string }) {
  const widthPct = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(widthPct, { toValue: 100, duration: 400, useNativeDriver: false }).start();
  }, [widthPct]);
  const animatedWidth = widthPct.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  return (
    <View style={{ position: 'relative' }}>
      <Text style={[textStyle, { color: mutedColor }]}>{children}</Text>
      <Animated.View style={{ position: 'absolute', top: '50%', left: 0, height: 1.5, width: animatedWidth, backgroundColor: mutedColor }} />
    </View>
  );
}

export default function PlannerScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const today = toDateString(new Date());
  const { autoStartItemId } = useLocalSearchParams<{ autoStartItemId?: string }>();
  const { data: plan, isLoading } = useDailyPlan(today);
  const { data: burnout } = useBurnout();
  const { data: quickLogs } = useQuickLogs(today);
  const { daysUsed } = useUser();
  const timer = useTimer();
  const router = useRouter();
  const completeMutation = useCompletePlanItem();
  const deferMutation = useDeferPlanItem();
  const { data: velocityData } = useVelocity();
  const streak = velocityData?.streak?.current_count || 0;

  // 2.2.1 — autoStartItemId: auto-start timer when navigated from dashboard hero
  useEffect(() => {
    if (autoStartItemId && plan?.items) {
      const item = plan.items.find(i => i.id === autoStartItemId);
      if (item && item.status !== 'completed' && timer.status === 'idle') {
        timer.start({
          durationMinutes: Math.round((item.estimated_hours || 1) * 60),
          planItemId: item.id,
          topicName: `${item.subject_name || 'Subject'} — ${item.topic?.name || 'Topic'}`,
        });
      }
    }
  }, [autoStartItemId, plan]);

  const handleStartTimer = (item: DailyPlanItem) => {
    timer.start({
      durationMinutes: Math.round((item.estimated_hours || 1) * 60),
      planItemId: item.id,
      topicName: `${item.subject_name || 'Subject'} — ${item.topic?.name || 'Topic'}`,
    });
  };

  // 2.2.6 — Timer stop flow
  const handleStopTimer = () => {
    const elapsedMinutes = Math.floor((timer.totalSeconds - timer.remainingSeconds) / 60);
    Alert.alert(
      'Mark as done?',
      `You studied for ${elapsedMinutes} minutes.`,
      [
        { text: 'No', onPress: () => timer.pause(), style: 'cancel' },
        {
          text: 'Yes', onPress: () => {
            if (timer.planItemId) {
              completeMutation.mutate({ itemId: timer.planItemId, actualHours: elapsedMinutes / 60 });
            }
            timer.stop();
          },
        },
      ]
    );
  };

  // 2.2.7 — Time's up: mark done flow
  const handleTimesUpDone = () => {
    const elapsedMinutes = Math.floor((timer.totalSeconds - timer.remainingSeconds) / 60);
    if (timer.planItemId) {
      completeMutation.mutate({ itemId: timer.planItemId, actualHours: elapsedMinutes / 60 });
    }
    timer.stop();
  };

  const handleComplete = (itemId: string) => {
    const item = plan?.items?.find(i => i.id === itemId);
    const est = item?.estimated_hours || 1;
    const estMin = Math.round(est * 60);
    Alert.alert('How long did you study?', `Estimated: ${estMin} min`, [
      { text: `~${estMin} min`, onPress: () => completeMutation.mutate({ itemId, actualHours: est }) },
      { text: `~${Math.round(estMin / 2)} min`, onPress: () => completeMutation.mutate({ itemId, actualHours: est * 0.5 }) },
      { text: `~${Math.round(estMin * 1.5)} min`, onPress: () => completeMutation.mutate({ itemId, actualHours: est * 1.5 }) },
    ]);
  };

  const handleDefer = (itemId: string) => {
    deferMutation.mutate(itemId);
  };

  const completedCount = plan?.items?.filter(i => i.status === 'completed').length || 0;
  const totalCount = plan?.items?.length || 0;
  const allDone = totalCount > 0 && completedCount === totalCount;

  // Celebration bounce animation
  const celebrationScale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (allDone) {
      Animated.spring(celebrationScale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }).start();
    } else {
      celebrationScale.setValue(0);
    }
  }, [allDone, celebrationScale]);

  // 2.2.2 — Capacity calculations
  const totalPlannedMinutes = (plan?.items || []).reduce((s, i) => s + (i.estimated_hours || 0) * 60, 0);
  const targetMinutes = (plan?.available_hours || 6) * 60;
  const capacityPct = targetMinutes > 0 ? Math.round((totalPlannedMinutes / targetMinutes) * 100) : 0;
  const bufferMinutes = targetMinutes - totalPlannedMinutes;
  const isOverplanned = totalPlannedMinutes > targetMinutes + 60; // > target + 1hr

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  const renderTaskCard = ({ item }: { item: DailyPlanItem }) => {
    const isCompleted = item.status === 'completed';
    const typeConfig = TYPE_COLORS[item.type] || TYPE_COLORS.new;
    const typeLabel = TYPE_LABELS[item.type] || 'TASK';
    const isActiveTimer = timer.planItemId === item.id && timer.status !== 'idle';
    const isTimerRunning = isActiveTimer && timer.status === 'running';
    const isTimerPaused = isActiveTimer && timer.status === 'paused';
    const isTimeUp = isActiveTimer && timer.status === 'timeup';

    const remainingMin = Math.floor(timer.remainingSeconds / 60);
    const remainingSec = timer.remainingSeconds % 60;
    const elapsedTotal = timer.totalSeconds - timer.remainingSeconds;
    const elapsedMin = Math.floor(elapsedTotal / 60);
    const elapsedSec = Math.floor(elapsedTotal % 60);

    return (
      <View style={[
        styles.taskCard,
        { borderLeftWidth: 3, borderLeftColor: isCompleted ? theme.colors.textMuted : typeConfig.color },
        isCompleted && { opacity: 0.5 },
      ]}>
        <View style={{ flex: 1 }}>
          {/* Tag + Subject row */}
          <View style={styles.taskTagRow}>
            <V4Pill
              label={typeLabel}
              variant={isCompleted ? 'muted' : typeConfig.variant}
            />
            <Text style={[styles.taskSubject, isCompleted && styles.textDimmed]}>
              {item.subject_name || 'Subject'}
            </Text>
          </View>

          {/* Topic name */}
          {isCompleted ? (
            <AnimatedStrikethrough textStyle={styles.taskTopic} mutedColor={theme.colors.textMuted}>{item.topic?.name || 'Topic'}</AnimatedStrikethrough>
          ) : (
            <Text style={styles.taskTopic}>{item.topic?.name || 'Topic'}</Text>
          )}

          {/* Reason text */}
          {item.reason && !isCompleted && (
            <Text style={styles.reasonText}>{item.reason}</Text>
          )}

          {/* 2.2.4 — DECAY tooltip */}
          {item.type === 'decay_revision' && !isCompleted && (
            <V4Tip
              message="This topic is fading from memory. A quick revision now saves a full re-study later."
              variant="warn"
              dismissible
            />
          )}

          {/* 2.2.7 — Time's up nudge */}
          {isTimeUp && (
            <View style={styles.timesUpContainer}>
              <Text style={[styles.timesUpText, { color: theme.colors.warn }]}>
                Time's up! Mark done or keep going?
              </Text>
              <View style={styles.timesUpButtons}>
                <TouchableOpacity
                  style={[styles.timesUpBtn, { backgroundColor: theme.colors.greenDim }]}
                  onPress={handleTimesUpDone}
                >
                  <Text style={{ color: theme.colors.green, fontWeight: '700', fontSize: 12 }}>✓ Done</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.timesUpBtn, { backgroundColor: theme.colors.accentDim }]}
                  onPress={() => timer.resume()}
                >
                  <Text style={{ color: theme.colors.accent, fontWeight: '700', fontSize: 12 }}>Keep going</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Right side: timer or duration */}
        <View style={styles.taskRight}>
          {isActiveTimer && !isCompleted && !isTimeUp ? (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.timerDisplay, {
                color: isTimerPaused ? theme.colors.warn : theme.colors.accent,
              }]}>
                {elapsedMin}:{String(elapsedSec).padStart(2, '0')}
              </Text>
              <Text style={styles.timerRemaining}>
                {remainingMin} min left
              </Text>
              <View style={styles.timerControls}>
                {isTimerRunning && (
                  <TouchableOpacity
                    style={[styles.timerBtn, { backgroundColor: theme.colors.warnDim }]}
                    onPress={() => timer.pause()}
                  >
                    <Text style={{ color: theme.colors.warn, fontSize: 10 }}>⏸</Text>
                  </TouchableOpacity>
                )}
                {isTimerPaused && (
                  <TouchableOpacity
                    style={[styles.timerBtn, { backgroundColor: theme.colors.accentDim }]}
                    onPress={() => timer.resume()}
                  >
                    <Text style={{ color: theme.colors.accent, fontSize: 10 }}>▶</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.timerBtn, { backgroundColor: theme.colors.dangerDim }]}
                  onPress={handleStopTimer}
                >
                  <Text style={{ color: theme.colors.danger, fontSize: 10 }}>■</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={[styles.taskDuration, isCompleted && styles.textDimmed]}>
                {Math.round((item.estimated_hours || 1) * 60)} min
              </Text>
              {!isCompleted && !isTimeUp && (
                <TouchableOpacity onPress={() => handleStartTimer(item)}>
                  <Text style={styles.startBtn}>▶ Start</Text>
                </TouchableOpacity>
              )}
              {isCompleted && (
                <CompletedLabel color={theme.colors.green} />
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        ListHeaderComponent={
          <>
            {/* 2.2.2 — Capacity Card */}
            {plan && (
              <V4Card bordered style={styles.capacityCard}>
                <View style={styles.capacityHeader}>
                  <Text style={styles.capacityTitle}>Today's Plan</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={styles.capacityHours}>
                      {(totalPlannedMinutes / 60).toFixed(1)} hrs / {plan.available_hours || 6} hrs
                    </Text>
                    <ShareButton getText={() => formatDailyPlanForShare(plan)} />
                  </View>
                </View>
                <V4Bar
                  progress={Math.min(capacityPct, 100)}
                  color={isOverplanned ? theme.colors.danger : theme.colors.accent}
                />
                <Text style={[styles.bufferText, isOverplanned && { color: theme.colors.danger }]}>
                  {bufferMinutes > 0
                    ? `${(bufferMinutes / 60).toFixed(1)} hrs buffer remaining`
                    : `Overplanned by ${(Math.abs(bufferMinutes) / 60).toFixed(1)} hrs`}
                </Text>
              </V4Card>
            )}

            {plan && (
              <TouchableOpacity onPress={() => router.push('/study-plan' as any)} activeOpacity={0.7}>
                <Text style={styles.fullPlanLink}>View Full Study Plan →</Text>
              </TouchableOpacity>
            )}

            {burnout?.in_recovery && burnout.recovery_day && (
              <RecoveryBanner day={burnout.recovery_day} totalDays={5} />
            )}
            {plan?.is_light_day && !burnout?.in_recovery && (
              <View style={styles.lightDayBanner}>
                <Text style={styles.lightDayText}>Light day — calibrated for sustainable progress</Text>
              </View>
            )}
          </>
        }
        data={plan?.items || []}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskCard}
        ListEmptyComponent={
          <WarmEmptyState
            title="Your study plan is being prepared..."
            message="Check back in a moment — we're crafting today's optimal study schedule."
          />
        }
        ListFooterComponent={
          <>
            {/* 2.2.5 — Quick-logged sessions */}
            {quickLogs && quickLogs.length > 0 && quickLogs.map(log => (
              <View key={log.id} style={[styles.taskCard, { borderLeftWidth: 3, borderLeftColor: theme.colors.green, opacity: 0.7 }]}>
                <View style={{ flex: 1 }}>
                  <View style={styles.taskTagRow}>
                    <V4Pill label="LOGGED" variant="green" />
                    <Text style={styles.taskSubject}>{log.notes || 'Quick Log'}</Text>
                  </View>
                  <Text style={styles.taskTopic}>
                    Logged via Quick Log · {Math.round(log.hours * 60)} min
                  </Text>
                  <Text style={[styles.loggedConfirm, { color: theme.colors.green }]}>
                    ✓ Counts toward today's hours and updates subject coverage
                  </Text>
                </View>
              </View>
            ))}

            {/* Streak-aware celebration */}
            {allDone && (
              <Animated.View style={[styles.celebration, { transform: [{ scale: celebrationScale }] }]}>
                <Text style={styles.celebrationText}>
                  {streak > 3
                    ? `${streak} days in a row! Strong momentum.`
                    : streak === 1
                    ? 'First day conquered! The hardest part is starting.'
                    : 'All done for today!'}
                </Text>
                <Text style={styles.celebrationSub}>
                  {streak > 7
                    ? 'Incredible consistency — keep this engine running.'
                    : streak > 3
                    ? 'Your streak is building real momentum.'
                    : 'Great work. Rest well.'}
                </Text>
              </Animated.View>
            )}

            {/* 2.2.8 — Progress bar */}
            {totalCount > 0 && (
              <View style={styles.progressFooter}>
                <View style={{ flex: 1 }}>
                  <V4Bar progress={Math.round((completedCount / totalCount) * 100)} color={theme.colors.green} />
                </View>
                <Text style={styles.progressLabel}>
                  {completedCount}/{totalCount}
                </Text>
              </View>
            )}

            <View style={{ height: 80 }} />
          </>
        }
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  list: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Capacity card
  capacityCard: { marginBottom: theme.spacing.md, marginTop: theme.spacing.md },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  capacityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  capacityHours: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  bufferText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 6,
  },
  fullPlanLink: {
    fontSize: 13,
    color: theme.colors.accent,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },

  // Light day
  lightDayBanner: {
    backgroundColor: '#1E3A2F',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  lightDayText: {
    color: theme.colors.success,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Task card
  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  taskTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  taskSubject: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  taskTopic: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  reasonText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
    fontStyle: 'italic',
  },
  textDimmed: {
    color: theme.colors.textMuted,
  },
  taskRight: {
    alignItems: 'flex-end',
    minWidth: 65,
    marginLeft: theme.spacing.sm,
  },
  taskDuration: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  startBtn: {
    fontSize: 11,
    color: theme.colors.accent,
    marginTop: 4,
  },
  doneLabel: {
    fontSize: 11,
    marginTop: 4,
  },

  // Timer
  timerDisplay: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  timerRemaining: {
    fontSize: 9,
    color: theme.colors.textSecondary,
  },
  timerControls: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  timerBtn: {
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },

  // Time's up
  timesUpContainer: {
    marginTop: 8,
  },
  timesUpText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  timesUpButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timesUpBtn: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  // Logged card
  loggedConfirm: {
    fontSize: 10,
    marginTop: 4,
  },

  // Empty
  empty: { alignItems: 'center', paddingVertical: theme.spacing.xxl },
  emptyText: { fontSize: theme.fontSize.lg, color: theme.colors.textMuted, fontWeight: '600' },
  emptySubtext: { fontSize: theme.fontSize.sm, color: theme.colors.textMuted, marginTop: theme.spacing.xs },

  // Celebration
  celebration: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  celebrationText: { fontSize: theme.fontSize.xl, fontWeight: '800', color: theme.colors.success },
  celebrationSub: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },

  // Progress
  progressFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.green,
  },
});
