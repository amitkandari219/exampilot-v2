import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';

interface GuidedOrientationProps {
  dayNumber: number; // 1, 2, or 3
}

interface DayGuide {
  title: string;
  steps: string[];
}

const DAILY_GUIDES: Record<number, DayGuide> = {
  1: {
    title: 'Day 1 — Get started',
    steps: [
      'Complete your daily plan below — even 1 item counts',
      'Browse the Syllabus tab to see your full roadmap',
      'After finishing a topic, rate how well you remember it',
    ],
  },
  2: {
    title: 'Day 2 — Build momentum',
    steps: [
      'Complete today\'s plan — your first revision item may appear',
      'Check your Study Speed card to see your pace',
      'Try to study at roughly the same time as yesterday',
    ],
  },
  3: {
    title: 'Day 3 — You\'re building a habit',
    steps: [
      'Complete today\'s plan — you\'re on a 3-day streak!',
      'Check the Progress tab to see your coverage growing',
      'Tomorrow, more dashboard features will start appearing',
    ],
  },
};

export function GuidedOrientation({ dayNumber }: GuidedOrientationProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const guide = DAILY_GUIDES[dayNumber];
  if (!guide) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{guide.title}</Text>
      {guide.steps.map((step, i) => (
        <View key={i} style={styles.stepRow}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{i + 1}</Text>
          </View>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.background,
  },
  stepText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
});
