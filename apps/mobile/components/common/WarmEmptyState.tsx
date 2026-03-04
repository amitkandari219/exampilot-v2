import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface WarmEmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function WarmEmptyState({ title, message, actionLabel, onAction }: WarmEmptyStateProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingVertical: 32,
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    message: {
      fontSize: 13,
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 19,
    },
    actionBtn: {
      marginTop: 16,
      backgroundColor: theme.colors.accent,
      paddingVertical: 10,
      paddingHorizontal: 24,
      borderRadius: 12,
    },
    actionText: {
      color: theme.colors.background,
      fontWeight: '700',
      fontSize: 13,
    },
  }), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionBtn} onPress={onAction} activeOpacity={0.8}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
