import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import { Sparkline } from '../common/Sparkline';

interface BufferBankCardProps {
  balance: number;
  capacity: number;
  lastTransaction?: { type: string; amount: number } | null;
  history?: number[];
}

export function BufferBankCard({ balance, capacity, lastTransaction, history }: BufferBankCardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const fillPct = capacity > 0 ? Math.min(1, balance / (capacity * 100)) : 0;
  const color = fillPct > 0.5 ? theme.colors.success : fillPct > 0.2 ? theme.colors.warning : theme.colors.error;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>Buffer Bank</Text>
        {lastTransaction && (
          <Text style={[styles.txText, { color: lastTransaction.amount >= 0 ? theme.colors.success : theme.colors.error }]}>
            {lastTransaction.amount >= 0 ? '+' : ''}{lastTransaction.amount.toFixed(1)}
          </Text>
        )}
      </View>

      <View style={styles.row}>
        <View>
          <Text style={[styles.balance, { color }]}>{balance.toFixed(1)}</Text>
          <Text style={styles.unit}>days banked</Text>
        </View>
        {history && history.length > 1 && (
          <Sparkline data={history} color={color} />
        )}
      </View>

      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${fillPct * 100}%`, backgroundColor: color }]} />
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
  txText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balance: {
    fontSize: 28,
    fontWeight: '800',
  },
  unit: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  progressBg: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    marginTop: theme.spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
