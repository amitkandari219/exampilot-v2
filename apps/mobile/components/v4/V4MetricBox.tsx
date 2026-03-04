import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface V4MetricBoxProps {
  value: string | number;
  label: string;
  sublabel?: string;
  valueColor?: string;
}

export function V4MetricBox({ value, label, sublabel, valueColor }: V4MetricBoxProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={[styles.value, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
      {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>['theme']) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.card,
      borderRadius: 14,
      padding: 14,
    },
    value: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.text,
    },
    label: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    sublabel: {
      fontSize: 10,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
  });
}
