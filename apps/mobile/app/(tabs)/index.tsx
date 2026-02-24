import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../constants/theme';
import { getModeDefinition } from '../../constants/strategyModes';

export default function DashboardScreen() {
  const [mode, setMode] = useState('balanced');

  useEffect(() => {
    AsyncStorage.getItem('strategy_mode').then((val) => {
      if (val) setMode(val);
    });
  }, []);

  const modeDef = getModeDefinition(mode);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>ExamPilot</Text>
        <Text style={styles.subtitle}>Your UPSC study dashboard</Text>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>{modeDef.icon}</Text>
          <Text style={styles.cardTitle}>{modeDef.title} Mode</Text>
          <Text style={styles.cardDesc}>{modeDef.subtitle}</Text>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Dashboard features coming soon...
          </Text>
          <Text style={styles.placeholderSub}>
            Today's schedule, progress tracking, and more will appear here.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  cardDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  placeholderSub: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
  },
});
