import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { OptionCard } from '../../components/onboarding/OptionCard';

export default function ProfessionalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ hours: string }>();
  const [isWorking, setIsWorking] = useState<boolean | null>(null);

  return (
    <QuestionScreen
      step={1}
      totalSteps={7}
      question="Are you a working professional?"
      subtitle="This helps us optimize your schedule"
      nextDisabled={isWorking === null}
      onNext={() =>
        router.push({
          pathname: '/onboarding/attempt',
          params: { hours: params.hours, isWorking: String(isWorking) },
        })
      }
    >
      <OptionCard
        label="Yes, I'm working"
        description="I have a full-time or part-time job alongside preparation"
        selected={isWorking === true}
        onPress={() => setIsWorking(true)}
      />
      <OptionCard
        label="No, full-time aspirant"
        description="I can dedicate my entire day to preparation"
        selected={isWorking === false}
        onPress={() => setIsWorking(false)}
      />
    </QuestionScreen>
  );
}
