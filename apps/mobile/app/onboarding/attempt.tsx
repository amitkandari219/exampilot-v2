import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { SelectionCard } from '../../components/onboarding/SelectionCard';
import { ChatBubble } from '../../components/onboarding/ChatBubble';
import { attemptOptions, motivationalResponses } from '../../constants/onboardingData';

type AttemptKey = 'first' | 'second' | 'third_plus';

export default function AttemptScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name: string; target_exam_year: string }>();
  const [attempt, setAttempt] = useState<AttemptKey | null>(null);

  return (
    <QuestionScreen
      step={2}
      totalSteps={10}
      chatMessage={`CSE ${params.target_exam_year} — that's a solid target!`}
      question="Which attempt is this?"
      subtitle="Experience changes strategy"
      nextDisabled={attempt === null}
      onNext={() =>
        router.push({
          pathname: '/onboarding/approach',
          params: { ...params, attempt_number: attempt! },
        })
      }
    >
      {attemptOptions.map((opt) => (
        <SelectionCard
          key={opt.key}
          icon={opt.icon}
          label={opt.label}
          subtitle={opt.subtitle}
          selected={attempt === opt.key}
          onPress={() => setAttempt(opt.key)}
        />
      ))}
      {attempt && (
        <View style={{ marginTop: 8 }}>
          <ChatBubble
            message={motivationalResponses.attempt[attempt]}
            delay={300}
          />
        </View>
      )}
    </QuestionScreen>
  );
}
