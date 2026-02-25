import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { OnboardingProgressBar } from './OnboardingProgressBar';
import { ChatBubble } from './ChatBubble';

interface QuestionScreenProps {
  step: number;
  totalSteps: number;
  question: string;
  subtitle?: string;
  chatMessage?: string;
  chatDelay?: number;
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
  chatMessage,
  chatDelay,
  children,
  onNext,
  nextLabel = 'Continue',
  nextDisabled = false,
  showNext = true,
}: QuestionScreenProps) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.topRow}>
            {step > 0 ? (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.backPlaceholder} />
            )}
            <View style={styles.progressWrap}>
              <OnboardingProgressBar current={step} total={totalSteps} />
            </View>
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {chatMessage && <ChatBubble message={chatMessage} delay={chatDelay} />}

            <Text style={styles.question}>{question}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

            <View style={styles.body}>{children}</View>
          </ScrollView>

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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: theme.spacing.md,
    paddingRight: theme.spacing.sm,
  },
  backText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  backPlaceholder: {
    width: 48,
  },
  progressWrap: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: theme.spacing.md,
  },
  question: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  body: {
    marginTop: theme.spacing.md,
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
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
