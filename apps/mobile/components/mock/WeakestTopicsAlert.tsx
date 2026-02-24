import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import type { MockTrend } from '../../types';

interface WeakTopic {
  topic_id: string;
  topic_name: string;
  accuracy: number;
  total_questions: number;
  trend: MockTrend;
}

interface Props {
  topics: WeakTopic[];
}

function getTrendArrow(trend: MockTrend): string {
  if (trend === 'improving') return '\u2191';
  if (trend === 'declining') return '\u2193';
  return '\u2192';
}

function getTrendColor(trend: MockTrend): string {
  if (trend === 'improving') return theme.colors.success;
  if (trend === 'declining') return theme.colors.error;
  return theme.colors.textMuted;
}

export function WeakestTopicsAlert({ topics }: Props) {
  if (topics.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>WEAKEST TOPICS</Text>
      {topics.slice(0, 5).map((topic) => (
        <View key={topic.topic_id} style={styles.row}>
          <Text style={styles.topicName} numberOfLines={1}>{topic.topic_name}</Text>
          <View style={styles.rightSide}>
            <Text style={styles.accuracy}>{(topic.accuracy * 100).toFixed(0)}%</Text>
            <Text style={[styles.trend, { color: getTrendColor(topic.trend) }]}>
              {getTrendArrow(topic.trend)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.error + '30',
  },
  sectionLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.error,
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  topicName: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  rightSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accuracy: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.error,
  },
  trend: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
});
