import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { SelectionCard } from '../../components/onboarding/SelectionCard';

const PROFESSIONAL_OPTIONS = [
  { key: 'student', label: 'Full-time preparation', subtitle: '6+ hrs available daily', icon: '📚' },
  { key: 'working', label: 'Working + preparing', subtitle: 'Limited weekday hours, heavy weekends', icon: '💼' },
] as const;

type ProfKey = typeof PROFESSIONAL_OPTIONS[number]['key'];

export default function ProfessionalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ attempt: string }>();
  const [selected, setSelected] = useState<ProfKey | null>(null);

  return (
    <QuestionScreen
      step={1}
      totalSteps={6}
      question="Are you a working professional?"
      subtitle="This changes your daily capacity and weekend loading"
      nextDisabled={selected === null}
      onNext={() =>
        router.push({
          pathname: '/onboarding/cycle',
          params: { ...params, user_type: selected },
        })
      }
    >
      {PROFESSIONAL_OPTIONS.map((opt) => (
        <SelectionCard
          key={opt.key}
          icon={opt.icon}
          label={opt.label}
          subtitle={opt.subtitle}
          selected={selected === opt.key}
          onPress={() => setSelected(opt.key)}
        />
      ))}
    </QuestionScreen>
  );
}
