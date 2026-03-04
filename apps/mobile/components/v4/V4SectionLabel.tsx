import React from 'react';
import { Text, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useMemo } from 'react';

interface V4SectionLabelProps {
  text: string;
  style?: StyleProp<TextStyle>;
}

export function V4SectionLabel({ text, style }: V4SectionLabelProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return <Text style={[styles.label, style]}>{text}</Text>;
}

function createStyles(theme: ReturnType<typeof useTheme>['theme']) {
  return StyleSheet.create({
    label: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      color: theme.colors.textMuted,
    },
  });
}
