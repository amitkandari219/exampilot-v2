import React from 'react';
import { View, ViewStyle, StyleSheet, StyleProp } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useMemo } from 'react';

interface V4CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  bordered?: boolean;
}

export function V4Card({ children, style, bordered }: V4CardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View
      style={[
        styles.card,
        bordered && { borderWidth: 1, borderColor: theme.colors.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>['theme']) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
    },
  });
}
