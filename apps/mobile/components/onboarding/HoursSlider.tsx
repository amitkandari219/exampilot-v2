import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';

interface HoursSliderProps {
  value: number;
  onValueChange: (val: number) => void;
}

export function HoursSlider({ value, onValueChange }: HoursSliderProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <Text style={styles.hoursDisplay}>{value}</Text>
      <Text style={styles.hoursLabel}>hours per day</Text>

      <View style={styles.sliderRow}>
        <Text style={styles.bound}>2</Text>
        <Slider
          style={styles.slider}
          minimumValue={2}
          maximumValue={10}
          step={0.5}
          value={value}
          onValueChange={onValueChange}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.surfaceLight}
          thumbTintColor={theme.colors.primary}
        />
        <Text style={styles.bound}>10</Text>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  hoursDisplay: {
    fontSize: 72,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  hoursLabel: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: theme.spacing.sm,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  bound: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    width: 24,
    textAlign: 'center',
  },
});
