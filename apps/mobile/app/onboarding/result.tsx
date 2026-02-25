import React, {  useEffect, useRef , useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuestionScreen } from '../../components/onboarding/QuestionScreen';
import { valuePropItems, alwaysValueProps } from '../../constants/onboardingData';
import { Challenge } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';

export default function ValuePropScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const params = useLocalSearchParams<{
    name: string;
    target_exam_year: string;
    attempt_number: string;
    user_type: string;
    challenges: string;
  }>();

  const challenges = (params.challenges?.split(',') || []) as Challenge[];

  // Build personalized value props from user's challenges + always-on items
  const items: string[] = [];
  for (const ch of challenges) {
    if (valuePropItems[ch]) items.push(valuePropItems[ch]);
  }
  for (const item of alwaysValueProps) {
    items.push(item);
  }

  // Staggered fade-in animations
  const anims = useRef(items.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = anims.map((anim: Animated.Value, i: number) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: i * 200,
        useNativeDriver: true,
      })
    );
    Animated.stagger(200, animations).start();
  }, []);

  return (
    <QuestionScreen
      step={5}
      totalSteps={10}
      chatMessage={`Based on your profile, here's how I'll help you, ${params.name}...`}
      question="Your personalized plan"
      subtitle="ExamPilot will handle all of this for you"
      nextLabel="Continue"
      onNext={() =>
        router.push({ pathname: '/onboarding/examdate', params })
      }
    >
      <View style={styles.list}>
        {items.map((item: string, i: number) => (
          <Animated.View
            key={i}
            style={[styles.row, { opacity: anims[i], transform: [{ translateX: anims[i].interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}
          >
            <Text style={styles.bullet}>✦</Text>
            <Text style={styles.itemText}>{item}</Text>
          </Animated.View>
        ))}
      </View>
    </QuestionScreen>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  list: {
    gap: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  bullet: {
    fontSize: 16,
    color: theme.colors.primary,
    marginTop: 2,
  },
  itemText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 22,
  },
});
