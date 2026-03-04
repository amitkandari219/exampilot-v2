import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';

export default function TargetsScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const params = useLocalSearchParams<{
    attempt: string;
    user_type: string;
    cycle: string;
    study_approach: string;
  }>();

  const [hours, setHours] = useState(6);

  return (
    <QuestionScreen
      step={4}
      totalSteps={6}
      question="How many hours can you realistically study daily?"
      subtitle="Be honest. Not aspirational. You can always increase later."
      nextLabel="Continue →"
      onNext={() =>
        router.push({
          pathname: '/onboarding/weaksubjects',
          params: { ...params, daily_hours: String(hours) },
        })
      }
    >
      <View style={styles.hoursDisplay}>
        <Text style={styles.hoursValue}>{hours}</Text>
        <Text style={styles.hoursUnit}>hrs/day</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={2}
        maximumValue={12}
        step={0.5}
        value={hours}
        onValueChange={setHours}
        minimumTrackTintColor={theme.colors.accent}
        maximumTrackTintColor={theme.colors.border}
        thumbTintColor={theme.colors.accent}
      />
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabel}>2 hrs</Text>
        <Text style={styles.sliderLabel}>12 hrs</Text>
      </View>
    </QuestionScreen>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  hoursDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 20,
  },
  hoursValue: {
    fontSize: 48,
    fontWeight: '800',
    color: theme.colors.accent,
  },
  hoursUnit: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginLeft: 8,
    marginBottom: 8,
  },
  slider: {
    height: 40,
    width: '100%',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
});
