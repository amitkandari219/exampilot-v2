import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import type { SmartAlert } from '../../types';
import { toDateString } from '../../lib/dateUtils';

interface AlertBannerProps {
  alert: SmartAlert;
}

const SEVERITY_COLORS: Record<string, { border: string; bg: string }> = {
  critical: { border: '#EF4444', bg: '#1C1012' },
  warning: { border: '#F59E42', bg: '#1C1810' },
  info: { border: '#3ECFB4', bg: '#0F1C1A' },
};

export function AlertBanner({ alert }: AlertBannerProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = useCallback(async () => {
    setDismissed(true);
    const key = `alert_dismissed_${alert.type}_${toDateString(new Date())}`;
    await AsyncStorage.setItem(key, 'true');
  }, [alert.type]);

  if (dismissed) return null;

  const colors = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.info;

  return (
    <View style={[styles.container, { borderLeftColor: colors.border, backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.border }]}>{alert.title}</Text>
        <Text style={styles.message}>{alert.message}</Text>
        <View style={styles.actions}>
          {alert.action_label && alert.action_route && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.border + '22' }]}
              onPress={() => router.push(alert.action_route as any)}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionText, { color: colors.border }]}>{alert.action_label}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 14,
    marginBottom: theme.spacing.md,
  },
  content: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  message: { fontSize: 12, color: theme.colors.textSecondary, lineHeight: 18 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  actionText: { fontSize: 12, fontWeight: '700' },
  dismissText: { fontSize: 11, color: theme.colors.textMuted },
});
