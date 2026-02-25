import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { getDefaultTargets } from '../../constants/onboardingData';
import { OnboardingV2Answers, UserTargets, Challenge, StrategyMode } from '../../types';
import { theme } from '../../constants/theme';

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, min, max, step, unit, onChange }: SliderRowProps) {
  return (
    <View style={styles.sliderRow}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={styles.sliderValue}>
          {value}{unit}
        </Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.surfaceLight}
        thumbTintColor={theme.colors.primary}
      />
    </View>
  );
}

export default function TargetsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name: string;
    target_exam_year: string;
    attempt_number: string;
    user_type: string;
    challenges: string;
    chosen_mode: string;
    exam_date: string;
  }>();

  const answers: OnboardingV2Answers = useMemo(() => ({
    name: params.name || '',
    target_exam_year: parseInt(params.target_exam_year, 10),
    attempt_number: params.attempt_number as OnboardingV2Answers['attempt_number'],
    user_type: params.user_type as OnboardingV2Answers['user_type'],
    challenges: (params.challenges?.split(',') || []) as Challenge[],
  }), [params]);

  const chosenMode = (params.chosen_mode || 'balanced') as StrategyMode;
  const defaults = useMemo(() => getDefaultTargets(answers, chosenMode), [answers, chosenMode]);
  const [targets, setTargets] = useState<UserTargets>(defaults);

  const update = (key: keyof UserTargets, val: number) =>
    setTargets((prev) => ({ ...prev, [key]: val }));

  return (
    <QuestionScreen
      step={7}
      totalSteps={10}
      chatMessage="Here are your personalized targets. Adjust if you like!"
      question="Daily & weekly targets"
      subtitle="We'll track your progress against these"
      nextLabel="Looks good"
      onNext={() =>
        router.push({
          pathname: '/onboarding/promise',
          params: { ...params, targets: JSON.stringify(targets) },
        })
      }
    >
      <View style={styles.sliders}>
        <SliderRow
          label="Daily study hours"
          value={targets.daily_hours}
          min={2}
          max={14}
          step={0.5}
          unit="h"
          onChange={(v) => update('daily_hours', v)}
        />
        <SliderRow
          label="New topics/day"
          value={targets.daily_new_topics}
          min={1}
          max={5}
          step={1}
          unit=""
          onChange={(v) => update('daily_new_topics', v)}
        />
        <SliderRow
          label="Revisions/week"
          value={targets.weekly_revisions}
          min={1}
          max={7}
          step={1}
          unit=""
          onChange={(v) => update('weekly_revisions', v)}
        />
        <SliderRow
          label="Tests/month"
          value={targets.weekly_tests}
          min={1}
          max={4}
          step={1}
          unit=""
          onChange={(v) => update('weekly_tests', v)}
        />
        <SliderRow
          label="Answer writing/week"
          value={targets.weekly_answer_writing}
          min={0}
          max={5}
          step={1}
          unit=""
          onChange={(v) => update('weekly_answer_writing', v)}
        />
        <SliderRow
          label="CA hours/week"
          value={targets.weekly_ca_hours}
          min={2}
          max={10}
          step={0.5}
          unit="h"
          onChange={(v) => update('weekly_ca_hours', v)}
        />
      </View>
    </QuestionScreen>
  );
}

const styles = StyleSheet.create({
  sliders: {
    gap: theme.spacing.md,
  },
  sliderRow: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  sliderLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  sliderValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  slider: {
    height: 36,
  },
});
