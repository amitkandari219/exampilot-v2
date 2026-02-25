import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { SelectionCard } from '../../components/onboarding/SelectionCard';
import { ChatBubble } from '../../components/onboarding/ChatBubble';
import { userTypeOptions, motivationalResponses } from '../../constants/onboardingData';
import { UserType } from '../../types';

export default function UserTypeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name: string;
    target_exam_year: string;
    attempt_number: string;
  }>();
  const [userType, setUserType] = useState<UserType | null>(null);

  const chatMsg =
    params.attempt_number === 'first'
      ? 'A fresh start with the right plan is powerful!'
      : params.attempt_number === 'second'
        ? 'Second time around, you know what to expect. Let\'s refine your approach.'
        : 'Your persistence is your biggest asset!';

  return (
    <QuestionScreen
      step={3}
      totalSteps={10}
      chatMessage={chatMsg}
      question="What describes you best?"
      subtitle="This helps us tailor your daily plan"
      nextDisabled={userType === null}
      onNext={() =>
        router.push({
          pathname: '/onboarding/fallback',
          params: { ...params, user_type: userType! },
        })
      }
    >
      {userTypeOptions.map((opt) => (
        <SelectionCard
          key={opt.key}
          icon={opt.icon}
          label={opt.label}
          subtitle={opt.subtitle}
          selected={userType === opt.key}
          onPress={() => setUserType(opt.key)}
        />
      ))}
      {userType && (
        <View style={{ marginTop: 8 }}>
          <ChatBubble
            message={motivationalResponses.usertype[userType]}
            delay={300}
          />
        </View>
      )}
    </QuestionScreen>
  );
}
