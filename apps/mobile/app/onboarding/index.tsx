import React, { useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { theme } from '../../constants/theme';

export default function NameScreen() {
  const router = useRouter();
  const [name, setName] = useState('');

  return (
    <QuestionScreen
      step={0}
      totalSteps={10}
      chatMessage="Hey! I'm ExamPilot, your UPSC preparation companion. What should I call you?"
      question="Your name"
      subtitle="We'll personalize your experience"
      nextDisabled={name.trim().length < 2}
      onNext={() =>
        router.push({ pathname: '/onboarding/professional', params: { name: name.trim() } })
      }
    >
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        placeholderTextColor={theme.colors.textMuted}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoFocus
        returnKeyType="next"
      />
    </QuestionScreen>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
});
