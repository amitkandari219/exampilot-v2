import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { Theme } from '../../constants/theme';

type TipVariant = 'info' | 'warn' | 'success';

interface V4TipProps {
  message: string;
  variant?: TipVariant;
  dismissible?: boolean;
}

function getVariantColors(theme: Theme, variant: TipVariant): { bg: string; fg: string; icon: string } {
  switch (variant) {
    case 'info':    return { bg: theme.colors.accentDim, fg: theme.colors.accent, icon: 'i' };
    case 'warn':    return { bg: theme.colors.warnDim,   fg: theme.colors.warn,   icon: '!' };
    case 'success': return { bg: theme.colors.greenDim,  fg: theme.colors.green,  icon: '✓' };
  }
}

export function V4Tip({ message, variant = 'info', dismissible }: V4TipProps) {
  const [dismissed, setDismissed] = useState(false);
  const { theme } = useTheme();
  const colors = useMemo(() => getVariantColors(theme, variant), [theme, variant]);
  const styles = useMemo(() => createStyles(theme, colors), [theme, colors]);

  if (dismissed) return null;

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>{colors.icon}</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
      {dismissible && (
        <TouchableOpacity onPress={() => setDismissed(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.dismiss}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>['theme'], colors: { bg: string; fg: string }) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bg,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    iconCircle: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.fg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.background,
    },
    message: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.text,
      lineHeight: 18,
    },
    dismiss: {
      fontSize: 14,
      color: theme.colors.textMuted,
      paddingLeft: 4,
    },
  });
}
