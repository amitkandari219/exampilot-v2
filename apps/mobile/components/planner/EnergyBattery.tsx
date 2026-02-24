import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import type { EnergyLevel } from '../../types';

interface EnergyBatteryProps {
  level: EnergyLevel;
}

const LEVEL_CONFIG: Record<EnergyLevel, { color: string; fill: number }> = {
  full: { color: theme.colors.success, fill: 1 },
  moderate: { color: theme.colors.warning, fill: 0.66 },
  low: { color: theme.colors.orange, fill: 0.33 },
  empty: { color: theme.colors.error, fill: 0 },
};

export function EnergyBattery({ level }: EnergyBatteryProps) {
  const { color, fill } = LEVEL_CONFIG[level];

  return (
    <View style={styles.container}>
      <View style={[styles.body, { borderColor: color }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              width: `${fill * 100}%`,
            },
          ]}
        />
      </View>
      <View style={[styles.tip, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  body: {
    width: 32,
    height: 16,
    borderWidth: 1.5,
    borderRadius: 3,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fill: {
    height: '100%',
    borderRadius: 1,
  },
  tip: {
    width: 3,
    height: 8,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    marginLeft: 1,
  },
});
