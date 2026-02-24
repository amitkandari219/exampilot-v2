import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { api } from '../../lib/api';
import { theme } from '../../constants/theme';
import { StrategyMode } from '../../types';

export default function ExamDateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    hours: string;
    isWorking: string;
    attempt: string;
    approach: string;
    fallback: string;
    recommendedMode: string;
    chosenMode: string;
  }>();

  const [name, setName] = useState('');
  const [examDate, setExamDate] = useState(new Date(Date.now() + 180 * 86400000));
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');
  const [loading, setLoading] = useState(false);

  const canSubmit = name.trim().length >= 2 && !loading;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // For now, use a placeholder userId — in production this comes from auth
      const userId = 'demo-user-' + Date.now();

      await api.completeOnboarding(userId, {
        daily_hours: parseFloat(params.hours),
        is_working_professional: params.isWorking === 'true',
        attempt_number: params.attempt,
        study_approach: params.approach,
        fallback_strategy: params.fallback,
        recommended_mode: params.recommendedMode,
        chosen_mode: params.chosenMode as StrategyMode,
        exam_date: examDate.toISOString().split('T')[0],
        name: name.trim(),
      });

      await AsyncStorage.setItem('onboarding_completed', 'true');
      await AsyncStorage.setItem('user_id', userId);
      await AsyncStorage.setItem('strategy_mode', params.chosenMode);

      router.replace('/(tabs)');
    } catch {
      // In demo mode, still navigate forward even if API fails
      await AsyncStorage.setItem('onboarding_completed', 'true');
      await AsyncStorage.setItem('strategy_mode', params.chosenMode);
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <QuestionScreen
      step={6}
      totalSteps={7}
      question="Almost there!"
      subtitle="Set your exam date and let's begin"
      nextLabel={loading ? 'Setting up...' : "Let's begin"}
      nextDisabled={!canSubmit}
      onNext={handleSubmit}
    >
      <View style={styles.form}>
        <Text style={styles.label}>Your name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor={theme.colors.textMuted}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <Text style={[styles.label, { marginTop: theme.spacing.lg }]}>Exam date</Text>

        {Platform.OS === 'android' && (
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.dateText}>{examDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
        )}

        {showPicker && (
          <DateTimePicker
            value={examDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            themeVariant="dark"
            onChange={(_, date) => {
              setShowPicker(Platform.OS === 'ios');
              if (date) setExamDate(date);
            }}
          />
        )}
      </View>
    </QuestionScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    paddingVertical: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  dateButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  dateText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
});
