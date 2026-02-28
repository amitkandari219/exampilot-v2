import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import { Sparkline } from '../common/Sparkline';
import { InfoTooltip } from '../common/InfoTooltip';
import { VelocityStatus } from '../../types';

interface VelocityCardProps {
  velocityRatio: number;
  status: VelocityStatus;
  trend: string | null;
  projectedDate: string | null;
  streak: { current_count: number; best_count: number } | null;
  history?: number[];
}

function getStatusColors(theme: Theme) {
  return {
    ahead: theme.colors.success,
    on_track: theme.colors.primary,
    behind: theme.colors.warning,
    at_risk: theme.colors.error,
  };
}

const statusLabels: Record<VelocityStatus, string> = {
  ahead: 'Ahead',
  on_track: 'On Track',
  behind: 'Behind',
  at_risk: 'Needs Attention',
};

export function VelocityCard({ velocityRatio, status, trend, projectedDate, streak, history }: VelocityCardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const color = getStatusColors(theme)[status];
  const trendArrow = trend === 'improving' ? '+' : trend === 'declining' ? '-' : '=';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.label}>Study Speed</Text>
          <InfoTooltip text="How fast you're covering the syllabus compared to what's needed. 1.0x means you're exactly on pace. Above 1.0x = ahead, below = falling behind." />
        </View>
        <View style={[styles.badge, { backgroundColor: color + '20' }]}>
          <Text style={[styles.badgeText, { color }]}>{statusLabels[status]}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View>
          <Text style={[styles.ratio, { color }]}>{velocityRatio.toFixed(2)}x</Text>
          <Text style={styles.trendText}>{trendArrow} {trend || 'stable'}</Text>
        </View>
        {history && history.length > 1 && (
          <Sparkline data={history} color={color} />
        )}
      </View>

      <View style={styles.footer}>
        {projectedDate && (
          <Text style={styles.footerText}>Projected: {projectedDate}</Text>
        )}
        {streak && streak.current_count > 0 && (
          <Text style={styles.footerText}>Streak: {streak.current_count}d</Text>
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratio: {
    fontSize: 28,
    fontWeight: '800',
  },
  trendText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  footerText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
});
