import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';
import { BadgeGrid } from '../gamification/BadgeGrid';
import { GamificationProfile, BadgeWithStatus } from '../../types';

interface GamificationSectionProps {
  theme: Theme;
  gamification: GamificationProfile | null | undefined;
  badges: BadgeWithStatus[] | null | undefined;
}

export function GamificationSection({ theme, gamification, badges }: GamificationSectionProps) {
  const styles = createStyles(theme);

  if (!gamification) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Level & Achievements</Text>
      <View style={styles.paramRow}>
        <Text style={styles.paramLabel}>Level</Text>
        <Text style={styles.paramValue}>{gamification.current_level}</Text>
      </View>
      <View style={styles.paramRow}>
        <Text style={styles.paramLabel}>Total Points</Text>
        <Text style={styles.paramValue}>{gamification.xp_total.toLocaleString()}</Text>
      </View>
      <View style={styles.paramRow}>
        <Text style={styles.paramLabel}>Badges Unlocked</Text>
        <Text style={styles.paramValue}>{gamification.total_badges_unlocked}</Text>
      </View>
      {badges && badges.length > 0 && (
        <BadgeGrid badges={badges} />
      )}
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  paramRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  paramLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  paramValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '600',
  },
});
