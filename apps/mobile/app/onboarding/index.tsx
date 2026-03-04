import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { SelectionCard } from '../../components/onboarding/SelectionCard';

const ATTEMPT_OPTIONS = [
  { key: '1', label: '1st Attempt', subtitle: "Fresh start — we'll build from zero" },
  { key: '2', label: '2nd Attempt', subtitle: "You know the game. Let's sharpen." },
  { key: '3', label: '3rd+ Attempt', subtitle: 'Aggressive mode. No wasted days.' },
] as const;

export default function AttemptScreen() {
  const router = useRouter();
  const [attempt, setAttempt] = useState<string | null>(null);

  return (
    <QuestionScreen
      step={0}
      totalSteps={6}
      question="Which attempt is this?"
      subtitle="No judgment. 2nd and 3rd attempts clear more often than 1st."
      nextDisabled={attempt === null}
      onNext={() =>
        router.push({
          pathname: '/onboarding/professional',
          params: { attempt },
        })
      }
    >
      {ATTEMPT_OPTIONS.map((opt) => (
        <SelectionCard
          key={opt.key}
          icon={opt.key === '1' ? '🌱' : opt.key === '2' ? '🎯' : '🔥'}
          label={opt.label}
          subtitle={opt.subtitle}
          selected={attempt === opt.key}
          onPress={() => setAttempt(opt.key)}
        />
      ))}
    </QuestionScreen>
  );
}
