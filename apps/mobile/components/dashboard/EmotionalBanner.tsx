import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';

interface EmotionalBannerProps {
  streakCount: number;
  inRecovery: boolean;
  isLightDay: boolean;
  lastMockScore?: number | null;
  consecutiveMissedDays: number;
  briScore: number;
}

interface BannerContent {
  message: string;
  subtext: string;
  bgColor: string;
  textColor: string;
}

function pickBanner(props: EmotionalBannerProps, theme: Theme): BannerContent | null {
  const { streakCount, inRecovery, isLightDay, lastMockScore, consecutiveMissedDays, briScore } = props;

  // Priority 1: Comeback after absence
  if (consecutiveMissedDays >= 2) {
    return {
      message: 'Welcome back!',
      subtext: "Starting again takes courage. We've prepared a lighter plan to ease you in.",
      bgColor: theme.colors.primary + '15',
      textColor: theme.colors.primary,
    };
  }

  // Priority 2: Recovery mode
  if (inRecovery) {
    return {
      message: "Rest is part of the strategy",
      subtext: "Today's plan is lighter by design. Trust the process.",
      bgColor: theme.colors.success + '15',
      textColor: theme.colors.success,
    };
  }

  // Priority 3: Post-bad-mock
  if (lastMockScore != null && lastMockScore < 40) {
    return {
      message: "One mock doesn't define you",
      subtext: "Your weak areas are now clearer. That's progress, not failure.",
      bgColor: theme.colors.warning + '15',
      textColor: theme.colors.warning,
    };
  }

  // Priority 4: High burnout risk
  if (briScore < 40) {
    return {
      message: "Take it easy today",
      subtext: "Your burnout risk is high. A lighter day now means stronger days ahead.",
      bgColor: theme.colors.orange + '15',
      textColor: theme.colors.orange,
    };
  }

  // Priority 5: Light day
  if (isLightDay) {
    return {
      message: "Light day — well deserved",
      subtext: "Sustainable progress beats burnout sprints every time.",
      bgColor: theme.colors.success + '15',
      textColor: theme.colors.success,
    };
  }

  // Priority 6: Streak milestones
  if (streakCount === 7) {
    return {
      message: "7-day streak!",
      subtext: "A full week of consistency. You're building a real habit.",
      bgColor: theme.colors.primary + '15',
      textColor: theme.colors.primary,
    };
  }
  if (streakCount === 14) {
    return {
      message: "2-week streak!",
      subtext: "Two weeks strong. This kind of discipline changes outcomes.",
      bgColor: theme.colors.primary + '15',
      textColor: theme.colors.primary,
    };
  }
  if (streakCount === 30) {
    return {
      message: "30-day streak!",
      subtext: "A month of daily study. You're in rare company.",
      bgColor: theme.colors.primary + '15',
      textColor: theme.colors.primary,
    };
  }

  return null;
}

export function EmotionalBanner(props: EmotionalBannerProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const banner = pickBanner(props, theme);

  if (!banner) return null;

  return (
    <View style={[styles.container, { backgroundColor: banner.bgColor }]}>
      <Text style={[styles.message, { color: banner.textColor }]}>{banner.message}</Text>
      <Text style={[styles.subtext, { color: banner.textColor + 'CC' }]}>{banner.subtext}</Text>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  message: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtext: {
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
});
