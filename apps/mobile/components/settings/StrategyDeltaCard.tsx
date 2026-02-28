import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import type { StrategyDelta } from '../../types';

interface StrategyDeltaCardProps {
  data: StrategyDelta;
}

export function StrategyDeltaCard({ data }: StrategyDeltaCardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!data.has_previous || data.items.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>What changed this time</Text>
      {data.items.map((item: StrategyDelta['items'][0]) => (
        <View key={item.param} style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>
          <View style={styles.values}>
            <Text style={styles.previous}>{String(item.previous)}</Text>
            <Text style={styles.arrow}>{'\u2192'}</Text>
            <Text style={styles.current}>{String(item.current)}</Text>
          </View>
        </View>
      ))}
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
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  row: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  label: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  values: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  previous: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  arrow: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  current: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
