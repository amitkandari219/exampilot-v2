import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { SelectionCard } from '../../components/onboarding/SelectionCard';
import { challengeOptions } from '../../constants/onboardingData';
import { Challenge } from '../../types';

const MAX_CHALLENGES = 3;

export default function ChallengesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name: string;
    target_exam_year: string;
    attempt_number: string;
    user_type: string;
  }>();
  const [selected, setSelected] = useState<Challenge[]>([]);

  const toggleChallenge = (key: Challenge) => {
    setSelected((prev) => {
      if (prev.includes(key)) return prev.filter((c) => c !== key);
      if (prev.length >= MAX_CHALLENGES) return prev;
      return [...prev, key];
    });
  };

  return (
    <QuestionScreen
      step={4}
      totalSteps={10}
      chatMessage="Almost done with questions! What are your biggest challenges? Pick up to 3."
      question="Your challenges"
      subtitle={`Select 1-${MAX_CHALLENGES} that apply`}
      nextDisabled={selected.length === 0}
      onNext={() =>
        router.push({
          pathname: '/onboarding/result',
          params: { ...params, challenges: selected.join(',') },
        })
      }
    >
      <View style={styles.grid}>
        {challengeOptions.map((opt) => (
          <View key={opt.key} style={styles.gridItem}>
            <SelectionCard
              icon={opt.icon}
              label={opt.label}
              selected={selected.includes(opt.key)}
              onPress={() => toggleChallenge(opt.key)}
              disabled={!selected.includes(opt.key) && selected.length >= MAX_CHALLENGES}
              multiSelect
            />
          </View>
        ))}
      </View>
    </QuestionScreen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 4,
  },
});
