import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { V4Card } from '../v4/V4Card';
import { toDateString } from '../../lib/dateUtils';

interface WelcomeBackBannerProps {
  missedDays: number;
  bufferBalance: number;
  onDismiss: () => void;
}

export function WelcomeBackBanner({ missedDays, bufferBalance, onDismiss }: WelcomeBackBannerProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    title: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.accent,
      marginBottom: 6,
    },
    body: {
      fontSize: 12,
      color: theme.colors.text,
      lineHeight: 19,
    },
    dismissBtn: {
      alignSelf: 'flex-end',
      marginTop: 10,
      paddingVertical: 4,
      paddingHorizontal: 12,
    },
    dismissText: {
      fontSize: 12,
      color: theme.colors.textMuted,
      fontWeight: '600',
    },
  }), [theme]);

  const handleDismiss = async () => {
    const todayKey = 'welcome_back_dismissed_' + toDateString(new Date());
    await AsyncStorage.setItem(todayKey, 'true');
    onDismiss();
  };

  return (
    <V4Card style={{ borderWidth: 1, borderColor: theme.colors.accent + '44', marginBottom: 12 }}>
      <Text style={styles.title}>Welcome back!</Text>
      <Text style={styles.body}>
        You missed {missedDays} day{missedDays !== 1 ? 's' : ''}. Plan adjusted — you still have{' '}
        {bufferBalance.toFixed(1)} safety margin days. Let's go!
      </Text>
      <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss} activeOpacity={0.7}>
        <Text style={styles.dismissText}>Dismiss</Text>
      </TouchableOpacity>
    </V4Card>
  );
}
