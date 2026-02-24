import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { theme } from '../../constants/theme';
import { ProgressDots } from './ProgressDots';

interface QuestionScreenProps {
  step: number;
  totalSteps: number;
  question: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showNext?: boolean;
}

export function QuestionScreen({
  step,
  totalSteps,
  question,
  subtitle,
  children,
  onNext,
  nextLabel = 'Continue',
  nextDisabled = false,
  showNext = true,
}: QuestionScreenProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ProgressDots total={totalSteps} current={step} />

        <View style={styles.content}>
          <Text style={styles.question}>{question}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

          <View style={styles.body}>{children}</View>
        </View>

        {showNext && (
          <TouchableOpacity
            style={[styles.nextButton, nextDisabled && styles.nextButtonDisabled]}
            onPress={onNext}
            disabled={nextDisabled}
            activeOpacity={0.8}
          >
            <Text style={[styles.nextText, nextDisabled && styles.nextTextDisabled]}>
              {nextLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  question: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  body: {
    marginTop: theme.spacing.lg,
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: theme.colors.surfaceLight,
  },
  nextText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.background,
  },
  nextTextDisabled: {
    color: theme.colors.textMuted,
  },
});
