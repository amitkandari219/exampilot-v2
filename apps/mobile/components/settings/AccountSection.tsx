import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { Theme } from '../../constants/theme';
import { toDateString } from '../../lib/dateUtils';
import { api } from '../../lib/api';

function crossAlert(
  title: string,
  message: string,
  buttons: Array<{ text: string; style?: string; onPress?: () => void | Promise<void> }>
) {
  if (Platform.OS === 'web') {
    const confirmed = window.confirm(`${title}\n\n${message}`);
    if (confirmed) {
      const destructive = buttons.find((b) => b.style === 'destructive');
      const result = destructive?.onPress?.();
      if (result instanceof Promise) {
        result.catch(() => {});
      }
    }
  } else {
    const { Alert } = require('react-native');
    Alert.alert(title, message, buttons);
  }
}

interface AccountSectionProps {
  theme: Theme;
  handleSignOut: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  userId: string | undefined;
  profileName: string;
  profileExamDate: Date | null;
}

export function AccountSection({
  theme,
  handleSignOut,
  isDark,
  toggleTheme,
  userId,
  profileName,
  profileExamDate,
}: AccountSectionProps) {
  const styles = createStyles(theme);
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [resetting, setResetting] = useState(false);

  const handleRedoOnboarding = () => {
    crossAlert(
      'Reset Onboarding',
      'This will clear all your progress, plans, and data, and restart onboarding from scratch. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            setResetting(true);
            const saveName = profileName || '';
            const saveDate = profileExamDate ? toDateString(profileExamDate) : '';
            if (Platform.OS === 'web') {
              if (saveName) localStorage.setItem('prefill_name', saveName);
              if (saveDate) localStorage.setItem('prefill_exam_date', saveDate);
            } else {
              if (saveName) await AsyncStorage.setItem('prefill_name', saveName);
              if (saveDate) await AsyncStorage.setItem('prefill_exam_date', saveDate);
            }
            try {
              await api.resetOnboarding();
            } catch (e) {
              console.warn('[settings:reset-onboarding]', e);
            }
            if (isDark) toggleTheme();
            queryClient.clear();
            if (Platform.OS === 'web') {
              window.location.href = '/onboarding';
            } else {
              const root = navigation.getParent() ?? navigation;
              root.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'onboarding' }],
                })
              );
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.resetButton, resetting && { opacity: 0.5 }]}
        disabled={resetting}
        onPress={handleRedoOnboarding}
      >
        {resetting ? (
          <ActivityIndicator size="small" color={theme.colors.textSecondary} />
        ) : (
          <Text style={styles.resetText}>Redo Onboarding</Text>
        )}
      </TouchableOpacity>
    </>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  signOutButton: {
    backgroundColor: theme.colors.error + '20',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  signOutText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  resetText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
});
