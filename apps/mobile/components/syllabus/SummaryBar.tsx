import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';

interface SummaryBarProps {
  totalTopics: number;
  completedTopics: number;
  weightedCompletion: number;
  avgConfidence: number;
}

export function SummaryBar({
  totalTopics,
  completedTopics,
  weightedCompletion,
  avgConfidence,
}: SummaryBarProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <View style={styles.stat}>
        <Text style={styles.statValue}>
          {completedTopics}/{totalTopics}
        </Text>
        <Text style={styles.statLabel}>topics</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.stat}>
        <Text style={styles.statValue}>{Math.round(weightedCompletion)}%</Text>
        <Text style={styles.statLabel}>weighted</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.stat}>
        <Text style={styles.statValue}>{Math.round(avgConfidence)}</Text>
        <Text style={styles.statLabel}>confidence</Text>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing.xs,
  },
  statValue: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: theme.colors.border,
  },
});
