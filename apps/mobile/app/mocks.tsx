import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../constants/theme';
import { useMockTests, useMockAnalytics, useCreateMock } from '../hooks/useMockTest';
import { V4Card } from '../components/v4/V4Card';
import { V4Bar } from '../components/v4/V4Bar';
import { V4Pill } from '../components/v4/V4Pill';
import { V4SectionLabel } from '../components/v4/V4SectionLabel';
import { V4Tip } from '../components/v4/V4Tip';

function scoreColor(pct: number): string {
  if (pct >= 45) return '#34D399';
  if (pct >= 35) return '#F59E42';
  return '#EF4444';
}

export default function MocksScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data: mocks, isLoading: mocksLoading } = useMockTests();
  const { data: analytics, isLoading: analyticsLoading } = useMockAnalytics();
  const createMock = useCreateMock();
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [testName, setTestName] = useState('');
  const [score, setScore] = useState('');
  const [total, setTotal] = useState('');
  const [showSubjectBreakdown, setShowSubjectBreakdown] = useState(false);
  const [subjectScores, setSubjectScores] = useState<Record<string, { correct: string; total: string }>>({});
  const BREAKDOWN_SUBJECTS = ['Polity', 'History', 'Geo', 'Eco', 'Sci', 'Env'] as const;

  const handleSubmit = useCallback(() => {
    if (!testName.trim() || !score || !total) return;
    const subjectBreakdown = Object.entries(subjectScores)
      .filter(([, v]) => v.correct && v.total)
      .map(([name, v]) => ({
        subject_name: name,
        correct: parseInt(v.correct, 10) || 0,
        total: parseInt(v.total, 10) || 0,
      }));
    createMock.mutate(
      {
        test_name: testName.trim(),
        score: parseFloat(score),
        max_score: parseFloat(total),
        total_questions: parseInt(total, 10),
        attempted: parseInt(total, 10),
        correct: Math.round(parseFloat(score)),
        incorrect: parseInt(total, 10) - Math.round(parseFloat(score)),
        unattempted: 0,
        test_date: new Date().toISOString().split('T')[0],
        ...(subjectBreakdown.length > 0 ? { subject_breakdown: subjectBreakdown } : {}),
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setTestName('');
          setScore('');
          setTotal('');
          setShowSubjectBreakdown(false);
          setSubjectScores({});
        },
      }
    );
  }, [testName, score, total, subjectScores, createMock]);

  if (mocksLoading || analyticsLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.accent} /></View>
      </SafeAreaView>
    );
  }

  const scoreTrend = analytics?.score_trend || [];
  const subjectAccuracy = analytics?.subject_accuracy || [];
  const weakestTopics = analytics?.weakest_topics || [];
  const testsCount = analytics?.tests_count || 0;
  const avgScorePct = analytics?.avg_score_pct || 0;

  // Last 5 tests for bar chart
  const last5 = scoreTrend.slice(-5);
  const maxPct = Math.max(100, ...last5.map((t) => t.score_pct));

  // Trend text
  let trendText = '';
  if (last5.length >= 2) {
    const first = last5[0].score_pct;
    const last = last5[last5.length - 1].score_pct;
    const direction = last > first ? '↑ Trending up' : last < first ? '↓ Trending down' : '→ Stable';
    trendText = `${direction}: ${first.toFixed(0)}% → ${last.toFixed(0)}% over ${last5.length} tests`;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Mock Tests</Text>

          {/* Log new mock */}
          {showForm ? (
            <V4Card style={styles.formCard}>
              <Text style={styles.formTitle}>Log New Test</Text>
              <TextInput
                style={styles.input}
                placeholder="Test name"
                placeholderTextColor={theme.colors.textMuted}
                value={testName}
                onChangeText={setTestName}
              />
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Score"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="decimal-pad"
                  value={score}
                  onChangeText={setScore}
                />
                <Text style={styles.inputSlash}>/</Text>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Total"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="decimal-pad"
                  value={total}
                  onChangeText={setTotal}
                />
              </View>
              {/* Subject-wise breakdown */}
              <TouchableOpacity
                onPress={() => setShowSubjectBreakdown(!showSubjectBreakdown)}
                style={styles.breakdownToggle}
              >
                <Text style={styles.breakdownToggleText}>
                  {showSubjectBreakdown ? '▾' : '▸'} Subject-wise (optional)
                </Text>
              </TouchableOpacity>
              {showSubjectBreakdown && (
                <View style={styles.breakdownGrid}>
                  {BREAKDOWN_SUBJECTS.map((sub) => {
                    const val = subjectScores[sub] || { correct: '', total: '' };
                    return (
                      <View key={sub} style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>{sub}</Text>
                        <TextInput
                          style={styles.breakdownInput}
                          placeholder="✓"
                          placeholderTextColor={theme.colors.textMuted}
                          keyboardType="number-pad"
                          value={val.correct}
                          onChangeText={(v) => setSubjectScores((prev) => ({
                            ...prev,
                            [sub]: { ...prev[sub], correct: v, total: prev[sub]?.total || '' },
                          }))}
                        />
                        <Text style={styles.inputSlash}>/</Text>
                        <TextInput
                          style={styles.breakdownInput}
                          placeholder="T"
                          placeholderTextColor={theme.colors.textMuted}
                          keyboardType="number-pad"
                          value={val.total}
                          onChangeText={(v) => setSubjectScores((prev) => ({
                            ...prev,
                            [sub]: { correct: prev[sub]?.correct || '', total: v },
                          }))}
                        />
                      </View>
                    );
                  })}
                </View>
              )}

              <View style={styles.formActions}>
                <TouchableOpacity onPress={() => setShowForm(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSubmit}
                  disabled={createMock.isPending}
                >
                  <Text style={styles.saveBtnText}>
                    {createMock.isPending ? 'Saving...' : 'Save Test'}
                  </Text>
                </TouchableOpacity>
              </View>
            </V4Card>
          ) : (
            <TouchableOpacity onPress={() => setShowForm(true)}>
              <V4Card bordered style={styles.addCard}>
                <Text style={styles.addIcon}>+</Text>
                <Text style={styles.addText}>Log New Mock</Text>
              </V4Card>
            </TouchableOpacity>
          )}

          {/* Score trend chart */}
          {last5.length > 0 && (
            <>
              <V4SectionLabel text="Score Trend" style={styles.sectionLabel} />
              <V4Card style={styles.section}>
                <View style={styles.chartRow}>
                  {last5.map((test, i) => {
                    const barHeight = Math.max(10, (test.score_pct / maxPct) * 100);
                    const color = scoreColor(test.score_pct);
                    return (
                      <View key={i} style={styles.barCol}>
                        <Text style={[styles.barPct, { color }]}>{test.score_pct.toFixed(0)}%</Text>
                        <View style={styles.barTrack}>
                          <View style={[styles.barFill, { height: `${barHeight}%`, backgroundColor: color }]} />
                        </View>
                        <Text style={styles.barLabel} numberOfLines={1}>
                          {test.test_name.slice(0, 8)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                {trendText && <Text style={styles.trendText}>{trendText}</Text>}
              </V4Card>
            </>
          )}

          {/* Subject-wise accuracy */}
          {subjectAccuracy.length > 0 && (
            <>
              <V4SectionLabel text="Subject-wise Accuracy" style={styles.sectionLabel} />
              <V4Card style={styles.section}>
                {subjectAccuracy.map((sub) => (
                  <View key={sub.subject_id} style={styles.subRow}>
                    <Text style={styles.subName} numberOfLines={1}>{sub.subject_name}</Text>
                    <View style={styles.subBarWrap}>
                      <V4Bar progress={sub.accuracy * 100} height={6} color={scoreColor(sub.accuracy * 100)} />
                    </View>
                    <Text style={[styles.subPct, { color: scoreColor(sub.accuracy * 100) }]}>
                      {(sub.accuracy * 100).toFixed(0)}%
                    </Text>
                  </View>
                ))}
              </V4Card>
            </>
          )}

          {/* Repeated mistakes */}
          {weakestTopics.length > 0 && (
            <>
              <V4SectionLabel text="Repeated Mistakes" style={styles.sectionLabel} />
              <V4Tip
                message="Topics you keep getting wrong across tests. 💡 Auto-flagged for intensive revision next week."
                variant="warn"
              />
              <V4Card style={styles.section}>
                {weakestTopics.slice(0, 8).map((t) => (
                  <View key={t.topic_id} style={styles.mistakeRow}>
                    <View style={styles.mistakeInfo}>
                      <Text style={styles.mistakeTopic} numberOfLines={1}>{t.topic_name}</Text>
                    </View>
                    <V4Pill
                      label={`Wrong ${t.total_questions - Math.round(t.accuracy * t.total_questions)}x`}
                      variant="danger"
                    />
                  </View>
                ))}
              </V4Card>
            </>
          )}

          {/* Recent tests */}
          {mocks && mocks.length > 0 && (
            <>
              <V4SectionLabel text={`Recent Tests (${testsCount})`} style={styles.sectionLabel} />
              {mocks.slice(0, 10).map((test) => {
                const pct = test.max_score > 0 ? (test.score / test.max_score) * 100 : 0;
                return (
                  <V4Card key={test.id} style={styles.testCard}>
                    <View style={styles.testRow}>
                      <View style={styles.testInfo}>
                        <Text style={styles.testName}>{test.test_name}</Text>
                        <Text style={styles.testDate}>
                          {new Date(test.test_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </Text>
                      </View>
                      <View style={styles.testScore}>
                        <Text style={[styles.testPct, { color: scoreColor(pct) }]}>{pct.toFixed(0)}%</Text>
                        <Text style={styles.testRatio}>{test.score}/{test.max_score}</Text>
                      </View>
                    </View>
                  </V4Card>
                );
              })}
            </>
          )}

          {(!mocks || mocks.length === 0) && !showForm && (
            <V4Card style={styles.section}>
              <Text style={styles.emptyText}>No mock tests logged yet. Tap "Log New Mock" to start tracking.</Text>
            </V4Card>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1 },
  content: { padding: theme.spacing.lg, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: { marginBottom: 8 },
  backText: { fontSize: 14, color: theme.colors.accent },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: { marginTop: 16, marginBottom: 8, marginLeft: 2 },
  section: { marginBottom: 8 },

  // Add card
  addCard: {
    alignItems: 'center',
    paddingVertical: 20,
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  addIcon: { fontSize: 28, color: theme.colors.accent, marginBottom: 4 },
  addText: { fontSize: 14, color: theme.colors.accent, fontWeight: '600' },

  // Form
  formCard: { marginBottom: 12 },
  formTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 12 },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 8,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputSlash: { fontSize: 18, color: theme.colors.textMuted },
  breakdownToggle: { marginBottom: 8 },
  breakdownToggleText: { fontSize: 13, fontWeight: '600', color: theme.colors.accent },
  breakdownGrid: { marginBottom: 8 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  breakdownLabel: { width: 48, fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
  breakdownInput: {
    width: 44,
    backgroundColor: theme.colors.surface,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    color: theme.colors.text,
    textAlign: 'center',
  },
  formActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  cancelText: { fontSize: 14, color: theme.colors.textSecondary },
  saveBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveBtnText: { fontSize: 14, fontWeight: '600', color: theme.colors.background },

  // Chart
  chartRow: { flexDirection: 'row', justifyContent: 'space-around', height: 120, alignItems: 'flex-end' },
  barCol: { alignItems: 'center', flex: 1 },
  barPct: { fontSize: 10, fontWeight: '600', marginBottom: 4 },
  barTrack: { width: 28, height: 80, justifyContent: 'flex-end', borderRadius: 4, overflow: 'hidden' },
  barFill: { width: 28, borderRadius: 4 },
  barLabel: { fontSize: 9, color: theme.colors.textMuted, marginTop: 4, textAlign: 'center' },
  trendText: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 10, textAlign: 'center' },

  // Subject accuracy
  subRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  subName: { width: 80, fontSize: 12, color: theme.colors.text },
  subBarWrap: { flex: 1, marginHorizontal: 8 },
  subPct: { width: 36, fontSize: 12, fontWeight: '600', textAlign: 'right' },

  // Mistakes
  mistakeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  mistakeInfo: { flex: 1, marginRight: 8 },
  mistakeTopic: { fontSize: 13, color: theme.colors.text },

  // Recent tests
  testCard: { marginBottom: 6 },
  testRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  testInfo: { flex: 1 },
  testName: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  testDate: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
  testScore: { alignItems: 'flex-end' },
  testPct: { fontSize: 18, fontWeight: '800' },
  testRatio: { fontSize: 11, color: theme.colors.textSecondary },

  emptyText: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: 20 },
});
