import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import type { HealthCategory } from '../../types';

interface HealthBadgeProps {
  score: number;
  category?: HealthCategory;
}

const CATEGORY_COLORS: Record<HealthCategory, string> = {
  critical: theme.colors.error,
  weak: '#F97316',
  moderate: theme.colors.warning,
  strong: theme.colors.success,
  exam_ready: theme.colors.primary,
};

function getCategory(score: number): HealthCategory {
  if (score >= 80) return 'exam_ready';
  if (score >= 65) return 'strong';
  if (score >= 45) return 'moderate';
  if (score >= 25) return 'weak';
  return 'critical';
}

export function HealthBadge({ score, category }: HealthBadgeProps) {
  const cat = category || getCategory(score);
  const color = CATEGORY_COLORS[cat];

  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <Text style={styles.label}>H</Text>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.score, { color }]}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  score: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },
});
