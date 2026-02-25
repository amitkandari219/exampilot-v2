import React, {  useState , useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import { CAStats } from '../../types';
import { CALogSheet } from './CALogSheet';

interface Props {
  stats: CAStats;
}

export function CADashboardCard({ stats }: Props) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [showLog, setShowLog] = useState(false);

  const streakColor = stats.streak.current_streak >= 7
    ? theme.colors.success
    : stats.streak.current_streak >= 3
      ? theme.colors.warning
      : theme.colors.textMuted;

  return (
    <>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.label}>CURRENT AFFAIRS</Text>
            <View style={styles.streakRow}>
              <Text style={[styles.streakCount, { color: streakColor }]}>
                {stats.streak.current_streak}
              </Text>
              <Text style={styles.streakUnit}>day streak</Text>
            </View>
          </View>
          <View style={styles.rightCol}>
            {stats.today_logged ? (
              <View style={styles.loggedBadge}>
                <Text style={styles.loggedText}>Logged</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.logBtn} onPress={() => setShowLog(true)}>
                <Text style={styles.logBtnText}>Log CA</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total_days_logged}</Text>
            <Text style={styles.statLabel}>days</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total_hours}h</Text>
            <Text style={styles.statLabel}>total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.streak.best_streak}</Text>
            <Text style={styles.statLabel}>best</Text>
          </View>
        </View>

        {stats.today_logged && (
          <TouchableOpacity style={styles.editRow} onPress={() => setShowLog(true)}>
            <Text style={styles.editText}>
              Today: {stats.today_log?.hours_spent || 0}h
              {stats.today_log?.tags && stats.today_log.tags.length > 0
                ? ` - ${stats.today_log.tags.length} subjects`
                : ''}
            </Text>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <CALogSheet visible={showLog} onClose={() => setShowLog(false)} existing={stats.today_log} />
    </>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: theme.fontSize.xxs,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    letterSpacing: 1,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  streakCount: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
  },
  streakUnit: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginLeft: 4,
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  loggedBadge: {
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  loggedText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.success,
  },
  logBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
  },
  logBtnText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.background,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '800',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
  },
  editRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  editText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  editLink: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
