import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Theme } from '../constants/theme';
import { useVelocity } from '../hooks/useVelocity';
import { useWeaknessOverview } from '../hooks/useWeakness';
import { useSimulator } from '../hooks/useSimulator';
import { useQuickLogs } from '../hooks/useQuickLog';
import { V4Card } from '../components/v4/V4Card';
import { V4MetricBox } from '../components/v4/V4MetricBox';
import { V4Bar } from '../components/v4/V4Bar';
import { V4Pill } from '../components/v4/V4Pill';
import { V4SectionLabel } from '../components/v4/V4SectionLabel';
import { V4Tip } from '../components/v4/V4Tip';

const HEALTH_COLORS: Record<string, string> = {
  critical: '#EF4444',
  weak: '#F59E42',
  moderate: '#F59E42',
  strong: '#3ECFB4',
  exam_ready: '#34D399',
};

export default function RankerScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { daysUsed, isVeteran, examMode } = useUser();
  const { data: velocity, isLoading: velLoading } = useVelocity();
  const { data: weakness, isLoading: weakLoading } = useWeaknessOverview();
  const simulator = useSimulator();
  const { data: allQuickLogs } = useQuickLogs();

  // Simulator form state (must be before any early return)
  const [simHours, setSimHours] = useState('8');
  const [simRan, setSimRan] = useState(false);

  // Count answer writing sessions from quick logs
  const answerWritingCount = useMemo(() => {
    if (!allQuickLogs) return 0;
    return (allQuickLogs as any[]).filter(
      (l) => l.notes && l.notes.toLowerCase().startsWith('answer writing')
    ).length;
  }, [allQuickLogs]);

  // Simulation handler
  const handleSimulate = useCallback(() => {
    const hrs = parseFloat(simHours) || 8;
    simulator.mutate({
      type: 'change_hours',
      params: { new_hours: hrs },
    });
    setSimRan(true);
  }, [simHours, simulator]);

  // Lock screen for freshers < day 30
  if (!isVeteran && daysUsed < 30) {
    const remaining = 30 - daysUsed;
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.lockContainer}>
          <Text style={styles.lockIcon}>🏆</Text>
          <Text style={styles.lockTitle}>Ranker Mode unlocks in {remaining} days</Text>
          <Text style={styles.lockDesc}>
            Advanced analytics need enough data to be meaningful. Keep studying — you'll get here soon.
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.lockBtn}>
            <Text style={styles.lockBtnText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (velLoading || weakLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.accent} /></View>
      </SafeAreaView>
    );
  }

  // Velocity data
  const topicsPerDay = velocity ? velocity.actual_velocity_7d : 0;
  const projectedDate = velocity?.projected_completion_date
    ? new Date(velocity.projected_completion_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '--';
  const requiredIncrease = velocity && velocity.required_velocity > velocity.actual_velocity_7d
    ? ((velocity.required_velocity / Math.max(velocity.actual_velocity_7d, 0.1) - 1) * 100).toFixed(0)
    : '0';

  // Top 4 subjects by weakness
  const subjectWeakness = weakness?.by_subject?.slice(0, 4) || [];

  const simResult = simulator.data;
  const simBurnoutRisk = parseFloat(simHours) > 9;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔥 Ranker Mode</Text>
        <Text style={styles.subtitle}>8+ hrs/day · Top 100 target</Text>

        {/* 5.1.1 — Velocity Intelligence */}
        <V4SectionLabel text="Velocity Intelligence" style={styles.sectionLabel} />
        <View style={styles.metricsRow}>
          <V4MetricBox
            value={topicsPerDay.toFixed(1)}
            label="Topics/Day"
            sublabel="7-day avg"
            valueColor={theme.colors.accent}
          />
          <View style={{ width: 8 }} />
          <V4MetricBox
            value={projectedDate}
            label="Projected Done"
            valueColor={theme.colors.text}
          />
          <View style={{ width: 8 }} />
          <V4MetricBox
            value={`+${requiredIncrease}%`}
            label="Speed Needed"
            valueColor={parseInt(requiredIncrease) > 20 ? theme.colors.error : theme.colors.success}
          />
        </View>

        {/* 5.1.2 — Weakness Radar */}
        <V4SectionLabel text="Weakness Radar" style={styles.sectionLabel} />
        <V4Card style={styles.section}>
          {subjectWeakness.length > 0 ? (
            subjectWeakness.map((sub) => {
              const total = sub.topics.length;
              const criticalPct = total > 0 ? (sub.critical_count / total) * 100 : 0;
              const weakPct = total > 0 ? (sub.weak_count / total) * 100 : 0;
              const strongPct = Math.max(0, 100 - criticalPct - weakPct);
              return (
                <View key={sub.subject_id} style={styles.radarRow}>
                  <Text style={styles.radarSubject} numberOfLines={1}>{sub.subject_name}</Text>
                  <View style={styles.radarBarTrack}>
                    {criticalPct > 0 && (
                      <View style={[styles.radarSeg, { flex: criticalPct, backgroundColor: '#EF4444' }]} />
                    )}
                    {weakPct > 0 && (
                      <View style={[styles.radarSeg, { flex: weakPct, backgroundColor: '#F59E42' }]} />
                    )}
                    {strongPct > 0 && (
                      <View style={[styles.radarSeg, { flex: strongPct, backgroundColor: '#34D399' }]} />
                    )}
                  </View>
                  <Text style={styles.radarCount}>{sub.critical_count}c {sub.weak_count}w</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No weakness data yet</Text>
          )}
          <View style={styles.legendRow}>
            <LegendDot color="#EF4444" label="Critical" />
            <LegendDot color="#F59E42" label="Weak" />
            <LegendDot color="#34D399" label="Strong" />
          </View>
        </V4Card>

        {/* 5.1.3 — What-If Simulator */}
        <V4SectionLabel text="What-If Simulator" style={styles.sectionLabel} />
        <V4Card style={styles.section}>
          <Text style={styles.simQuestion}>
            What if I study {simHours}h/day?
          </Text>
          <View style={styles.simInputRow}>
            <TextInput
              style={styles.simInput}
              value={simHours}
              onChangeText={setSimHours}
              keyboardType="decimal-pad"
              placeholder="Hours"
              placeholderTextColor={theme.colors.textMuted}
            />
            <Text style={styles.simUnit}>hrs/day</Text>
            <TouchableOpacity
              style={styles.simBtn}
              onPress={handleSimulate}
              disabled={simulator.isPending}
            >
              <Text style={styles.simBtnText}>
                {simulator.isPending ? 'Running...' : 'Simulate'}
              </Text>
            </TouchableOpacity>
          </View>

          {simBurnoutRisk && (
            <V4Tip message="Burnout risk HIGH above 9 hrs/day. Consider sustainable pacing." variant="warn" />
          )}

          {simRan && simResult && (
            <View style={styles.simResults}>
              <View style={styles.simDelta}>
                <Text style={styles.simLabel}>Velocity</Text>
                <Text style={[
                  styles.simValue,
                  { color: simResult.delta.velocity_ratio_change > 0 ? theme.colors.success : theme.colors.error },
                ]}>
                  {simResult.delta.velocity_ratio_change > 0 ? '+' : ''}{(simResult.delta.velocity_ratio_change * 100).toFixed(0)}%
                </Text>
              </View>
              <View style={styles.simDelta}>
                <Text style={styles.simLabel}>Completion</Text>
                <Text style={styles.simValue}>
                  {simResult.projected.weighted_completion_pct.toFixed(0)}%
                </Text>
              </View>
              <View style={styles.simDelta}>
                <Text style={styles.simLabel}>Buffer</Text>
                <Text style={[
                  styles.simValue,
                  { color: simResult.delta.buffer_balance_change > 0 ? theme.colors.success : theme.colors.error },
                ]}>
                  {simResult.delta.buffer_balance_change > 0 ? '+' : ''}{simResult.delta.buffer_balance_change.toFixed(1)}
                </Text>
              </View>

              <V4Pill
                label={simResult.verdict === 'green' ? 'SAFE' : simResult.verdict === 'yellow' ? 'CAUTION' : 'RISKY'}
                variant={simResult.verdict === 'green' ? 'green' : simResult.verdict === 'yellow' ? 'warn' : 'danger'}
              />

              {simResult.recommendation && (
                <Text style={styles.simRec}>{simResult.recommendation}</Text>
              )}

              {simResult.delta.completion_date_shift_days !== null && simResult.delta.completion_date_shift_days !== 0 && (
                <Text style={styles.simShift}>
                  Projected completion shifts by {simResult.delta.completion_date_shift_days > 0 ? '+' : ''}{simResult.delta.completion_date_shift_days} days
                </Text>
              )}
            </View>
          )}
        </V4Card>

        {/* 5.1.4 — Answer Writing Section (Mains mode only) */}
        {examMode === 'mains' && (
          <>
            <V4SectionLabel text="Answer Writing" style={styles.sectionLabel} />
            <V4Card style={styles.section}>
              {answerWritingCount > 0 ? (
                <>
                  <View style={styles.awMetricRow}>
                    <V4MetricBox
                      value={answerWritingCount}
                      label="Sessions logged"
                      valueColor={theme.colors.purple}
                    />
                  </View>
                  <Text style={styles.mainsHint}>
                    Focus on GS papers with lowest practice. Log more via Quick Log (+).
                  </Text>
                </>
              ) : (
                <Text style={styles.mainsHint}>
                  0 answers logged — use Quick Log to track answer writing sessions.
                </Text>
              )}
            </V4Card>
          </>
        )}

        {/* Subject-specific projection note */}
        <V4Tip
          message="Run subject-specific simulations from Full Syllabus."
          variant="info"
          dismissible
        />
        {/* TODO V5: Wire focus_subject scenario type for per-subject What-If projections */}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text style={{ fontSize: 11, color: '#7B8BA5' }}>{label}</Text>
    </View>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: { marginTop: 16, marginBottom: 8, marginLeft: 2 },
  section: { marginBottom: 8 },
  metricsRow: { flexDirection: 'row', marginBottom: 8 },

  // Lock
  lockContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  lockIcon: { fontSize: 48, marginBottom: 16 },
  lockTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.text, textAlign: 'center', marginBottom: 12 },
  lockDesc: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  lockBtn: { paddingVertical: 10, paddingHorizontal: 20 },
  lockBtnText: { fontSize: 15, color: theme.colors.accent, fontWeight: '600' },

  // Weakness radar
  radarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  radarSubject: { width: 80, fontSize: 12, color: theme.colors.text },
  radarBarTrack: { flex: 1, flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginHorizontal: 8 },
  radarSeg: { height: 10 },
  radarCount: { width: 50, fontSize: 10, color: theme.colors.textMuted, textAlign: 'right' },
  legendRow: { flexDirection: 'row', gap: 16, marginTop: 8 },

  // Simulator
  simQuestion: { fontSize: 15, fontWeight: '600', color: theme.colors.text, marginBottom: 10 },
  simInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  simInput: {
    width: 60,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  simUnit: { fontSize: 13, color: theme.colors.textSecondary },
  simBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  simBtnText: { fontSize: 13, fontWeight: '600', color: theme.colors.background },
  simResults: { marginTop: 12, gap: 8 },
  simDelta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  simLabel: { fontSize: 13, color: theme.colors.textSecondary },
  simValue: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  simRec: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 8, lineHeight: 18 },
  simShift: { fontSize: 12, color: theme.colors.textMuted, fontStyle: 'italic' },

  // Mains / Answer writing
  awMetricRow: { flexDirection: 'row', marginBottom: 10 },
  mainsHint: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 20 },

  emptyText: { fontSize: 13, color: theme.colors.textMuted, textAlign: 'center', paddingVertical: 16 },
});
