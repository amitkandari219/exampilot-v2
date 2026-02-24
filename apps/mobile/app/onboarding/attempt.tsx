import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { OptionCard } from '../../components/onboarding/OptionCard';

type Attempt = 'first' | 'second' | 'third_plus';

export default function AttemptScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ hours: string; isWorking: string }>();
  const [attempt, setAttempt] = useState<Attempt | null>(null);

  return (
    <QuestionScreen
      step={2}
      totalSteps={7}
      question="Which attempt is this?"
      subtitle="Experience changes strategy"
      nextDisabled={attempt === null}
      onNext={() =>
        router.push({
          pathname: '/onboarding/approach',
          params: { ...params, attempt: attempt! },
        })
      }
    >
      <OptionCard
        label="First attempt"
        description="Building foundation from scratch"
        selected={attempt === 'first'}
        onPress={() => setAttempt('first')}
      />
      <OptionCard
        label="Second attempt"
        description="Refining what I learned last time"
        selected={attempt === 'second'}
        onPress={() => setAttempt('second')}
      />
      <OptionCard
        label="Third or more"
        description="Experienced — need targeted improvement"
        selected={attempt === 'third_plus'}
        onPress={() => setAttempt('third_plus')}
      />
    </QuestionScreen>
  );
}
