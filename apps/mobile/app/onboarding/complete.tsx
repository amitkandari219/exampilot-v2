import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { ChatBubble } from '../../components/onboarding/ChatBubble';
import { api } from '../../lib/api';
import { OnboardingV2Answers, OnboardingV2Payload, UserTargets, StrategyMode, Challenge } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';

export default function CompleteScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const params = useLocalSearchParams<{
    name: string;
    target_exam_year: string;
    attempt_number: string;
    user_type: string;
    challenges: string;
    chosen_mode: string;
    exam_date: string;
    targets: string;
    promise_text: string;
  }>();

  const queryClient = useQueryClient();
  const [submitted, setSubmitted] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const targets: UserTargets = useMemo(
    () => JSON.parse(params.targets || '{}'),
    [params.targets]
  );

  const answers: OnboardingV2Answers = useMemo(() => ({
    name: params.name || '',
    target_exam_year: parseInt(params.target_exam_year, 10),
    attempt_number: params.attempt_number as OnboardingV2Answers['attempt_number'],
    user_type: params.user_type as OnboardingV2Answers['user_type'],
    challenges: (params.challenges?.split(',') || []) as Challenge[],
  }), [params]);

  useEffect(() => {
    // Play animations
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Submit to API
    const payload: OnboardingV2Payload = {
      answers,
      chosen_mode: params.chosen_mode as StrategyMode,
      targets,
      promise_text: params.promise_text || undefined,
      exam_date: params.exam_date || '',
    };

    api.completeOnboarding(payload)
      .then(() => setSubmitted(true))
      .catch(() => setSubmitted(true)); // Navigate forward even on error
  }, []);

  const modeNames: Record<string, string> = {
    balanced: 'Balanced',
    aggressive: 'Aggressive',
    conservative: 'Conservative',
    working_professional: 'Working Professional',
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ChatBubble
          message={`Welcome aboard, ${params.name}! Your ExamPilot journey begins now.`}
        />

        <View style={styles.center}>
          <Animated.View style={[styles.checkCircle, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.checkmark}>✓</Text>
          </Animated.View>

          <Animated.View style={[styles.summaryCard, { opacity: fadeAnim }]}>
            <Text style={styles.summaryTitle}>Your setup</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Strategy</Text>
              <Text style={styles.summaryValue}>{modeNames[params.chosen_mode] || params.chosen_mode}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Exam date</Text>
              <Text style={styles.summaryValue}>{params.exam_date}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Daily target</Text>
              <Text style={styles.summaryValue}>{targets.daily_hours}h / day</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>New topics</Text>
              <Text style={styles.summaryValue}>{targets.daily_new_topics} / day</Text>
            </View>
          </Animated.View>
        </View>

        <TouchableOpacity
          style={[styles.startButton, !submitted && styles.startButtonDisabled]}
          disabled={!submitted}
          onPress={() => {
            queryClient.removeQueries();
            queryClient.clear();
            router.replace('/');
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>{submitted ? 'Start Preparing' : 'Setting up...'}</Text>
        </TouchableOpacity>
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
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  checkmark: {
    fontSize: 40,
    fontWeight: '700',
    color: theme.colors.background,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '100%',
    gap: theme.spacing.md,
  },
  summaryTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.background,
  },
});
