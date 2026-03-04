import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../constants/theme';
import { V4Card } from '../components/v4/V4Card';
import { V4Bar } from '../components/v4/V4Bar';
import { V4Pill } from '../components/v4/V4Pill';
import { useStudyPlanOverview } from '../hooks/useStudyPlanOverview';
import type { SubjectProjection } from '../types';

const STATUS_COLORS: Record<string, { color: string; variant: 'accent' | 'green' | 'warn' | 'danger' }> = {
  completed: { color: '#22C55E', variant: 'green' },
  on_track: { color: '#22D3EE', variant: 'accent' },
  behind: { color: '#F59E42', variant: 'warn' },
  at_risk: { color: '#EF4444', variant: 'danger' },
};

export default function StudyPlanScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const { data: overview, isLoading } = useStudyPlanOverview();

  if (isLoading || !overview) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading study plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const velocityLabel = overview.velocity_ratio >= 1 ? 'On Track' : overview.velocity_ratio >= 0.7 ? 'Behind' : 'At Risk';
  const velocityColor = overview.velocity_ratio >= 1 ? theme.colors.green : overview.velocity_ratio >= 0.7 ? theme.colors.warn : theme.colors.danger;

  const renderSubjectCard = ({ item }: { item: SubjectProjection }) => {
    const statusConfig = STATUS_COLORS[item.status] || STATUS_COLORS.at_risk;
    return (
      <V4Card bordered style={styles.subjectCard}>
        <View style={styles.subjectHeader}>
          <Text style={styles.subjectName}>{item.subject_name}</Text>
          <V4Pill label={item.status.replace('_', ' ').toUpperCase()} variant={statusConfig.variant} />
        </View>
        <V4Bar progress={item.completion_pct} color={statusConfig.color} />
        <View style={styles.subjectMeta}>
          <Text style={styles.subjectStat}>{item.completed_topics}/{item.total_topics} topics</Text>
          {item.projected_finish_date && (
            <Text style={styles.subjectStat}>Est. {item.projected_finish_date}</Text>
          )}
        </View>
      </V4Card>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Your Study Plan</Text>
        </View>

        {/* 1. Timeline */}
        <V4Card bordered style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.timelineRow}>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineBig}>{overview.days_remaining}</Text>
              <Text style={styles.timelineLabel}>days left</Text>
            </View>
            <View style={styles.timelineItem}>
              <Text style={[styles.timelineBig, { color: velocityColor }]}>
                {(overview.velocity_ratio * 100).toFixed(0)}%
              </Text>
              <Text style={styles.timelineLabel}>{velocityLabel}</Text>
            </View>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineBig}>{overview.overall_completion_pct.toFixed(0)}%</Text>
              <Text style={styles.timelineLabel}>complete</Text>
            </View>
          </View>
          {overview.overall_projected_date && (
            <Text style={styles.projectedText}>
              Projected finish: {overview.overall_projected_date}
              {overview.overall_projected_date > overview.exam_date ? ' (after exam!)' : ''}
            </Text>
          )}
        </V4Card>

        {/* 2. Subject Breakdown */}
        <Text style={styles.sectionTitle}>Subject Breakdown</Text>
        {overview.subjects.map((subject) => (
          <View key={subject.subject_id}>
            {renderSubjectCard({ item: subject })}
          </View>
        ))}

        {/* 3. Revision Preview */}
        {overview.revision_preview.length > 0 && (
          <V4Card bordered style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Revisions (7 days)</Text>
            {overview.revision_preview.map((day) => (
              <View key={day.date} style={styles.revisionDay}>
                <View style={styles.revisionDayHeader}>
                  <Text style={styles.revisionDate}>{day.date}</Text>
                  <Text style={styles.revisionCount}>{day.count} topic{day.count > 1 ? 's' : ''}</Text>
                </View>
                {day.topics.slice(0, 3).map((t, idx) => (
                  <Text key={idx} style={styles.revisionTopic}>
                    {t.subject_name} — {t.name}
                  </Text>
                ))}
                {day.topics.length > 3 && (
                  <Text style={styles.revisionMore}>+{day.topics.length - 3} more</Text>
                )}
              </View>
            ))}
          </V4Card>
        )}

        {/* 4. Quick Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.8}
            onPress={() => router.push('/simulator' as any)}
          >
            <Text style={styles.actionBtnText}>Run Simulation</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, padding: theme.spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: theme.colors.textMuted, fontSize: 14 },

  header: { marginBottom: theme.spacing.lg },
  backBtn: { fontSize: 14, color: theme.colors.accent, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: theme.colors.text },

  section: { marginBottom: theme.spacing.md },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 10,
  },

  // Timeline
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  timelineItem: { alignItems: 'center' },
  timelineBig: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.accent,
  },
  timelineLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  projectedText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // Subject cards
  subjectCard: { marginBottom: 8 },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  subjectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  subjectStat: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },

  // Revision preview
  revisionDay: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  revisionDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  revisionDate: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  revisionCount: {
    fontSize: 11,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  revisionTopic: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginLeft: 8,
    marginTop: 2,
  },
  revisionMore: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginLeft: 8,
    marginTop: 2,
    fontStyle: 'italic',
  },

  // Actions
  actionBtn: {
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionBtnText: {
    color: theme.colors.background,
    fontWeight: '700',
    fontSize: 14,
  },
});
