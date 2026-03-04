import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { V4Card } from '../v4/V4Card';

interface GuidedJourneyCardProps {
  day: number;
}

const DAY_CHECKLISTS: Record<number, string[]> = {
  1: ['Open the planner tab', 'Start your first topic', 'Mark it complete'],
  2: ['Complete 2 topics today', 'Check the revisions tab'],
  3: ['Check the Progress tab', 'Finish all planned tasks'],
};

export function GuidedJourneyCard({ day }: GuidedJourneyCardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const steps = DAY_CHECKLISTS[day] || DAY_CHECKLISTS[1];
  const [checked, setChecked] = useState<boolean[]>(() => steps.map(() => false));

  useEffect(() => {
    loadChecked();
  }, [day]);

  const loadChecked = async () => {
    const results = await Promise.all(
      steps.map((_, i) => AsyncStorage.getItem(`journey_day_${day}_step_${i}`))
    );
    setChecked(results.map(v => v === 'true'));
  };

  const toggleStep = useCallback(async (index: number) => {
    const newChecked = [...checked];
    newChecked[index] = !newChecked[index];
    setChecked(newChecked);
    const key = `journey_day_${day}_step_${index}`;
    if (newChecked[index]) {
      await AsyncStorage.setItem(key, 'true');
    } else {
      await AsyncStorage.removeItem(key);
    }
  }, [checked, day]);

  const allDone = checked.every(Boolean);

  return (
    <V4Card style={{ borderWidth: 1, borderColor: theme.colors.accent + '44', marginBottom: 12 }}>
      <Text style={styles.title}>Your Journey — Day {day}</Text>
      {steps.map((step, i) => (
        <TouchableOpacity
          key={i}
          style={styles.stepRow}
          onPress={() => toggleStep(i)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, checked[i] && styles.checkboxChecked]}>
            {checked[i] && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={[styles.stepText, checked[i] && styles.stepTextDone]}>
            {step}
          </Text>
        </TouchableOpacity>
      ))}
      {allDone && (
        <Text style={styles.doneText}>Day {day} complete!</Text>
      )}
    </V4Card>
  );
}

const createStyles = (theme: ReturnType<typeof import('../../context/ThemeContext').useTheme>['theme']) =>
  StyleSheet.create({
    title: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.accent,
      marginBottom: 10,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: theme.colors.textMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    checkboxChecked: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    checkmark: {
      color: theme.colors.background,
      fontSize: 13,
      fontWeight: '700',
    },
    stepText: {
      fontSize: 13,
      color: theme.colors.text,
    },
    stepTextDone: {
      color: theme.colors.textMuted,
      textDecorationLine: 'line-through',
    },
    doneText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.green,
      marginTop: 8,
      textAlign: 'center',
    },
  });
