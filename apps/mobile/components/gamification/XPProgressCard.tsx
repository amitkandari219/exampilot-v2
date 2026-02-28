import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import { GamificationProfile } from '../../types';

interface Props {
  profile: GamificationProfile;
}

export function XPProgressCard({ profile }: Props) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const progressPct = profile.xp_for_next_level > 0
    ? Math.min(1, profile.xp_progress_in_level / profile.xp_for_next_level)
    : 0;

  const latestBadge = profile.recent_badges.length > 0 ? profile.recent_badges[0] : null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>LEVEL & POINTS</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Level {profile.current_level}</Text>
        </View>
      </View>

      <Text style={styles.xpHero}>{profile.xp_total.toLocaleString()} Points</Text>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progressPct * 100}%` }]} />
      </View>
      <Text style={styles.progressLabel}>
        {profile.xp_progress_in_level.toLocaleString()}/{profile.xp_for_next_level.toLocaleString()} → Level {profile.current_level + 1}
      </Text>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <View style={styles.footerItem}>
          <Text style={styles.footerValue}>+{profile.xp_today}</Text>
          <Text style={styles.footerLabel}>today</Text>
        </View>
        {latestBadge && (
          <View style={styles.footerItem}>
            <Text style={styles.footerValue} numberOfLines={1}>{latestBadge.name}</Text>
            <Text style={styles.footerLabel}>latest</Text>
          </View>
        )}
        <View style={styles.footerItem}>
          <Text style={styles.footerValue}>{profile.total_badges_unlocked}</Text>
          <Text style={styles.footerLabel}>badges</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  sectionLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    letterSpacing: 1,
  },
  levelBadge: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  levelText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  xpHero: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  footerItem: {
    alignItems: 'center',
    flex: 1,
  },
  footerValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.text,
  },
  footerLabel: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});
