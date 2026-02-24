import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { theme } from '../../constants/theme';
import { useSyllabusProgress } from '../../hooks/useSyllabus';
import { useVelocity, useVelocityHistory, useBuffer } from '../../hooks/useVelocity';
import { useStress } from '../../hooks/useStress';
import { ProgressRing } from '../../components/progress/ProgressRing';
import { SubjectProgressGrid } from '../../components/progress/SubjectProgressGrid';
import { HistoryChart } from '../../components/progress/HistoryChart';
import { WeeklyReviewCard } from '../../components/weekly/WeeklyReviewCard';
import { BenchmarkScoreCard } from '../../components/benchmark/BenchmarkScoreCard';
import { useWeeklyReview } from '../../hooks/useWeeklyReview';
import { useBenchmark } from '../../hooks/useBenchmark';

export default function ProgressScreen() {
  const { data: subjects, isLoading: syllabusLoading } = useSyllabusProgress();
  const { data: velocity } = useVelocity();
  const { data: velocityHistory } = useVelocityHistory(30);
  const { data: buffer } = useBuffer();
  const { data: stress } = useStress();
  const { data: weeklyReview } = useWeeklyReview();
  const { data: benchmark } = useBenchmark();

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
  const velocityChartData = ((velocityHistory as any) || []).map((v: any) => ({
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
              label="Gravity"
            />
            <Text style={styles.ringLabel}>Weighted</Text>
          </View>
        </View>

        {velocity && (
          <View style={styles.statsRow}>
            <StatBox label="Velocity" value={`${velocity.velocity_ratio.toFixed(2)}x`} />
            <StatBox label="Buffer" value={`${(buffer?.balance || 0).toFixed(1)}d`} />
            <StatBox label="Streak" value={`${velocity.streak?.current_count || 0}d`} />
          </View>
        )}

        {benchmark && (
          <View style={styles.section}>
            <BenchmarkScoreCard profile={benchmark} />
          </View>
        )}

        {weeklyReview && (
          <View style={styles.section}>
            <WeeklyReviewCard review={weeklyReview} />
          </View>
        )}

        {velocityChartData.length > 1 && (
          <View style={styles.section}>
            <HistoryChart data={velocityChartData} title="Velocity (30d)" color={theme.colors.primary} />
          </View>
        )}

        {stressChartData.length > 1 && (
          <View style={styles.section}>
            <HistoryChart data={stressChartData} title="Stress (7d)" color={theme.colors.success} />
          </View>
        )}

        {subjects && subjects.length > 0 && (
          <View style={styles.section}>
            <SubjectProgressGrid subjects={subjects} />
          </View>
        )}

        <View style={{ height: theme.spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={statStyles.box}>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
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
  label: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});

const styles = StyleSheet.create({
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
});
