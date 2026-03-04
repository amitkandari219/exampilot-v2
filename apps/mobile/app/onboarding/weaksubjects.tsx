import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';

const SUBJECTS = [
  'Indian Polity',
  'Economics',
  'Geography',
  'Ancient History',
  'Modern History',
  'Art & Culture',
  'Science & Tech',
  'Environment',
  'Ethics',
  'CSAT',
] as const;

const MAX_SELECTION = 3;

export default function WeakSubjectsScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const params = useLocalSearchParams<{
    attempt: string;
    user_type: string;
    cycle: string;
    study_approach: string;
    daily_hours: string;
  }>();

  const [selected, setSelected] = useState<string[]>([]);

  const toggleSubject = (subject: string) => {
    setSelected(prev => {
      if (prev.includes(subject)) return prev.filter(s => s !== subject);
      if (prev.length >= MAX_SELECTION) return prev;
      return [...prev, subject];
    });
  };

  return (
    <QuestionScreen
      step={5}
      totalSteps={6}
      question="Which 3 GS subjects feel weakest right now?"
      subtitle="Tap 3. This seeds your revision priority from day one."
      nextLabel="Generate My UPSC Plan →"
      nextDisabled={selected.length !== MAX_SELECTION}
      onNext={() =>
        router.push({
          pathname: '/onboarding/complete',
          params: { ...params, weak_subjects: selected.join(',') },
        })
      }
    >
      <View style={styles.chipContainer}>
        {SUBJECTS.map((subject) => {
          const isOn = selected.includes(subject);
          return (
            <TouchableOpacity
              key={subject}
              style={[
                styles.chip,
                isOn && { backgroundColor: theme.colors.accentDim, borderColor: theme.colors.accent },
              ]}
              onPress={() => toggleSubject(subject)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isOn && { color: theme.colors.accent }]}>
                {subject}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.counter}>{selected.length}/{MAX_SELECTION} selected</Text>
    </QuestionScreen>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    backgroundColor: theme.colors.card,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text,
  },
  counter: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 12,
  },
});
