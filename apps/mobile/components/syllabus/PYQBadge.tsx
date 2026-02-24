import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface PYQBadgeProps {
  weight: number;
}

const DOT_COLORS: Record<number, string> = {
  1: theme.colors.textMuted,
  2: theme.colors.primary,
  3: theme.colors.success,
  4: theme.colors.warning,
  5: '#F97316',
};

const EMPTY_COLOR = '#1E293B';

export function PYQBadge({ weight }: PYQBadgeProps) {
  const clampedWeight = Math.max(1, Math.min(5, Math.round(weight)));

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((level) => {
        const isFilled = level <= clampedWeight;
        return (
          <View
            key={level}
            style={[
              styles.dot,
              {
                backgroundColor: isFilled ? DOT_COLORS[level] : EMPTY_COLOR,
                borderColor: isFilled ? DOT_COLORS[level] : theme.colors.border,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
  },
});
