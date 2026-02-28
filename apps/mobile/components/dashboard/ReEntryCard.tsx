import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';

interface ReEntryCardProps {
  missedDays: number;
}

export function ReEntryCard({ missedDays }: ReEntryCardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  return (
    <View style={styles.card}>
      <Text style={styles.emoji}>{"👋"}</Text>
      <Text style={styles.title}>Welcome back!</Text>
      <Text style={styles.description}>
        You were away for {missedDays} day{missedDays > 1 ? 's' : ''}. No worries — we've prepared a gentle restart plan with a lighter workload.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(tabs)/planner')}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>See my restart plan</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  buttonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.background,
  },
});
