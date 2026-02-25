import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { SelectionCard } from '../../components/onboarding/SelectionCard';
import { getExamYearOptions } from '../../constants/onboardingData';

export default function ExamYearScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name: string }>();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const yearOptions = getExamYearOptions();

  return (
    <QuestionScreen
      step={1}
      totalSteps={10}
      chatMessage={`Great to meet you, ${params.name}! When are you targeting CSE?`}
      question="Target exam year"
      subtitle="Choose your CSE cycle"
      nextDisabled={selectedYear === null}
      onNext={() =>
        router.push({
          pathname: '/onboarding/attempt',
          params: { name: params.name, target_exam_year: String(selectedYear) },
        })
      }
    >
      {yearOptions.map((opt) => (
        <SelectionCard
          key={opt.key}
          icon="📅"
          label={`CSE ${opt.label}`}
          subtitle={opt.key === yearOptions[0].key ? 'Coming up soon!' : undefined}
          selected={selectedYear === opt.key}
          onPress={() => setSelectedYear(opt.key)}
        />
      ))}
    </QuestionScreen>
  );
}
