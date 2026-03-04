import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { SelectionCard } from '../../components/onboarding/SelectionCard';

const CYCLE_OPTIONS: Array<{ key: string; label: string; subtitle?: string; icon: string }> = [
  { key: 'this_year', label: 'This year (2026)', icon: '📅' },
  { key: 'next_year', label: 'Next year (2027)', icon: '📅' },
  { key: 'not_sure', label: 'Not sure yet', subtitle: "We'll plan for the nearest cycle", icon: '🤔' },
];

export default function CycleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ attempt: string; user_type: string }>();
  const [cycle, setCycle] = useState<string | null>(null);

  return (
    <QuestionScreen
      step={2}
      totalSteps={6}
      question="Which Prelims cycle are you targeting?"
      subtitle="This decides everything — pace, revision depth, risk tolerance"
      nextDisabled={cycle === null}
      onNext={() =>
        router.push({
          pathname: '/onboarding/preference',
          params: { ...params, cycle },
        })
      }
    >
      {CYCLE_OPTIONS.map((opt) => (
        <SelectionCard
          key={opt.key}
          icon={opt.icon}
          label={opt.label}
          subtitle={opt.subtitle}
          selected={cycle === opt.key}
          onPress={() => setCycle(opt.key)}
        />
      ))}
    </QuestionScreen>
  );
}
