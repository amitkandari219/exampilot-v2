import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { SelectionCard } from '../../components/onboarding/SelectionCard';

const PREFERENCE_OPTIONS = [
  {
    key: 'sequential',
    label: 'One subject at a time',
    subtitle: 'Finish Polity → then Geography → then Economics',
    icon: '📋',
  },
  {
    key: 'mixed',
    label: 'Mix subjects daily',
    subtitle: 'Study 2-3 subjects each day for variety',
    icon: '🔀',
  },
] as const;

type PrefKey = typeof PREFERENCE_OPTIONS[number]['key'];

export default function PreferenceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    attempt: string;
    user_type: string;
    cycle: string;
  }>();
  const [preference, setPreference] = useState<PrefKey | null>(null);

  return (
    <QuestionScreen
      step={3}
      totalSteps={6}
      question="How do you prefer to study?"
      subtitle="Neither is wrong. This shapes how we build your weekly plan."
      nextDisabled={preference === null}
      onNext={() =>
        router.push({
          pathname: '/onboarding/targets',
          params: { ...params, study_approach: preference },
        })
      }
    >
      {PREFERENCE_OPTIONS.map((opt) => (
        <SelectionCard
          key={opt.key}
          icon={opt.icon}
          label={opt.label}
          subtitle={opt.subtitle}
          selected={preference === opt.key}
          onPress={() => setPreference(opt.key)}
        />
      ))}
    </QuestionScreen>
  );
}
