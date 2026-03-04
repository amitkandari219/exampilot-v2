import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { Theme } from '../../constants/theme';
import { useSyllabusProgress, useUpdateTopicProgress } from '../../hooks/useSyllabus';
import { SummaryBar } from '../../components/syllabus/SummaryBar';
import { SubjectCard } from '../../components/syllabus/SubjectCard';
import { TopicUpdateSheet } from '../../components/syllabus/TopicUpdateSheet';
import { V4Card } from '../../components/v4/V4Card';
import { V4Tip } from '../../components/v4/V4Tip';
import { TopicWithProgress, ChapterWithTopics } from '../../types';

export default function SyllabusScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { daysUsed, isVeteran } = useUser();
  const { data: subjects, isLoading } = useSyllabusProgress();
  const updateProgress = useUpdateTopicProgress();
  const [selectedTopic, setSelectedTopic] = useState<TopicWithProgress | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const isFirstWeek = !isVeteran && daysUsed <= 7;

  const handleTopicPress = (topicId: string) => {
    // Disable topic expansion in first week
    if (isFirstWeek) return;

    for (const subject of subjects || []) {
      for (const chapter of subject.chapters || []) {
        const topic = (chapter as ChapterWithTopics).topics?.find((t) => t.id === topicId);
        if (topic) {
          setSelectedTopic(topic);
          setSheetVisible(true);
          return;
        }
      }
    }
  };

  const handleSave = (updates: any) => {
    if (!selectedTopic) return;
    updateProgress.mutate({ topicId: selectedTopic.id, updates });
    setSheetVisible(false);
    setSelectedTopic(null);
  };

  // Calculate summary stats
  let totalTopics = 0;
  let completedTopics = 0;
  let weightedSum = 0;
  let weightedCompleted = 0;
  let confidenceSum = 0;
  let confidenceCount = 0;

  for (const subject of subjects || []) {
    if (subject.progress) {
      totalTopics += subject.progress.total_topics;
      completedTopics += subject.progress.completed_topics;
      weightedSum += 1;
      weightedCompleted += subject.progress.weighted_completion;
      if (subject.progress.avg_confidence > 0) {
        confidenceSum += subject.progress.avg_confidence;
        confidenceCount++;
      }
    }
  }

  const avgWeightedCompletion = weightedSum > 0 ? weightedCompleted / weightedSum : 0;
  const avgConfidence = confidenceCount > 0 ? confidenceSum / confidenceCount : 0;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Syllabus Map</Text>

      {/* 5.3.1 — First-Week Info Card */}
      {isFirstWeek && (
        <View style={styles.firstWeekContainer}>
          <V4Card bordered style={styles.firstWeekCard}>
            <Text style={styles.firstWeekTitle}>Getting Started</Text>
            <Text style={styles.firstWeekDesc}>
              Your progress appears here as you study. Follow the daily plan and subjects will light up with completion data.
            </Text>
          </V4Card>
          <V4Tip message="Weighted by PYQ importance — high-frequency topics count more." variant="info" />
        </View>
      )}

      {/* 5.3.2 — Show "Not started" labels OR regular summary */}
      {isFirstWeek ? (
        <View style={styles.notStartedBar}>
          <Text style={styles.notStartedText}>Not started yet</Text>
          <Text style={styles.notStartedHint}>{totalTopics} topics to cover</Text>
        </View>
      ) : (
        <>
          <SummaryBar
            totalTopics={totalTopics}
            completedTopics={completedTopics}
            weightedCompletion={avgWeightedCompletion}
            avgConfidence={avgConfidence}
          />
          <V4Tip message="Weighted by PYQ importance — high-frequency topics count more." variant="info" />
        </>
      )}

      {/* 5.3.3 — Disable topic expansion in first week (handled in handleTopicPress) */}
      <FlatList
        data={subjects || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubjectCard
            subject={item}
            onTopicPress={handleTopicPress}
          />
        )}
        contentContainerStyle={styles.list}
      />

      <TopicUpdateSheet
        visible={sheetVisible}
        topic={selectedTopic}
        onClose={() => { setSheetVisible(false); setSelectedTopic(null); }}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  list: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // First week
  firstWeekContainer: { paddingHorizontal: theme.spacing.lg, marginBottom: 8 },
  firstWeekCard: { marginBottom: 8 },
  firstWeekTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.accent, marginBottom: 6 },
  firstWeekDesc: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 20 },

  // Not started
  notStartedBar: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 12,
    marginBottom: 8,
  },
  notStartedText: { fontSize: 16, fontWeight: '600', color: theme.colors.textMuted },
  notStartedHint: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
});
