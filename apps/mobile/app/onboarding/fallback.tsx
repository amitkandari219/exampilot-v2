import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { OptionCard } from '../../components/onboarding/OptionCard';
import { classifyMode } from '../../lib/classify';
import { OnboardingAnswers } from '../../types';

type Fallback = 'push_harder' | 'revise_more' | 'adjust_plan';

export default function FallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    hours: string;
    isWorking: string;
    attempt: string;
    approach: string;
  }>();
  const [fallback, setFallback] = useState<Fallback | null>(null);

  const handleNext = () => {
    const answers: OnboardingAnswers = {
      daily_hours: parseFloat(params.hours),
      is_working_professional: params.isWorking === 'true',
      attempt_number: params.attempt as OnboardingAnswers['attempt_number'],
      study_approach: params.approach as OnboardingAnswers['study_approach'],
      fallback_strategy: fallback!,
    };

    const recommendedMode = classifyMode(answers);

    router.push({
      pathname: '/onboarding/result',
      params: {
        ...params,
        fallback: fallback!,
        recommendedMode,
      },
    });
  };

  return (
    <QuestionScreen
      step={4}
      totalSteps={7}
      question="When you fall behind schedule..."
      subtitle="What's your instinct?"
      nextDisabled={fallback === null}
      onNext={handleNext}
    >
      <OptionCard
        label="Push harder"
        description="Extend study hours and power through the backlog"
        selected={fallback === 'push_harder'}
        onPress={() => setFallback('push_harder')}
      />
      <OptionCard
        label="Revise more"
        description="Consolidate what I know before moving ahead"
        selected={fallback === 'revise_more'}
        onPress={() => setFallback('revise_more')}
      />
      <OptionCard
        label="Adjust the plan"
        description="Reprioritize topics and adapt the schedule"
        selected={fallback === 'adjust_plan'}
        onPress={() => setFallback('adjust_plan')}
      />
    </QuestionScreen>
  );
}
