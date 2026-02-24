import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { HoursSlider } from '../../components/onboarding/HoursSlider';

export default function HoursScreen() {
  const router = useRouter();
  const [hours, setHours] = useState(6);

  return (
    <QuestionScreen
      step={0}
      totalSteps={7}
      question="How many hours can you study daily?"
      subtitle="Be honest — we'll build your plan around this"
      onNext={() =>
        router.push({ pathname: '/onboarding/professional', params: { hours: String(hours) } })
      }
    >
      <HoursSlider value={hours} onValueChange={setHours} />
    </QuestionScreen>
  );
}
