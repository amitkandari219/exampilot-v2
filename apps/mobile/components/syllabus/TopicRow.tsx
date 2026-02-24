import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import type { TopicWithProgress, TopicStatus } from '../../types';
import { PYQBadge } from './PYQBadge';
import { ConfidenceMeter } from './ConfidenceMeter';
import { HealthBadge } from '../weakness/HealthBadge';

interface TopicRowProps {
  topic: TopicWithProgress;
  onPress: () => void;
}

const STATUS_PILL_COLORS: Record<TopicStatus, { bg: string; text: string }> = {
  untouched: { bg: '#374151', text: '#9CA3AF' },
  in_progress: { bg: '#1E3A5F', text: '#60A5FA' },
  first_pass: { bg: '#0E3A4A', text: '#22D3EE' },
  revised: { bg: '#064E3B', text: '#34D399' },
  exam_ready: { bg: '#065F46', text: '#6EE7B7' },
  deferred_scope: { bg: '#1E293B', text: '#64748B' },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return '1d ago';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}m ago`;
}

function statusLabel(status: TopicStatus): string {
  switch (status) {
    case 'untouched':
      return 'Untouched';
    case 'in_progress':
      return 'In Progress';
    case 'first_pass':
      return 'First Pass';
    case 'revised':
      return 'Revised';
    case 'exam_ready':
      return 'Exam Ready';
    case 'deferred_scope':
      return 'Deferred';
  }
}

export function TopicRow({ topic, onPress }: TopicRowProps) {
  const progress = topic.user_progress;
  const status: TopicStatus = progress?.status ?? 'untouched';
  const pillColors = STATUS_PILL_COLORS[status];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.topRow}>
        <Text style={styles.topicName} numberOfLines={1}>
          {topic.name}
        </Text>
        {progress && progress.health_score > 0 && (
          <HealthBadge score={progress.health_score} />
        )}
        <PYQBadge weight={topic.pyq_weight} />
      </View>

      <View style={styles.middleRow}>
        <View style={[styles.statusPill, { backgroundColor: pillColors.bg }]}>
          <Text style={[styles.statusText, { color: pillColors.text }]}>
            {statusLabel(status)}
          </Text>
        </View>
        {progress?.last_touched && (
          <Text style={styles.dateText}>{formatDate(progress.last_touched)}</Text>
        )}
      </View>

      {progress && progress.confidence_score > 0 && (
        <View style={styles.confidenceRow}>
          <ConfidenceMeter
            score={progress.confidence_score}
            status={progress.confidence_status}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  topicName: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  statusPill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  confidenceRow: {
    marginTop: theme.spacing.xs,
  },
  dateText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
});
