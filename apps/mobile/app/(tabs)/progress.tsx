import React, {  useState , useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import { useSyllabusProgress } from '../../hooks/useSyllabus';
import { useVelocity, useVelocityHistory, useBuffer } from '../../hooks/useVelocity';
import { METRIC_LABELS, METRIC_TOOLTIPS, humanizeVelocity, humanizeBuffer } from '../../lib/labelMap';
import { useStress } from '../../hooks/useStress';
import { ProgressRing } from '../../components/progress/ProgressRing';
import { SubjectProgressGrid } from '../../components/progress/SubjectProgressGrid';
import { HistoryChart } from '../../components/progress/HistoryChart';
import { WeeklyReviewCard } from '../../components/weekly/WeeklyReviewCard';
import { BenchmarkScoreCard } from '../../components/benchmark/BenchmarkScoreCard';
import { useWeeklyReview } from '../../hooks/useWeeklyReview';
import { useBenchmark } from '../../hooks/useBenchmark';
import { useMockAnalytics } from '../../hooks/useMockTest';
import { MockSummaryCard } from '../../components/mock/MockSummaryCard';
import { MockScoreTrendChart } from '../../components/mock/MockScoreTrendChart';
import { SubjectAccuracyGrid } from '../../components/mock/SubjectAccuracyGrid';
import { WeakestTopicsAlert } from '../../components/mock/WeakestTopicsAlert';
import { MockEntrySheet } from '../../components/mock/MockEntrySheet';
import { useCAStats, useCASubjectGaps } from '../../hooks/useCurrentAffairs';
import { CAStatsCard } from '../../components/ca/CAStatsCard';
import { WarmEmptyState } from '../../components/common/WarmEmptyState';
import { DeepAnalysisCard } from '../../components/mock/DeepAnalysisCard';
import { AnswerStatsCard } from '../../components/answer/AnswerStatsCard';
import { PeerComparisonCard } from '../../components/benchmark/PeerComparisonCard';
import { useUser } from '../../context/UserContext';

export default function ProgressScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data: subjects, isLoading: syllabusLoading } = useSyllabusProgress();
  const { data: velocity } = useVelocity();
  const { data: velocityHistory } = useVelocityHistory(30);
  const { data: buffer } = useBuffer();
  const { data: stress } = useStress();
  const { data: weeklyReview } = useWeeklyReview();
  const { data: benchmark } = useBenchmark();
  const { data: mockAnalytics } = useMockAnalytics();
  const { data: caStats } = useCAStats();
  const { data: caGaps } = useCASubjectGaps();
  const { daysUsed, isVeteran } = useUser();
  const [showMockEntry, setShowMockEntry] = useState(false);

  // Calculate overall progress
  let totalGravity = 0;
  let completedGravity = 0;

  for (const subject of subjects || []) {
    if (subject.progress) {
      totalGravity += subject.progress.total_topics;
      completedGravity += subject.progress.completed_topics;
    }
  }

  const overallPct = totalGravity > 0 ? (completedGravity / totalGravity) * 100 : 0;
  const weightedPct = (velocity?.weighted_completion_pct || 0) * 100;

  // Fresher early return: simplified view for first 3 days
  if (daysUsed < 3 && !isVeteran && !syllabusLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.container}>
          <Text style={styles.title}>Progress</Text>
          <View style={styles.ringRow}>
            <View style={styles.ringItem}>
              <ProgressRing percentage={overallPct} size={80} strokeWidth={5} label="Topics" />
              <Text style={styles.ringLabel}>Unweighted</Text>
            </View>
            <View style={styles.ringItem}>
              <ProgressRing
                percentage={weightedPct}
                size={80}
                strokeWidth={5}
                color={theme.colors.success}
                label={METRIC_LABELS.gravity}
              />
              <Text style={styles.ringLabel}>Weighted</Text>
            </View>
          </View>
          <WarmEmptyState
            title="Analytics unlocking soon"
            message="Keep studying for a few days — detailed insights, charts, and mock analysis will appear here as you build history."
          />
          <View style={{ height: theme.spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (syllabusLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Prepare chart data
  const velocityChartData = (velocityHistory || []).map((v) => ({
    date: v.snapshot_date,
    value: v.velocity_ratio || 0,
  }));

  const stressChartData = (stress?.history || []).map((s) => ({
    date: s.date,
    value: s.score,
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Progress</Text>

        <View style={styles.ringRow}>
          <View style={styles.ringItem}>
            <ProgressRing percentage={overallPct} size={80} strokeWidth={5} label="Topics" />
            <Text style={styles.ringLabel}>Unweighted</Text>
          </View>
          <View style={styles.ringItem}>
            <ProgressRing
              percentage={weightedPct}
              size={80}
              strokeWidth={5}
              color={theme.colors.success}
              label={METRIC_LABELS.gravity}
            />
            <Text style={styles.ringLabel}>Weighted</Text>
          </View>
        </View>

        {velocity && (
          <View style={styles.statsRow}>
            <StatBox label={METRIC_LABELS.velocity} value={`${velocity.velocity_ratio.toFixed(2)}x`} sublabel={humanizeVelocity(velocity.velocity_ratio)} tooltip={METRIC_TOOLTIPS.velocity} />
            <StatBox label={METRIC_LABELS.buffer} value={`${(buffer?.balance || 0).toFixed(1)}d`} sublabel={humanizeBuffer(buffer?.balance || 0)} tooltip={METRIC_TOOLTIPS.buffer} />
            <StatBox label={METRIC_LABELS.streak} value={`${velocity.streak?.current_count || 0}d`} tooltip={METRIC_TOOLTIPS.streak} />
          </View>
        )}

        {benchmark && (
          <View style={styles.section}>
            <BenchmarkScoreCard profile={benchmark} />
          </View>
        )}

        {daysUsed >= 14 && (
          <View style={styles.section}>
            <PeerComparisonCard />
          </View>
        )}

        {weeklyReview && (
          <View style={styles.section}>
            <WeeklyReviewCard review={weeklyReview} />
          </View>
        )}

        {velocityChartData.length > 1 && (
          <View style={styles.section}>
            <HistoryChart data={velocityChartData} title="Study Pace (30d)" color={theme.colors.primary} />
          </View>
        )}

        {stressChartData.length > 1 && (
          <View style={styles.section}>
            <HistoryChart data={stressChartData} title="Study Health (7d)" color={theme.colors.success} />
          </View>
        )}

        {subjects && subjects.length > 0 && (
          <View style={styles.section}>
            <SubjectProgressGrid subjects={subjects} />
          </View>
        )}

        {caStats && (
          <View style={styles.section}>
            <CAStatsCard stats={caStats} gaps={caGaps} />
          </View>
        )}

        {/* Mock Tests Section */}
        <View style={styles.mockHeader}>
          <Text style={styles.mockTitle}>Mock Tests</Text>
          <TouchableOpacity style={styles.recordBtn} onPress={() => setShowMockEntry(true)}>
            <Text style={styles.recordBtnText}>+ Record Mock</Text>
          </TouchableOpacity>
        </View>

        {mockAnalytics && mockAnalytics.tests_count > 0 ? (
          <>
            <View style={styles.section}>
              <MockSummaryCard analytics={mockAnalytics} />
            </View>
            {mockAnalytics.score_trend.length > 0 && (
              <View style={styles.section}>
                <MockScoreTrendChart data={mockAnalytics.score_trend} />
              </View>
            )}
            {mockAnalytics.subject_accuracy.length > 0 && (
              <View style={styles.section}>
                <SubjectAccuracyGrid data={mockAnalytics.subject_accuracy} />
              </View>
            )}
            {mockAnalytics.weakest_topics.length > 0 && (
              <View style={styles.section}>
                <WeakestTopicsAlert topics={mockAnalytics.weakest_topics} />
              </View>
            )}
            {mockAnalytics.deep_analysis && (
              <View style={styles.section}>
                <DeepAnalysisCard analysis={mockAnalytics.deep_analysis} />
              </View>
            )}
          </>
        ) : (
          <WarmEmptyState
            title="Ready for your first mock?"
            message="Record a mock test to unlock score trends, subject accuracy, and weakness analysis."
            actionLabel="Record Mock"
            onAction={() => setShowMockEntry(true)}
          />
        )}

        <MockEntrySheet visible={showMockEntry} onClose={() => setShowMockEntry(false)} />

        {/* Answer Writing Section */}
        <View style={styles.section}>
          <AnswerStatsCard />
        </View>

        <View style={{ height: theme.spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, sublabel, tooltip }: { label: string; value: string; sublabel?: string; tooltip?: string }) {
  const { theme } = useTheme();
  const sStyles = useMemo(() => createStatStyles(theme), [theme]);
  const [showTip, setShowTip] = useState(false);
  return (
    <View style={sStyles.box}>
      <Text style={sStyles.value}>{value}</Text>
      <View style={sStyles.labelRow}>
        <Text style={sStyles.label}>{label}</Text>
        {tooltip ? (
          <TouchableOpacity onPress={() => setShowTip(!showTip)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <View style={sStyles.helpCircle}>
              <Text style={sStyles.helpText}>?</Text>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
      {sublabel ? <Text style={sStyles.sublabel}>{sublabel}</Text> : null}
      {showTip && tooltip ? <Text style={sStyles.tooltip}>{tooltip}</Text> : null}
    </View>
  );
}

const createStatStyles = (theme: Theme) => StyleSheet.create({
  box: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  value: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    color: theme.colors.text,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  label: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  helpCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.textMuted + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  sublabel: {
    fontSize: theme.fontSize.xs - 1,
    color: theme.colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  tooltip: {
    fontSize: theme.fontSize.xs - 1,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 14,
  },
});

const createStyles = (theme: Theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, padding: theme.spacing.lg },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  ringRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
  },
  ringItem: { alignItems: 'center' },
  ringLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  mockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  mockTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    color: theme.colors.text,
  },
  recordBtn: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  recordBtnText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  emptyMock: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  emptyMockText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  emptyMockSub: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
});
