import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../constants/theme';
import { useRevisionsDue, useConfidenceOverview } from '../hooks/useFSRS';
import { V4Card } from '../components/v4/V4Card';
import { V4MetricBox } from '../components/v4/V4MetricBox';
import { V4Pill } from '../components/v4/V4Pill';
import { V4Tip } from '../components/v4/V4Tip';
import { V4SectionLabel } from '../components/v4/V4SectionLabel';
import { V4Bar } from '../components/v4/V4Bar';

function getUrgency(dueDate: string): { label: string; variant: 'danger' | 'warn' | 'accent'; color: string } {
  const now = new Date();
  const due = new Date(dueDate);
  const daysDiff = Math.ceil((due.getTime() - now.getTime()) / 86400000);
  if (daysDiff <= 0) return { label: 'OVERDUE', variant: 'danger', color: '#EF4444' };
  if (daysDiff <= 1) return { label: 'TODAY', variant: 'danger', color: '#EF4444' };
  if (daysDiff <= 3) return { label: `${daysDiff}d`, variant: 'warn', color: '#F59E42' };
  return { label: `${daysDiff}d`, variant: 'accent', color: '#3ECFB4' };
}

export default function RevisionScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data: revisionsData, isLoading: revLoading } = useRevisionsDue();
  const { data: confidence, isLoading: confLoading } = useConfidenceOverview();

  const revisions = revisionsData?.revisions || [];
  const now = new Date();

  // Split revisions
  const dueToday = revisions.filter((r) => {
    const due = new Date(r.due);
    return due.getTime() <= now.getTime() + 86400000;
  });
  const dueThisWeek = revisions.filter((r) => {
    const due = new Date(r.due);
    const diff = (due.getTime() - now.getTime()) / 86400000;
    return diff > 1 && diff <= 7;
  });
  const comingUp = revisions.filter((r) => {
    const diff = (new Date(r.due).getTime() - now.getTime()) / 86400000;
    return diff > 3 && diff <= 7;
  });

  // Confidence distribution
  const dist = confidence?.distribution || { fresh: 0, fading: 0, stale: 0, decayed: 0 };
  const totalTopics = Object.values(dist).reduce((a, b) => a + b, 0);
  const freshPct = totalTopics ? Math.round((dist.fresh / totalTopics) * 100) : 0;
  const fadingPct = totalTopics ? Math.round((dist.fading / totalTopics) * 100) : 0;
  const stalePct = totalTopics ? Math.round((dist.stale / totalTopics) * 100) : 0;
  const decayedPct = totalTopics ? Math.round((dist.decayed / totalTopics) * 100) : 0;

  // Retention estimate (fresh topics contribute most)
  const retentionEst = totalTopics
    ? Math.round(((dist.fresh * 95 + dist.fading * 70 + dist.stale * 40 + dist.decayed * 15) / totalTopics))
    : 0;

  if (revLoading || confLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.accent} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Revision Hub</Text>

        {/* Top metrics */}
        <View style={styles.metricsRow}>
          <V4MetricBox
            value={dueToday.length}
            label="Due Today"
            valueColor={dueToday.length > 0 ? theme.colors.error : theme.colors.success}
          />
          <View style={{ width: 8 }} />
          <V4MetricBox
            value={dueThisWeek.length}
            label="This Week"
            valueColor={theme.colors.warning}
          />
          <View style={{ width: 8 }} />
          <V4MetricBox
            value={`${retentionEst}%`}
            label="Retention"
            valueColor={theme.colors.success}
          />
        </View>

        {/* Memory health card */}
        <V4SectionLabel text="Memory Health" style={styles.sectionLabel} />
        <V4Card style={styles.section}>
          {/* Stacked bar */}
          <View style={styles.stackedBar}>
            {freshPct > 0 && (
              <View style={[styles.stackSeg, { flex: freshPct, backgroundColor: '#34D399' }]} />
            )}
            {fadingPct > 0 && (
              <View style={[styles.stackSeg, { flex: fadingPct, backgroundColor: '#F59E42' }]} />
            )}
            {stalePct > 0 && (
              <View style={[styles.stackSeg, { flex: stalePct, backgroundColor: '#EF4444' }]} />
            )}
            {decayedPct > 0 && (
              <View style={[styles.stackSeg, { flex: decayedPct, backgroundColor: '#7B8BA5' }]} />
            )}
          </View>
          <View style={styles.legendRow}>
            <LegendItem color="#34D399" label={`Fresh ${freshPct}%`} />
            <LegendItem color="#F59E42" label={`Fading ${fadingPct}%`} />
            <LegendItem color="#EF4444" label={`Stale ${stalePct}%`} />
            <LegendItem color="#7B8BA5" label={`Decayed ${decayedPct}%`} />
          </View>
          <Text style={styles.healthSummary}>
            {totalTopics} topics · Predicted {retentionEst}% retention on exam day
          </Text>
        </V4Card>

        <V4Tip
          message="Fresh = strong recall. Fading = review soon to retain. Stale = urgent review needed. Decayed = needs re-learning."
          variant="info"
        />

        {/* Revise Today */}
        {dueToday.length > 0 && (
          <>
            <V4SectionLabel text={`Revise Today (${dueToday.length})`} style={styles.sectionLabel} />
            {dueToday.map((rev) => {
              const urgency = getUrgency(rev.due);
              return (
                <V4Card key={rev.topic_id} style={[styles.revisionCard, { borderLeftColor: urgency.color }]}>
                  <View style={styles.revRow}>
                    <View style={styles.revInfo}>
                      <Text style={styles.revTopic} numberOfLines={1}>{rev.topic_name}</Text>
                      <Text style={styles.revMeta}>Stability: {rev.stability.toFixed(1)}d</Text>
                    </View>
                    <V4Pill label={urgency.label} variant={urgency.variant} />
                  </View>
                </V4Card>
              );
            })}
          </>
        )}

        {/* This week */}
        {dueThisWeek.length > 0 && (
          <>
            <V4SectionLabel text={`This Week (${dueThisWeek.length})`} style={styles.sectionLabel} />
            {dueThisWeek.map((rev) => {
              const urgency = getUrgency(rev.due);
              return (
                <V4Card key={rev.topic_id} style={[styles.revisionCard, { borderLeftColor: urgency.color }]}>
                  <View style={styles.revRow}>
                    <View style={styles.revInfo}>
                      <Text style={styles.revTopic} numberOfLines={1}>{rev.topic_name}</Text>
                      <Text style={styles.revMeta}>Stability: {rev.stability.toFixed(1)}d</Text>
                    </View>
                    <V4Pill label={urgency.label} variant={urgency.variant} />
                  </View>
                </V4Card>
              );
            })}
          </>
        )}

        {/* Coming up */}
        {comingUp.length > 0 && (
          <>
            <V4SectionLabel text="Coming Up" style={styles.sectionLabel} />
            <View style={{ opacity: 0.6 }}>
              {comingUp.map((rev) => (
                <V4Card key={rev.topic_id} style={styles.revisionCard}>
                  <View style={styles.revRow}>
                    <Text style={styles.revTopic} numberOfLines={1}>{rev.topic_name}</Text>
                    <Text style={styles.revMeta}>Due {new Date(rev.due).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })}</Text>
                  </View>
                </V4Card>
              ))}
            </View>
          </>
        )}

        {revisions.length === 0 && (
          <V4Card style={styles.section}>
            <Text style={styles.emptyText}>No revisions due right now. Great work!</Text>
          </V4Card>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
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
    marginBottom: theme.spacing.lg,
  },
  metricsRow: { flexDirection: 'row', marginBottom: 16 },
  sectionLabel: { marginTop: 16, marginBottom: 8, marginLeft: 2 },
  section: { marginBottom: 8 },

  // Memory health
  stackedBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  stackSeg: { height: 12 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  healthSummary: { fontSize: 12, color: theme.colors.textMuted },

  // Revision cards
  revisionCard: {
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.border,
  },
  revRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  revInfo: { flex: 1, marginRight: 8 },
  revTopic: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  revMeta: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
  emptyText: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: 20 },
});
