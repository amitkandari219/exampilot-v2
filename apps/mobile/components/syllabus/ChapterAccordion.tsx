import React, {  useState , useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import type { ChapterWithTopics } from '../../types';
import { TopicRow } from './TopicRow';

interface ChapterAccordionProps {
  chapter: ChapterWithTopics;
  onTopicPress: (topicId: string) => void;
}

export function ChapterAccordion({ chapter, onTopicPress }: ChapterAccordionProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [expanded, setExpanded] = useState(false);

  const totalTopics = chapter.topics.length;
  const completedTopics = chapter.topics.filter(
    (t) => t.user_progress && t.user_progress.status !== 'untouched'
  ).length;
  const weightedCompletion = chapter.progress?.weighted_completion ?? 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.arrow}>{expanded ? '\u25BC' : '\u25B6'}</Text>
          <Text style={styles.chapterName} numberOfLines={1}>
            {chapter.name}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.progressFraction}>
            {completedTopics}/{totalTopics}
          </Text>
          <Text style={styles.weightedPct}>{Math.round(weightedCompletion)}%</Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.topicList}>
          {chapter.topics.map((topic) => (
            <TopicRow key={topic.id} topic={topic} onPress={() => onTopicPress(topic.id)} />
          ))}
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  arrow: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
    width: 14,
  },
  chapterName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  progressFraction: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  weightedPct: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '700',
    minWidth: 36,
    textAlign: 'right',
  },
  topicList: {
    backgroundColor: theme.colors.background,
  },
});
