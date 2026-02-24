import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { ModeCard } from '../../components/onboarding/ModeCard';
import { OptionCard } from '../../components/onboarding/OptionCard';
import { strategyModes, getModeDefinition } from '../../constants/strategyModes';
import { StrategyMode } from '../../types';
import { theme } from '../../constants/theme';

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    hours: string;
    isWorking: string;
    attempt: string;
    approach: string;
    fallback: string;
    recommendedMode: string;
  }>();

  const recommended = params.recommendedMode as StrategyMode;
  const [chosenMode, setChosenMode] = useState<StrategyMode>(recommended);
  const [showAllModes, setShowAllModes] = useState(false);

  const recommendedDef = getModeDefinition(recommended);

  return (
    <QuestionScreen
      step={5}
      totalSteps={7}
      question={showAllModes ? 'Choose your strategy' : 'Your recommended strategy'}
      subtitle={
        showAllModes
          ? 'Pick the mode that suits you best'
          : 'Based on your answers, we think this fits you'
      }
      nextLabel="Continue"
      onNext={() =>
        router.push({
          pathname: '/onboarding/examdate',
          params: { ...params, chosenMode },
        })
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {showAllModes ? (
          strategyModes.map((mode) => (
            <ModeCard
              key={mode.mode}
              mode={mode}
              selected={chosenMode === mode.mode}
              recommended={mode.mode === recommended}
              onPress={() => setChosenMode(mode.mode)}
            />
          ))
        ) : (
          <>
            <ModeCard
              mode={recommendedDef}
              selected
              recommended
              onPress={() => {}}
            />
            <View style={styles.choiceRow}>
              <OptionCard
                label="This is right for me"
                selected={!showAllModes && chosenMode === recommended}
                onPress={() => setChosenMode(recommended)}
              />
              <OptionCard
                label="I'd like to choose differently"
                onPress={() => setShowAllModes(true)}
              />
            </View>
          </>
        )}
      </ScrollView>
    </QuestionScreen>
  );
}

const styles = StyleSheet.create({
  choiceRow: {
    marginTop: theme.spacing.lg,
  },
});
