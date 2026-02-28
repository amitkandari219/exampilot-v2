import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { ModeCard } from '../../components/onboarding/ModeCard';
import { strategyModes, getModeDefinition } from '../../constants/strategyModes';
import { classifyModeV2 } from '../../lib/classify';
import { OnboardingV2Answers, StrategyMode, Challenge } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { toDateString } from '../../lib/dateUtils';

export default function StrategyRevealScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const params = useLocalSearchParams<{
    name: string;
    target_exam_year: string;
    attempt_number: string;
    user_type: string;
    challenges: string;
    daily_hours?: string;
  }>();

  const answers: OnboardingV2Answers = useMemo(() => ({
    name: params.name || '',
    target_exam_year: parseInt(params.target_exam_year, 10),
    attempt_number: params.attempt_number as OnboardingV2Answers['attempt_number'],
    user_type: params.user_type as OnboardingV2Answers['user_type'],
    challenges: (params.challenges?.split(',') || []) as Challenge[],
  }), [params]);

  const { session } = useAuth();
  const dailyHours = params.daily_hours ? parseFloat(params.daily_hours) : undefined;
  const recommended = useMemo(() => classifyModeV2(answers, { daily_hours: dailyHours }), [answers, dailyHours]);
  const [chosenMode, setChosenMode] = useState<StrategyMode>(recommended);
  const [showAllModes, setShowAllModes] = useState(false);
  const [examDate, setExamDate] = useState(new Date(Date.now() + 180 * 86400000));
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  useEffect(() => {
    const applyDate = (val: string) => {
      const parsed = new Date(val + 'T00:00:00');
      if (!isNaN(parsed.getTime()) && parsed > new Date()) setExamDate(parsed);
    };

    const readPrefill = Platform.OS === 'web'
      ? () => {
          const val = localStorage.getItem('prefill_exam_date');
          if (val) localStorage.removeItem('prefill_exam_date');
          return Promise.resolve(val);
        }
      : () => AsyncStorage.getItem('prefill_exam_date').then((val) => {
          if (val) AsyncStorage.removeItem('prefill_exam_date');
          return val;
        });

    readPrefill().then((val) => {
      if (val) {
        applyDate(val);
      } else if (session?.user?.id) {
        supabase
          .from('user_profiles')
          .select('exam_date')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data?.exam_date) applyDate(data.exam_date);
          });
      }
    });
  }, [session?.user?.id]);

  const recommendedDef = getModeDefinition(recommended);

  const modeNames: Record<string, string> = {
    balanced: 'Balanced',
    aggressive: 'Fast Track',
    conservative: 'Slow & Steady',
    working_professional: 'Working Professional',
  };

  return (
    <QuestionScreen
      step={6}
      totalSteps={10}
      chatMessage={`Based on your profile, I recommend the ${modeNames[recommended]} strategy!`}
      question={showAllModes ? 'Choose your strategy' : 'Your recommended strategy'}
      subtitle={showAllModes ? 'Pick the mode that suits you best' : undefined}
      nextLabel="Continue"
      onNext={() =>
        router.push({
          pathname: '/onboarding/targets',
          params: {
            ...params,
            chosen_mode: chosenMode,
            exam_date: toDateString(examDate),
          },
        })
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {showAllModes ? (
          strategyModes.map((mode) => (
            <ModeCard
              key={mode.mode}
              mode={mode}
              selected={chosenMode === mode.mode}
              recommended={mode.mode === recommended}
              onPress={() => setChosenMode(mode.mode)}
            />
          ))
        ) : (
          <>
            <ModeCard
              mode={recommendedDef}
              selected
              recommended
              onPress={() => {}}
            />
            <TouchableOpacity
              style={styles.viewAll}
              onPress={() => setShowAllModes(true)}
            >
              <Text style={styles.viewAllText}>View all strategies</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.dateSection}>
          <Text style={styles.label}>Exam date</Text>

          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={toDateString(examDate)}
              min={toDateString(new Date())}
              onChange={(e: any) => {
                const parsed = new Date(e.target.value + 'T00:00:00');
                if (!isNaN(parsed.getTime())) setExamDate(parsed);
              }}
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.border}`,
                padding: theme.spacing.md,
                fontSize: theme.fontSize.md,
                color: theme.colors.text,
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          ) : (
            <>
              {Platform.OS === 'android' && (
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowPicker(true)}
                >
                  <Text style={styles.dateText}>{examDate.toLocaleDateString()}</Text>
                </TouchableOpacity>
              )}

              {showPicker && (() => {
                const DateTimePicker = require('@react-native-community/datetimepicker').default;
                return (
                  <DateTimePicker
                    value={examDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    minimumDate={new Date()}
                    themeVariant="dark"
                    onChange={(_: any, date?: Date) => {
                      setShowPicker(Platform.OS === 'ios');
                      if (date) setExamDate(date);
                    }}
                  />
                );
              })()}
            </>
          )}
        </View>
      </ScrollView>
    </QuestionScreen>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  viewAll: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  viewAllText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  dateSection: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateInput: {
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
