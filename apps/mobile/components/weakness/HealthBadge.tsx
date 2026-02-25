import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import type { HealthCategory } from '../../types';

interface HealthBadgeProps {
  score: number;
  category?: HealthCategory;
  onPress?: () => void;
}

function getCategoryColors(theme: Theme) {
  return {
    critical: theme.colors.error,
    weak: theme.colors.orange,
    moderate: theme.colors.warning,
    strong: theme.colors.success,
    exam_ready: theme.colors.primary,
  };
}

const CATEGORY_LABELS: Record<HealthCategory, string> = {
  critical: 'Critical',
  weak: 'Weak',
  moderate: 'Moderate',
  strong: 'Strong',
  exam_ready: 'Ready',
};

function getCategory(score: number): HealthCategory {
  if (score >= 80) return 'exam_ready';
  if (score >= 65) return 'strong';
  if (score >= 45) return 'moderate';
  if (score >= 25) return 'weak';
  return 'critical';
}

export function HealthBadge({ score, category, onPress }: HealthBadgeProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const cat = category || getCategory(score);
  const color = getCategoryColors(theme)[cat];

  const content = (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.label, { color }]}>{CATEGORY_LABELS[cat]}</Text>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.score, { color }]}>{score}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const createStyles = (theme: Theme) => StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  score: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },
  label: {
    fontSize: theme.fontSize.xxs,
    fontWeight: '600',
  },
});
