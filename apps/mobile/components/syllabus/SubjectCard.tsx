import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import type { Subject } from '../../types';
import { ChapterAccordion } from './ChapterAccordion';

interface SubjectCardProps {
  subject: Subject;
  onTopicPress: (topicId: string) => void;
}

export function SubjectCard({ subject, onTopicPress }: SubjectCardProps) {
  const [expanded, setExpanded] = useState(false);

  const progress = subject.progress;
  const completionPct = progress?.weighted_completion ?? 0;
  const avgConfidence = progress?.avg_confidence ?? 0;
  const totalTopics = progress?.total_topics ?? 0;
  const completedTopics = progress?.completed_topics ?? 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <ProgressRing percentage={completionPct} />
          <View style={styles.headerInfo}>
            <Text style={styles.subjectName} numberOfLines={1}>
              {subject.name}
            </Text>
            <Text style={styles.subjectMeta}>
              {completedTopics}/{totalTopics} topics
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.statColumn}>
            <Text style={styles.statValue}>{Math.round(completionPct)}%</Text>
            <Text style={styles.statLabel}>weighted</Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={styles.statValue}>{Math.round(avgConfidence)}</Text>
            <Text style={styles.statLabel}>conf</Text>
          </View>
          <Text style={styles.expandArrow}>{expanded ? '\u25B2' : '\u25BC'}</Text>
        </View>
      </TouchableOpacity>

      {expanded && subject.chapters && (
        <View style={styles.chapterList}>
          {subject.chapters.map((chapter) => (
            <ChapterAccordion key={chapter.id} chapter={chapter} onTopicPress={onTopicPress} />
          ))}
        </View>
      )}
    </View>
  );
}

function ProgressRing({ percentage }: { percentage: number }) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const ringColor =
    clamped >= 80
      ? theme.colors.success
      : clamped >= 50
        ? theme.colors.primary
        : clamped >= 25
          ? theme.colors.warning
          : theme.colors.textMuted;

  return (
    <View style={[styles.ring, { borderColor: theme.colors.border }]}>
      <View
        style={[
          styles.ringOverlay,
          {
            borderColor: ringColor,
            borderTopColor: clamped >= 25 ? ringColor : 'transparent',
            borderRightColor: clamped >= 50 ? ringColor : 'transparent',
            borderBottomColor: clamped >= 75 ? ringColor : 'transparent',
            borderLeftColor: clamped >= 100 ? ringColor : 'transparent',
          },
        ]}
      />
      <Text style={[styles.ringText, { color: ringColor }]}>{Math.round(clamped)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  headerInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  subjectName: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subjectMeta: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  statColumn: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  expandArrow: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  chapterList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  ring: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 3,
  },
  ringText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },
});
