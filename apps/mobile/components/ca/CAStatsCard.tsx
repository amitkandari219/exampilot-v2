import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import type { CAStats, CASubjectGap } from '../../types';

interface Props {
  stats: CAStats;
  gaps?: CASubjectGap[];
}

export function CAStatsCard({ stats, gaps }: Props) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const daysInMonth = stats.monthly_heatmap.length;
  const firstDayOfMonth = new Date(stats.monthly_heatmap[0]?.date || new Date());
  const startDayOffset = firstDayOfMonth.getDay(); // 0=Sun

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Current Affairs</Text>

      {/* Streak */}
      <View style={styles.streakRow}>
        <View style={styles.streakItem}>
          <Text style={styles.streakValue}>{stats.streak.current_streak}</Text>
          <Text style={styles.streakLabel}>Current</Text>
        </View>
        <View style={styles.streakItem}>
          <Text style={styles.streakValue}>{stats.streak.best_streak}</Text>
          <Text style={styles.streakLabel}>Best</Text>
        </View>
        <View style={styles.streakItem}>
          <Text style={styles.streakValue}>{stats.total_hours}h</Text>
          <Text style={styles.streakLabel}>Total</Text>
        </View>
        <View style={styles.streakItem}>
          <Text style={styles.streakValue}>{stats.total_days_logged}</Text>
          <Text style={styles.streakLabel}>Days</Text>
        </View>
      </View>

      {/* Monthly Heatmap */}
      <Text style={styles.sectionLabel}>Monthly Heatmap</Text>
      <View style={styles.dayLabels}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <Text key={i} style={styles.dayLabel}>{d}</Text>
        ))}
      </View>
      <View style={styles.heatmapGrid}>
        {/* Empty cells for offset */}
        {Array.from({ length: startDayOffset }).map((_, i) => (
          <View key={`empty-${i}`} style={styles.heatmapCell} />
        ))}
        {stats.monthly_heatmap.map((day) => (
          <View
            key={day.date}
            style={[
              styles.heatmapCell,
              day.completed ? styles.heatmapCompleted : styles.heatmapMissed,
            ]}
          />
        ))}
      </View>

      {/* Subject Distribution */}
      {stats.subject_distribution.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Subject Distribution</Text>
          {stats.subject_distribution.map((s) => (
            <View key={s.subject_id} style={styles.barRow}>
              <Text style={styles.barLabel} numberOfLines={1}>{s.subject_name}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[styles.barFill, { width: `${Math.min(s.percentage, 100)}%` }]}
                />
              </View>
              <Text style={styles.barPct}>{s.percentage}%</Text>
            </View>
          ))}
        </>
      )}

      {/* Subject Gaps */}
      {gaps && gaps.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Undercovered Subjects</Text>
          {gaps.map((g) => (
            <View key={g.subject_id} style={styles.gapRow}>
              <Text style={styles.gapAlert}>{g.alert}</Text>
            </View>
          ))}
        </>
      )}
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
  title: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
  },
  streakItem: {
    alignItems: 'center',
  },
  streakValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    color: theme.colors.text,
  },
  streakLabel: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
  },
  sectionLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  dayLabels: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  dayLabel: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  heatmapCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  heatmapCompleted: {
    backgroundColor: theme.colors.success + '40',
    borderRadius: 4,
    margin: 1,
  },
  heatmapMissed: {
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    margin: 1,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  barLabel: {
    width: 90,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.text,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 4,
    marginHorizontal: theme.spacing.xs,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  barPct: {
    width: 32,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    textAlign: 'right',
  },
  gapRow: {
    backgroundColor: theme.colors.warning + '15',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: 4,
  },
  gapAlert: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.warning,
  },
});
