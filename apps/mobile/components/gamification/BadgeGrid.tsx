import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { BadgeWithStatus, BadgeCategory } from '../../types';

interface Props {
  badges: BadgeWithStatus[];
}

const CATEGORY_LABELS: Record<BadgeCategory, string> = {
  streak: 'Streak',
  study: 'Study',
  milestone: 'XP Milestones',
  recovery: 'Recovery',
  special: 'Special',
};

const CATEGORY_ORDER: BadgeCategory[] = ['streak', 'study', 'milestone', 'recovery', 'special'];

export function BadgeGrid({ badges }: Props) {
  const grouped = CATEGORY_ORDER
    .map((cat) => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      items: badges.filter((b) => b.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <View>
      {grouped.map((group) => (
        <View key={group.category} style={styles.group}>
          <Text style={styles.categoryLabel}>{group.label}</Text>
          <View style={styles.grid}>
            {group.items.map((badge) => (
              <View
                key={badge.slug}
                style={[styles.badgeTile, !badge.unlocked && styles.locked]}
              >
                <Text style={[styles.badgeIcon, !badge.unlocked && styles.lockedText]}>
                  {badge.unlocked ? badge.icon_name : '?'}
                </Text>
                <Text
                  style={[styles.badgeName, !badge.unlocked && styles.lockedText]}
                  numberOfLines={1}
                >
                  {badge.name}
                </Text>
                {badge.unlocked && badge.xp_reward > 0 && (
                  <Text style={styles.badgeXp}>+{badge.xp_reward} XP</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    marginTop: theme.spacing.sm,
  },
  categoryLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: theme.spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  badgeTile: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    alignItems: 'center',
    width: 80,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  locked: {
    opacity: 0.5,
  },
  badgeIcon: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    marginBottom: 2,
  },
  badgeName: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  badgeXp: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.success,
    marginTop: 2,
  },
  lockedText: {
    color: theme.colors.textMuted,
  },
});
