import React, { useMemo } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { Theme } from '../../constants/theme';

type PillVariant = 'accent' | 'warn' | 'danger' | 'green' | 'purple' | 'muted';

interface V4PillProps {
  label: string;
  variant?: PillVariant;
  bgColor?: string;
  textColor?: string;
}

function getVariantColors(theme: Theme, variant: PillVariant): { bg: string; fg: string } {
  switch (variant) {
    case 'accent':  return { bg: theme.colors.accentDim, fg: theme.colors.accent };
    case 'warn':    return { bg: theme.colors.warnDim,   fg: theme.colors.warn };
    case 'danger':  return { bg: theme.colors.dangerDim, fg: theme.colors.danger };
    case 'green':   return { bg: theme.colors.greenDim,  fg: theme.colors.green };
    case 'purple':  return { bg: theme.colors.purpleDim, fg: theme.colors.purple };
    case 'muted':   return { bg: theme.colors.border,    fg: theme.colors.textSecondary };
  }
}

export function V4Pill({ label, variant = 'accent', bgColor, textColor }: V4PillProps) {
  const { theme } = useTheme();
  const colors = useMemo(() => getVariantColors(theme, variant), [theme, variant]);

  return (
    <View style={[styles.pill, { backgroundColor: bgColor || colors.bg }]}>
      <Text style={[styles.label, { color: textColor || colors.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
