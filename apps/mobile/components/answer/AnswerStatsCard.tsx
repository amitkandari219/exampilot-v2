import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import { useAnswerStats } from '../../hooks/useAnswerWriting';
import { AnswerEntrySheet } from './AnswerEntrySheet';

export function AnswerStatsCard() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data: stats } = useAnswerStats();
  const [showEntry, setShowEntry] = useState(false);

  return (
    <>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Answer Writing</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowEntry(true)}>
            <Text style={styles.addBtnText}>+ Log</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{stats?.today_count ?? 0}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{stats?.total_count ?? 0}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{stats?.avg_self_score ? stats.avg_self_score.toFixed(1) : '—'}</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{stats?.avg_word_count || '—'}</Text>
            <Text style={styles.statLabel}>Avg Words</Text>
          </View>
        </View>
      </View>
      <AnswerEntrySheet visible={showEntry} onClose={() => setShowEntry(false)} />
    </>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  card: { backgroundColor: theme.colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: theme.colors.border },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  addBtn: { backgroundColor: theme.colors.accentDim, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addBtnText: { fontSize: 12, fontWeight: '700', color: theme.colors.accent },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  statLabel: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
});
