import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function Sparkline({ data, width = 80, height = 24, color }: SparklineProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const resolvedColor = color ?? theme.colors.primary;
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const barWidth = Math.max(2, (width - (data.length - 1) * 2) / data.length);

  return (
    <View style={[styles.container, { width, height }]}>
      {data.map((value, index) => {
        const normalizedHeight = ((value - min) / range) * height * 0.8 + height * 0.2;
        return (
          <View
            key={index}
            style={[
              styles.bar,
              {
                width: barWidth,
                height: normalizedHeight,
                backgroundColor: resolvedColor,
                opacity: index === data.length - 1 ? 1 : 0.5,
                marginLeft: index > 0 ? 2 : 0,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bar: {
    borderRadius: 1,
  },
});
