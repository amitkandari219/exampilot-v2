import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { getPromiseText } from '../../constants/onboardingData';
import { UserTargets } from '../../types';
import { theme } from '../../constants/theme';

export default function PromiseScreen() {
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
  }>();

  const targets: UserTargets = useMemo(
    () => JSON.parse(params.targets || '{}'),
    [params.targets]
  );

  const defaultText = useMemo(
    () => getPromiseText(params.name || '', targets),
    [params.name, targets]
  );

  const [promiseText, setPromiseText] = useState(defaultText);
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const navigateNext = (text?: string) => {
    router.push({
      pathname: '/onboarding/complete',
      params: {
        ...params,
        promise_text: text || '',
      },
    });
  };

  return (
    <QuestionScreen
      step={8}
      totalSteps={10}
      chatMessage="One last thing. Making a commitment makes you 3x more likely to succeed."
      question="Your commitment"
      showNext={false}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.pledge}>MY PLEDGE</Text>
        </View>

        <TextInput
          style={styles.textArea}
          value={promiseText}
          onChangeText={setPromiseText}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          placeholderTextColor={theme.colors.textMuted}
        />

        <Text style={styles.date}>{today}</Text>
      </View>

      <TouchableOpacity
        style={styles.promiseButton}
        onPress={() => navigateNext(promiseText)}
        activeOpacity={0.8}
      >
        <Text style={styles.promiseButtonText}>I Promise</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigateNext()}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </QuestionScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  pledge: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 2,
  },
  textArea: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 24,
    minHeight: 120,
  },
  date: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    textAlign: 'right',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  promiseButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  promiseButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.background,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  skipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
});
