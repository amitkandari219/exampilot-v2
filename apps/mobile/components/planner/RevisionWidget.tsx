import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';

interface RevisionItem {
  topic_id: string;
  topic_name: string;
  due: string;
}

interface RevisionWidgetProps {
  revisions: RevisionItem[];
  onComplete: (topicId: string) => void;
}

function formatDue(dateStr: string): string {
  const due = new Date(dateStr);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return `In ${diffDays}d`;
}

function getDueColor(dateStr: string, theme: Theme): string {
  const due = new Date(dateStr);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return theme.colors.error;
  if (diffDays === 0) return theme.colors.warning;
  return theme.colors.textSecondary;
}

export function RevisionWidget({ revisions, onComplete }: RevisionWidgetProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  if (revisions.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.revisionIcon}>
            <Text style={styles.revisionIconText}>R</Text>
          </View>
          <Text style={styles.headerTitle}>Revisions Due</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{revisions.length}</Text>
        </View>
      </View>

      {revisions.map((revision) => (
        <View key={revision.topic_id} style={styles.row}>
          <View style={styles.rowIcon}>
            <View style={styles.revisionDot} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.topicName} numberOfLines={1}>
              {revision.topic_name}
            </Text>
            <Text style={[styles.dueText, { color: getDueColor(revision.due, theme) }]}>
              {formatDue(revision.due)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => onComplete(revision.topic_id)}
            activeOpacity={0.7}
          >
            <Text style={styles.completeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  revisionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.purple + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revisionIconText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.purple,
  },
  headerTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.text,
  },
  countBadge: {
    backgroundColor: theme.colors.purple + '22',
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.sm,
  },
  countBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.purple,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  rowIcon: {
    width: 24,
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  revisionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.purple,
  },
  rowContent: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  topicName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  dueText: {
    fontSize: theme.fontSize.xs,
  },
  completeButton: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  completeButtonText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.success,
  },
});
