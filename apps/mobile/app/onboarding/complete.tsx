import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { classifyModeV2 } from '../../lib/classify';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import type { OnboardingV2Answers, OnboardingV2Payload, UserTargets, UserType } from '../../types';

function computeExamDate(cycle: string): string {
  const now = new Date();
  const thisYear = now.getFullYear();
  // Prelims typically in late May / early June
  if (cycle === 'next_year') {
    return `${thisYear + 1}-06-01`;
  }
  // 'this_year' or 'not_sure' → nearest cycle
  const thisYearDate = new Date(`${thisYear}-06-01`);
  if (now < thisYearDate) {
    return `${thisYear}-06-01`;
  }
  return `${thisYear + 1}-06-01`;
}

function attemptToKey(attempt: string): 'first' | 'second' | 'third_plus' {
  switch (attempt) {
    case '1': return 'first';
    case '2': return 'second';
    default: return 'third_plus';
  }
}

export default function CompleteScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{
    attempt: string;
    user_type: string;
    cycle: string;
    study_approach: string;
    daily_hours: string;
    weak_subjects: string;
  }>();

  const [error, setError] = useState<string | null>(null);
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Start spinner
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, [spinAnim]);

  // Auto-submit on mount
  useEffect(() => {
    const attemptKey = attemptToKey(params.attempt || '1');
    const dailyHours = parseFloat(params.daily_hours || '6');
    const userType = (params.user_type || 'student') as UserType;

    const answers: OnboardingV2Answers = {
      name: 'Student', // V4 collects name in settings, not onboarding
      target_exam_year: params.cycle === 'next_year' ? new Date().getFullYear() + 1 : new Date().getFullYear(),
      attempt_number: attemptKey,
      user_type: userType,
      challenges: [], // V4 doesn't collect challenges separately
    };

    const chosenMode = classifyModeV2(answers, {
      daily_hours: dailyHours,
      study_approach: params.study_approach === 'sequential' ? 'thorough' : 'selective',
    });

    const targets: UserTargets = {
      daily_hours: dailyHours,
      daily_new_topics: dailyHours >= 7 ? 3 : 2,
      weekly_revisions: 3,
      weekly_tests: 1,
      weekly_answer_writing: 2,
      weekly_ca_hours: 4,
    };

    const examDate = computeExamDate(params.cycle || 'this_year');

    const weakSubjects = params.weak_subjects
      ? params.weak_subjects.split(',').filter(Boolean)
      : [];

    const payload = {
      answers,
      chosen_mode: chosenMode,
      targets,
      exam_date: examDate,
      study_approach: params.study_approach || 'mixed',
      ...(weakSubjects.length > 0 ? { weak_subjects: weakSubjects } : {}),
    };

    api.completeOnboarding(payload)
      .then(() => {
        queryClient.removeQueries();
        queryClient.clear();
        if (Platform.OS === 'web') {
          window.location.href = '/';
        } else {
          router.replace('/');
        }
      })
      .catch((err) => {
        setError(err?.message || 'Something went wrong. Please try again.');
        // Navigate anyway after a delay
        setTimeout(() => {
          queryClient.removeQueries();
          queryClient.clear();
          if (Platform.OS === 'web') {
            window.location.href = '/';
          } else {
            router.replace('/');
          }
        }, 2000);
      });
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
          <View style={styles.spinnerArc} />
        </Animated.View>
        <Text style={styles.title}>Generating your UPSC plan...</Text>
        <Text style={styles.subtitle}>Setting up strategy, planner, and revision schedule</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  spinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
  },
  spinnerArc: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: theme.colors.accent,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: theme.colors.danger,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
});
