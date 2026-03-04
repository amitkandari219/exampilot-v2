import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Theme } from '../constants/theme';
import { useWeeklyReview, useRegenerateWeeklyReview } from '../hooks/useWeeklyReview';
import { useMockAnalytics } from '../hooks/useMockTest';
import { V4Card } from '../components/v4/V4Card';
import { V4MetricBox } from '../components/v4/V4MetricBox';
import { V4Bar } from '../components/v4/V4Bar';
import { V4Pill } from '../components/v4/V4Pill';
import { V4SectionLabel } from '../components/v4/V4SectionLabel';
import { V4Tip } from '../components/v4/V4Tip';

function hoursBarColor(h: number): string {
  if (h >= 5) return '#34D399';
  if (h >= 3) return '#F59E42';
  return '#EF4444';
}

export default function WeeklyReviewScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { daysUsed, isVeteran } = useUser();
  const { data: review, isLoading } = useWeeklyReview();
  const regenerate = useRegenerateWeeklyReview();
  const { data: mockAnalytics } = useMockAnalytics();

  const isFresh = daysUsed < 21;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.accent} /></View>
      </SafeAreaView>
    );
  }

  if (!review) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Weekly Review</Text>
          <V4Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No weekly review available yet.</Text>
            <TouchableOpacity
              style={styles.genBtn}
              onPress={() => regenerate.mutate(undefined)}
              disabled={regenerate.isPending}
            >
              <Text style={styles.genBtnText}>
                {regenerate.isPending ? 'Generating...' : 'Generate Review'}
              </Text>
            </TouchableOpacity>
          </V4Card>
        </View>
      </SafeAreaView>
    );
  }

  // Daily hours for bar chart (estimate from total_hours / 7)
  const avgDaily = review.avg_hours_per_day || 0;
  // We'll create a simple representation - 7 bars using available data
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Without per-day data, show avg as bars; zero_day_count days get 0
  const studyDays = 7 - (review.zero_day_count || 0);
  const dailyHrs = dayNames.map((_, i) =>
    i < studyDays ? (review.total_hours / Math.max(studyDays, 1)) : 0
  );
  const maxHr = Math.max(8, ...dailyHrs);

  // Metrics
  const tasksCompleted = review.plan_completed_items || 0;
  const tasksTotal = review.plan_total_items || 0;
  const revisionsCount = review.plan_revision_count || 0;
  const readinessDelta = review.benchmark_score_end !== null && review.benchmark_score_start !== null
    ? review.benchmark_score_end - review.benchmark_score_start
    : null;

  // Reflection questions
  const reflectionTitle = isFresh ? 'Quick Check-in' : 'Weekly Reflection';
  const reflectionQuestions = isFresh
    ? ['Did you mostly follow the daily plan?', 'One subject that felt manageable?', 'Any topic you want to revisit?']
    : ['What felt easy this week?', 'Where did you get stuck?', 'One thing to change next week?'];

  // Coverage gaps from subject_coverage
  const untouchedOver14d = review.subject_coverage?.untouched_over_14d || [];

  // Mock accuracy gaps (veterans with mock data)
  const mockGaps = isVeteran && mockAnalytics?.weakest_topics
    ? mockAnalytics.weakest_topics.filter(t => t.accuracy < 0.5).slice(0, 3)
    : [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Weekly Review</Text>
        <Text style={styles.dateRange}>
          {review.week_start_date} — {review.week_end_date}
        </Text>

        {/* 5.2.1 — Bar Chart */}
        <V4Card style={styles.section}>
          <View style={styles.chartRow}>
            {dailyHrs.map((hrs, i) => {
              const barPct = maxHr > 0 ? (hrs / maxHr) * 100 : 0;
              const color = hoursBarColor(hrs);
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={[styles.barHrs, { color }]}>{hrs > 0 ? hrs.toFixed(1) : ''}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: `${barPct}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={styles.barDay}>{dayNames[i]}</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.chartSummary}>
            {review.total_hours.toFixed(1)}h total · {studyDays} study days · {review.zero_day_count || 0} zero days
          </Text>
        </V4Card>

        {/* 5.2.2 — 3-Metric Row */}
        <View style={styles.metricsRow}>
          <V4MetricBox
            value={`${tasksCompleted}/${tasksTotal}`}
            label="Tasks Done"
            valueColor={tasksCompleted >= tasksTotal * 0.8 ? theme.colors.success : theme.colors.warning}
          />
          <View style={{ width: 8 }} />
          <V4MetricBox
            value={revisionsCount}
            label="Revisions"
            valueColor={theme.colors.purple}
          />
          <View style={{ width: 8 }} />
          <V4MetricBox
            value={readinessDelta !== null ? `${readinessDelta > 0 ? '+' : ''}${readinessDelta.toFixed(0)}%` : '--'}
            label="Readiness Δ"
            valueColor={readinessDelta !== null && readinessDelta > 0 ? theme.colors.success : theme.colors.textSecondary}
          />
        </View>

        {/* Highlights & Wins */}
        {review.wins && review.wins.length > 0 && (
          <>
            <V4SectionLabel text="Wins" style={styles.sectionLabel} />
            <V4Card style={styles.section}>
              {review.wins.map((w, i) => (
                <Text key={i} style={styles.winText}>✓ {w}</Text>
              ))}
            </V4Card>
          </>
        )}

        {review.areas_to_improve && review.areas_to_improve.length > 0 && (
          <>
            <V4SectionLabel text="Areas to Improve" style={styles.sectionLabel} />
            <V4Card style={styles.section}>
              {review.areas_to_improve.map((a, i) => (
                <Text key={i} style={styles.improveText}>→ {a}</Text>
              ))}
            </V4Card>
          </>
        )}

        {/* 5.2.3 — Adaptive Reflection */}
        <V4SectionLabel text={reflectionTitle} style={styles.sectionLabel} />
        <V4Card style={styles.section}>
          {reflectionQuestions.map((q, i) => (
            <ReflectionInput key={i} question={q} theme={theme} styles={styles} />
          ))}
          <Text style={styles.reflectionNote}>Reflections are for your eyes only — not saved.</Text>
        </V4Card>

        {/* 5.2.4 — Recalibration Engine */}
        {(untouchedOver14d.length > 0 || mockGaps.length > 0) && (
          <>
            <V4SectionLabel text="Recalibration Insights" style={styles.sectionLabel} />
            {untouchedOver14d.length > 0 && (
              <V4Card style={styles.section}>
                <V4Pill label="COVERAGE GAP" variant="danger" />
                <Text style={styles.insightText}>
                  {untouchedOver14d.slice(0, 3).join(', ')} untouched for 14+ days — consider shifting sessions to these subjects.
                </Text>
              </V4Card>
            )}
            {mockGaps.length > 0 && (
              <V4Card style={styles.section}>
                <V4Pill label="UNDERSTANDING GAP" variant="warn" />
                {mockGaps.map((g) => (
                  <Text key={g.topic_id} style={styles.insightText}>
                    {g.topic_name}: {(g.accuracy * 100).toFixed(0)}% accuracy despite coverage. Try PYQs.
                  </Text>
                ))}
              </V4Card>
            )}
          </>
        )}

        {/* Recommendations */}
        {review.next_week_recommendations && review.next_week_recommendations.length > 0 && (
          <>
            <V4SectionLabel text="Next Week" style={styles.sectionLabel} />
            <V4Card style={styles.section}>
              {review.next_week_recommendations.map((r, i) => (
                <Text key={i} style={styles.recText}>→ {r}</Text>
              ))}
            </V4Card>
          </>
        )}

        {/* Regenerate */}
        <TouchableOpacity
          style={styles.regenBtn}
          onPress={() => regenerate.mutate(undefined)}
          disabled={regenerate.isPending}
        >
          <Text style={styles.regenText}>
            {regenerate.isPending ? 'Regenerating...' : 'Regenerate Review'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ReflectionInput({ question, theme, styles }: { question: string; theme: Theme; styles: any }) {
  const [text, setText] = useState('');
  return (
    <View style={styles.reflectionBlock}>
      <Text style={styles.reflectionQ}>• {question}</Text>
      <TextInput
        style={styles.reflectionInput}
        value={text}
        onChangeText={setText}
        placeholder="Tap to write..."
        placeholderTextColor={theme.colors.textMuted}
        multiline
      />
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1 },
  content: { padding: theme.spacing.lg, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: { marginBottom: 8 },
  backText: { fontSize: 14, color: theme.colors.accent },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
  },
  dateRange: { fontSize: 12, color: theme.colors.textMuted, marginBottom: theme.spacing.lg },
  sectionLabel: { marginTop: 16, marginBottom: 8, marginLeft: 2 },
  section: { marginBottom: 8 },
  metricsRow: { flexDirection: 'row', marginBottom: 8 },

  // Chart
  chartRow: { flexDirection: 'row', justifyContent: 'space-around', height: 110, alignItems: 'flex-end' },
  barCol: { alignItems: 'center', flex: 1 },
  barHrs: { fontSize: 9, fontWeight: '600', marginBottom: 3 },
  barTrack: { width: 24, height: 70, justifyContent: 'flex-end', borderRadius: 4, overflow: 'hidden' },
  barFill: { width: 24, borderRadius: 4 },
  barDay: { fontSize: 10, color: theme.colors.textMuted, marginTop: 4 },
  chartSummary: { fontSize: 11, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 10 },

  // Wins & Improvements
  winText: { fontSize: 13, color: theme.colors.success, marginBottom: 6, lineHeight: 20 },
  improveText: { fontSize: 13, color: theme.colors.warning, marginBottom: 6, lineHeight: 20 },

  // Reflection
  reflectionBlock: { marginBottom: 12 },
  reflectionQ: { fontSize: 13, color: theme.colors.text, marginBottom: 6, lineHeight: 20 },
  reflectionInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: theme.colors.text,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  reflectionNote: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },

  // Insights
  insightText: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 6, lineHeight: 18 },

  // Recommendations
  recText: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 6, lineHeight: 20 },

  // Empty
  emptyCard: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 16 },
  genBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  genBtnText: { fontSize: 14, fontWeight: '600', color: theme.colors.background },

  // Regenerate
  regenBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
  },
  regenText: { fontSize: 13, color: theme.colors.textSecondary },
});
