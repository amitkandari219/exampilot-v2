import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import { theme } from '../../constants/theme';
import { useSyllabusProgress, useUpdateTopicProgress } from '../../hooks/useSyllabus';
import { SummaryBar } from '../../components/syllabus/SummaryBar';
import { SubjectCard } from '../../components/syllabus/SubjectCard';
import { TopicUpdateSheet } from '../../components/syllabus/TopicUpdateSheet';
import { TopicWithProgress, Subject } from '../../types';

export default function SyllabusScreen() {
  const { data: subjects, isLoading } = useSyllabusProgress();
  const updateProgress = useUpdateTopicProgress();
  const [selectedTopic, setSelectedTopic] = useState<TopicWithProgress | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const handleTopicPress = (topicId: string) => {
    // Find the topic across all subjects/chapters
    for (const subject of subjects || []) {
      for (const chapter of subject.chapters || []) {
        const topic = (chapter as any).topics?.find((t: any) => t.id === topicId);
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

      <SummaryBar
        totalTopics={totalTopics}
        completedTopics={completedTopics}
        weightedCompletion={avgWeightedCompletion}
        avgConfidence={avgConfidence}
      />

      <FlatList
        data={subjects || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubjectCard subject={item} onTopicPress={handleTopicPress} />
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

const styles = StyleSheet.create({
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
});
