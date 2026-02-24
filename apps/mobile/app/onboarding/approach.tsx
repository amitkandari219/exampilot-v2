import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { OptionCard } from '../../components/onboarding/OptionCard';

type Approach = 'thorough' | 'strategic';

export default function ApproachScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    hours: string;
    isWorking: string;
    attempt: string;
  }>();
  const [approach, setApproach] = useState<Approach | null>(null);

  return (
    <QuestionScreen
      step={3}
      totalSteps={7}
      question="What's your study approach?"
      subtitle="There's no wrong answer"
      nextDisabled={approach === null}
      onNext={() =>
        router.push({
          pathname: '/onboarding/fallback',
          params: { ...params, approach: approach! },
        })
      }
    >
      <OptionCard
        label="Thorough & deep"
        description="I prefer understanding everything deeply, even if it takes longer"
        selected={approach === 'thorough'}
        onPress={() => setApproach('thorough')}
      />
      <OptionCard
        label="Strategic & selective"
        description="I focus on high-yield topics and optimize for the exam pattern"
        selected={approach === 'strategic'}
        onPress={() => setApproach('strategic')}
      />
    </QuestionScreen>
  );
}
