import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export function ProgressRing({
  percentage,
  size = 64,
  strokeWidth = 4,
  color = theme.colors.primary,
  label,
}: ProgressRingProps) {
  const pct = Math.max(0, Math.min(100, percentage));
  const innerSize = size - strokeWidth * 2;

  // Use a simple bordered circle with a mask to show progress
  // For a non-SVG approach: show percentage + circular border
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.outerRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: theme.colors.border,
          },
        ]}
      />
      <View
        style={[
          styles.progressArc,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderTopColor: pct > 25 ? color : 'transparent',
            borderRightColor: pct > 50 ? color : 'transparent',
            borderBottomColor: pct > 75 ? color : 'transparent',
            borderLeftColor: pct > 0 ? color : 'transparent',
            transform: [{ rotate: '-45deg' }],
          },
        ]}
      />
      <View style={[styles.inner, { width: innerSize, height: innerSize, borderRadius: innerSize / 2 }]}>
        <Text style={[styles.pctText, { fontSize: size > 48 ? 14 : 10 }]}>{Math.round(pct)}%</Text>
        {label && <Text style={styles.label}>{label}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    position: 'absolute',
  },
  progressArc: {
    position: 'absolute',
  },
  inner: {
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pctText: {
    fontWeight: '800',
    color: theme.colors.text,
  },
  label: {
    fontSize: 8,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
});
