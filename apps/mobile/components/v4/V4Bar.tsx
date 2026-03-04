import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface V4BarProps {
  progress: number;
  height?: number;
  color?: string;
  trackColor?: string;
  animated?: boolean;
}

export function V4Bar({ progress, height = 6, color, trackColor, animated = true }: V4BarProps) {
  const { theme } = useTheme();
  const animValue = useRef(new Animated.Value(0)).current;
  const clamped = Math.min(100, Math.max(0, progress));

  useEffect(() => {
    if (animated) {
      Animated.timing(animValue, {
        toValue: clamped,
        duration: 600,
        useNativeDriver: false,
      }).start();
    } else {
      animValue.setValue(clamped);
    }
  }, [clamped, animated, animValue]);

  const styles = useMemo(() => createStyles(theme, height, trackColor), [theme, height, trackColor]);

  const widthInterpolated = animValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.track}>
      <Animated.View
        style={[
          styles.fill,
          { width: widthInterpolated, backgroundColor: color || theme.colors.accent },
        ]}
      />
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>['theme'], height: number, trackColor?: string) {
  return StyleSheet.create({
    track: {
      height,
      borderRadius: height / 2,
      backgroundColor: trackColor || theme.colors.border,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: height / 2,
    },
  });
}
