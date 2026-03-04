import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../constants/theme';
import { V4Card } from '../components/v4/V4Card';

const MINIMUM_TASKS = [
  { icon: '↻', task: 'Revise 1 fading topic', duration: '30 min' },
  { icon: '📰', task: 'Read current affairs', duration: '30 min' },
  { icon: '📝', task: '1 PYQ set — any subject', duration: '45 min' },
];

const HIDDEN_ITEMS = [
  { icon: '✗', label: 'Full task list', reason: '3 essentials only' },
  { icon: '✗', label: 'Readiness score', reason: 'rest day' },
  { icon: '✗', label: 'Backlog', reason: 'zero guilt' },
  { icon: '✗', label: 'Streak', reason: 'grace day, won\'t break' },
  { icon: '✗', label: 'Velocity', reason: 'rest is part of the plan' },
];

export default function LowDayScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Calming header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🌊</Text>
          <Text style={styles.headerTitle}>Low energy day? That's okay.</Text>
          <Text style={styles.headerDesc}>
            Every topper had off days. The goal isn't 6 hours — it's staying in the game.
          </Text>
        </View>

        {/* Minimum viable day */}
        <V4Card style={styles.mvdCard}>
          <Text style={styles.mvdTitle}>Minimum Viable Day (~2 hrs)</Text>
          {MINIMUM_TASKS.map((task, i) => (
            <View key={i} style={styles.mvdRow}>
              <Text style={styles.mvdIcon}>{task.icon}</Text>
              <View style={styles.mvdInfo}>
                <Text style={styles.mvdTask}>{task.task}</Text>
                <Text style={styles.mvdDuration}>{task.duration}</Text>
              </View>
            </View>
          ))}
        </V4Card>

        {/* Hidden today */}
        <V4Card style={styles.hiddenCard}>
          <Text style={styles.hiddenTitle}>Hidden Today</Text>
          <Text style={styles.hiddenDesc}>
            These are suppressed on low days to reduce pressure:
          </Text>
          {HIDDEN_ITEMS.map((item, i) => (
            <View key={i} style={styles.hiddenRow}>
              <Text style={styles.hiddenIcon}>{item.icon}</Text>
              <Text style={styles.hiddenLabel}>{item.label}</Text>
              <Text style={styles.hiddenReason}>→ {item.reason}</Text>
            </View>
          ))}
        </V4Card>

        {/* Switch back */}
        <TouchableOpacity
          style={styles.switchBtn}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.switchText}>Feeling better? → Switch to full mode</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1 },
  content: { padding: theme.spacing.lg, paddingBottom: 100 },

  // Header
  header: {
    backgroundColor: theme.colors.purple,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: { fontSize: 40, marginBottom: 12 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
  },

  // MVD
  mvdCard: { marginBottom: 16 },
  mvdTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 14 },
  mvdRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  mvdIcon: { fontSize: 20, width: 32 },
  mvdInfo: { flex: 1 },
  mvdTask: { fontSize: 14, color: theme.colors.text, fontWeight: '500' },
  mvdDuration: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },

  // Hidden
  hiddenCard: { marginBottom: 20 },
  hiddenTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  hiddenDesc: { fontSize: 12, color: theme.colors.textMuted, marginBottom: 12 },
  hiddenRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  hiddenIcon: { fontSize: 14, color: theme.colors.error, width: 24 },
  hiddenLabel: { fontSize: 13, color: theme.colors.text, fontWeight: '500', width: 120 },
  hiddenReason: { fontSize: 12, color: theme.colors.textSecondary, flex: 1 },

  // Switch
  switchBtn: {
    backgroundColor: theme.colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  switchText: { fontSize: 15, fontWeight: '700', color: theme.colors.background },
});
