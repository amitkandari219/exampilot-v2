import React, { useEffect, useState, useMemo } from 'react';
import { TextInput, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export default function NameScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const { session } = useAuth();
  const [name, setName] = useState('');

  useEffect(() => {
    // Try localStorage/AsyncStorage first (set by redo onboarding)
    const readPrefill = Platform.OS === 'web'
      ? () => {
          const val = localStorage.getItem('prefill_name');
          if (val) { localStorage.removeItem('prefill_name'); }
          return Promise.resolve(val);
        }
      : () => AsyncStorage.getItem('prefill_name').then((val) => {
          if (val) AsyncStorage.removeItem('prefill_name');
          return val;
        });

    readPrefill().then((val) => {
      if (val) {
        setName(val);
      } else if (session?.user?.id) {
        // Fallback: read from Supabase directly
        supabase
          .from('user_profiles')
          .select('name')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data?.name) setName(data.name);
          });
      }
    });
  }, [session?.user?.id]);

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

const createStyles = (theme: Theme) => StyleSheet.create({
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
