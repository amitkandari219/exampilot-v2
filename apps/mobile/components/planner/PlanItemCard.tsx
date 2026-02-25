import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import type { DailyPlanItem, PlanItemType } from '../../types';

interface PlanItemCardProps {
  item: DailyPlanItem;
  onComplete: (itemId: string) => void;
  onDefer: (itemId: string) => void;
}

const TYPE_CONFIG: Record<PlanItemType, { label: string; color: string }> = {
  new: { label: 'NEW', color: '#3B82F6' },
  revision: { label: 'REVISION', color: '#A855F7' },
  decay_revision: { label: 'DECAY', color: '#F59E0B' },
  stretch: { label: 'STRETCH', color: '#6366F1' },
};

export function PlanItemCard({ item, onComplete, onDefer }: PlanItemCardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isCompleted = item.status === 'completed';
  const typeConfig = TYPE_CONFIG[item.type];
  const pyqWeight = item.topic?.pyq_weight ?? 0;

  return (
    <View style={[styles.card, isCompleted && styles.cardCompleted]}>
      <TouchableOpacity
        style={[
          styles.checkbox,
          isCompleted && styles.checkboxCompleted,
        ]}
        onPress={() => onComplete(item.id)}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {isCompleted && <View style={styles.checkboxInner} />}
      </TouchableOpacity>

      <View style={styles.content}>
        <Text
          style={[styles.topicName, isCompleted && styles.topicNameCompleted]}
          numberOfLines={2}
        >
          {item.topic?.name ?? `Topic ${item.topic_id}`}
        </Text>

        <View style={styles.badgeRow}>
          {item.subject_name && (
            <View style={styles.subjectBadge}>
              <Text style={styles.subjectBadgeText}>{item.subject_name}</Text>
            </View>
          )}
          {item.chapter_name && (
            <View style={styles.chapterBadge}>
              <Text style={styles.chapterBadgeText}>{item.chapter_name}</Text>
            </View>
          )}
          <View style={[styles.typeBadge, { backgroundColor: typeConfig.color + '22' }]}>
            <Text style={[styles.typeBadgeText, { color: typeConfig.color }]}>
              {typeConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <PyqDots weight={pyqWeight} styles={styles} />
          <Text style={[styles.timeText, isCompleted && styles.textDimmed]}>
            {item.estimated_hours}h
          </Text>
        </View>
      </View>

      {!isCompleted && (
        <TouchableOpacity
          style={styles.deferButton}
          onPress={() => onDefer(item.id)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.deferButtonText}>Defer</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function PyqDots({ weight, styles }: { weight: number; styles: ReturnType<typeof createStyles> }) {
  const dotCount = Math.min(Math.round(weight), 5);
  if (dotCount <= 0) return null;

  return (
    <View style={styles.pyqContainer}>
      {Array.from({ length: dotCount }).map((_, i) => (
        <View key={i} style={styles.pyqDot} />
      ))}
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  cardCompleted: {
    opacity: 0.55,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  checkboxCompleted: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.surface,
  },
  content: {
    flex: 1,
  },
  topicName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  topicNameCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  subjectBadge: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.sm,
  },
  subjectBadgeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  chapterBadge: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.sm,
  },
  chapterBadgeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  typeBadge: {
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.sm,
  },
  typeBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pyqContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  pyqDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.warning,
  },
  timeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  textDimmed: {
    color: theme.colors.textMuted,
  },
  deferButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
    marginTop: 2,
  },
  deferButtonText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
});
