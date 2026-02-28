import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';

interface MockCutoffBadgeProps {
  cutoffDelta: number | null;
}

export function MockCutoffBadge({ cutoffDelta }: MockCutoffBadgeProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (cutoffDelta == null) return null;

  const isAbove = cutoffDelta >= 0;
  const color = isAbove ? theme.colors.success : theme.colors.error;
  const prefix = isAbove ? '+' : '';

  return (
    <View style={[styles.badge, { backgroundColor: color + '18' }]}>
      <Text style={[styles.text, { color }]}>
        {prefix}{cutoffDelta} vs cutoff
      </Text>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  badge: {
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },
});
