import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { SelectionCard } from '../../components/onboarding/SelectionCard';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';

type BiggestChallenge = 'time_management' | 'answer_writing' | 'revision' | 'motivation';

const PAPERS = ['gs1', 'gs2', 'gs3', 'gs4', 'essay', 'optional'] as const;
const PAPER_LABELS: Record<string, string> = {
  gs1: 'GS-I (History, Geography, Society)',
  gs2: 'GS-II (Polity, Governance, IR)',
  gs3: 'GS-III (Economy, Env, S&T)',
  gs4: 'GS-IV (Ethics)',
  essay: 'Essay',
  optional: 'Optional',
};

const CHALLENGES: { key: BiggestChallenge; label: string; icon: string }[] = [
  { key: 'time_management', label: 'Time Management', icon: 'T' },
  { key: 'answer_writing', label: 'Answer Writing', icon: 'A' },
  { key: 'revision', label: 'Revision', icon: 'R' },
  { key: 'motivation', label: 'Staying Motivated', icon: 'M' },
];

const MAX_PAPERS = 3;

export default function PastAttemptScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const params = useLocalSearchParams<{
    attempt: string;
    user_type: string;
    cycle: string;
    study_approach: string;
    daily_hours: string;
    weak_subjects: string;
  }>();

  const [weakPapers, setWeakPapers] = useState<string[]>([]);
  const [challenge, setChallenge] = useState<BiggestChallenge | null>(null);

  const togglePaper = (paper: string) => {
    setWeakPapers(prev => {
      if (prev.includes(paper)) return prev.filter(p => p !== paper);
      if (prev.length >= MAX_PAPERS) return prev;
      return [...prev, paper];
    });
  };

  const pastAttemptData = JSON.stringify({
    mains_weakest_papers: weakPapers,
    biggest_challenge: challenge,
  });

  return (
    <QuestionScreen
      step={6}
      totalSteps={7}
      question="Tell us about your previous attempt"
      subtitle="This helps us prioritize your weakest areas from day one."
      nextLabel="Generate My UPSC Plan"
      nextDisabled={weakPapers.length === 0 || !challenge}
      onNext={() =>
        router.push({
          pathname: '/onboarding/complete',
          params: { ...params, past_attempt_data: pastAttemptData },
        })
      }
    >
      <Text style={styles.sectionLabel}>Weakest Mains papers (up to {MAX_PAPERS})</Text>
      <View style={styles.chipContainer}>
        {PAPERS.map(paper => {
          const isOn = weakPapers.includes(paper);
          return (
            <TouchableOpacity
              key={paper}
              style={[styles.chip, isOn && { backgroundColor: theme.colors.accentDim, borderColor: theme.colors.accent }]}
              onPress={() => togglePaper(paper)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isOn && { color: theme.colors.accent }]}>
                {PAPER_LABELS[paper]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.counter}>{weakPapers.length}/{MAX_PAPERS} selected</Text>

      <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Biggest challenge last time?</Text>
      {CHALLENGES.map(c => (
        <SelectionCard
          key={c.key}
          icon={c.icon}
          label={c.label}
          selected={challenge === c.key}
          onPress={() => setChallenge(c.key)}
        />
      ))}
    </QuestionScreen>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  sectionLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 10 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { backgroundColor: theme.colors.card, borderWidth: 1.5, borderColor: theme.colors.border, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16 },
  chipText: { fontSize: 13, fontWeight: '500', color: theme.colors.text },
  counter: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 8 },
});
