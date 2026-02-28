import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { SelectionCard } from '../../components/onboarding/SelectionCard';
import { ChatBubble } from '../../components/onboarding/ChatBubble';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';

type Stage = 'prelims' | 'mains' | 'interview' | 'did_not_appear';

const stageOptions: { key: Stage; icon: string; label: string; subtitle: string }[] = [
  { key: 'prelims', icon: '1', label: 'Cleared Prelims', subtitle: 'Made it past the first stage' },
  { key: 'mains', icon: '2', label: 'Cleared Mains', subtitle: 'Made it to the interview' },
  { key: 'interview', icon: '3', label: 'Appeared for Interview', subtitle: 'Final stage reached' },
  { key: 'did_not_appear', icon: '—', label: 'Did not appear / Missed cutoff', subtitle: 'Could not attempt or fell short' },
];

export default function AutopsyScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const params = useLocalSearchParams<{
    name: string;
    target_exam_year: string;
    attempt_number: string;
  }>();

  const [stage, setStage] = useState<Stage | null>(null);
  const [prelimsScore, setPrelimsScore] = useState('');
  const [mainsScore, setMainsScore] = useState('');
  const [weakSubjects, setWeakSubjects] = useState('');

  return (
    <QuestionScreen
      step={3}
      totalSteps={10}
      chatMessage="Your past attempt data helps us build a sharper strategy this time."
      question="How far did you get last time?"
      subtitle="This helps us focus on what actually needs work"
      nextDisabled={stage === null}
      onNext={() =>
        router.push({
          pathname: '/onboarding/approach',
          params: {
            ...params,
            prev_stage: stage!,
            prev_prelims_score: prelimsScore || '',
            prev_mains_score: mainsScore || '',
            prev_weak_subjects: weakSubjects || '',
          },
        })
      }
    >
      {stageOptions.map((opt) => (
        <SelectionCard
          key={opt.key}
          icon={opt.icon}
          label={opt.label}
          subtitle={opt.subtitle}
          selected={stage === opt.key}
          onPress={() => setStage(opt.key)}
        />
      ))}

      {stage && stage !== 'did_not_appear' && (
        <View style={styles.scoresSection}>
          <ChatBubble
            message="Optional: share your scores so we can prioritize your weak areas."
            delay={300}
          />

          {(stage === 'prelims' || stage === 'mains' || stage === 'interview') && (
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Prelims score (out of 200)</Text>
              <TextInput
                style={styles.input}
                value={prelimsScore}
                onChangeText={setPrelimsScore}
                keyboardType="decimal-pad"
                placeholder="e.g. 98"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
          )}

          {(stage === 'mains' || stage === 'interview') && (
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Mains total (out of 1750)</Text>
              <TextInput
                style={styles.input}
                value={mainsScore}
                onChangeText={setMainsScore}
                keyboardType="decimal-pad"
                placeholder="e.g. 680"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
          )}

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Weakest subjects (comma-separated)</Text>
            <TextInput
              style={styles.input}
              value={weakSubjects}
              onChangeText={setWeakSubjects}
              placeholder="e.g. GS2, GS3, Essay"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>
        </View>
      )}
    </QuestionScreen>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  scoresSection: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  inputRow: {
    marginTop: theme.spacing.sm,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
