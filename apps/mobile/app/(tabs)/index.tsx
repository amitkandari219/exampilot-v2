import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useStress } from '../../hooks/useStress';
import { useVelocity } from '../../hooks/useVelocity';
import { useBuffer } from '../../hooks/useVelocity';
import { useBurnout } from '../../hooks/useBurnout';
import { useDailyPlan } from '../../hooks/usePlanner';
import { useConfidenceOverview } from '../../hooks/useFSRS';
import { useWeaknessOverview } from '../../hooks/useWeakness';
import { StressThermometer } from '../../components/dashboard/StressThermometer';
import { VelocityCard } from '../../components/dashboard/VelocityCard';
import { BufferBankCard } from '../../components/dashboard/BufferBankCard';
import { BurnoutIndicator } from '../../components/dashboard/BurnoutIndicator';
import { WeaknessRadarCard } from '../../components/weakness/WeaknessRadarCard';
import { ConfidenceStatus } from '../../types';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: stress, isLoading: stressLoading } = useStress();
  const { data: velocity } = useVelocity();
  const { data: buffer } = useBuffer();
  const { data: burnout } = useBurnout();
  const { data: plan } = useDailyPlan();
  const { data: confidence } = useConfidenceOverview();
  const { data: weakness } = useWeaknessOverview();

  const greeting = getGreeting();
  const userName = user?.user_metadata?.name || 'Aspirant';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}, {userName}</Text>
            <Text style={styles.subtitle}>ExamPilot Dashboard</Text>
          </View>
          {burnout && (
            <BurnoutIndicator
              briScore={burnout.bri_score}
              status={burnout.status}
              inRecovery={burnout.in_recovery}
            />
          )}
        </View>

        {stress && (
          <View style={styles.section}>
            <StressThermometer
              score={stress.score}
              status={stress.status}
              label={stress.label}
              signals={stress.signals}
              recommendation={stress.recommendation}
              history={stress.history?.map((h) => h.score)}
            />
          </View>
        )}

        {velocity && (
          <View style={styles.section}>
            <VelocityCard
              velocityRatio={velocity.velocity_ratio}
              status={velocity.status}
              trend={velocity.trend}
              projectedDate={velocity.projected_completion_date}
              streak={velocity.streak}
            />
          </View>
        )}

        {buffer && (
          <View style={styles.section}>
            <BufferBankCard
              balance={buffer.balance}
              capacity={buffer.capacity}
              lastTransaction={buffer.transactions?.[0] || null}
            />
          </View>
        )}

        {weakness && (
          <View style={styles.section}>
            <WeaknessRadarCard data={weakness} />
          </View>
        )}

        {plan && plan.items && plan.items.length > 0 && (
          <View style={styles.section}>
            <View style={styles.planPreview}>
              <View style={styles.planHeader}>
                <Text style={styles.sectionTitle}>Today's Plan</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/planner')}>
                  <Text style={styles.viewAll}>View full plan</Text>
                </TouchableOpacity>
              </View>
              {plan.items.slice(0, 3).map((item) => (
                <View key={item.id} style={styles.planItem}>
                  <View style={[styles.statusDot, {
                    backgroundColor: item.status === 'completed' ? theme.colors.success : theme.colors.border,
                  }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.planItemName, item.status === 'completed' && styles.completed]}>
                      {item.topic?.name || 'Topic'}
                    </Text>
                    <Text style={styles.planItemMeta}>
                      {item.type.toUpperCase()} - {item.estimated_hours}h
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {confidence && (
          <View style={styles.section}>
            <View style={styles.confCard}>
              <Text style={styles.sectionTitle}>Confidence Distribution</Text>
              <View style={styles.confRow}>
                {(['fresh', 'fading', 'stale', 'decayed'] as ConfidenceStatus[]).map((status) => {
                  const count = confidence.distribution[status] || 0;
                  const colors: Record<ConfidenceStatus, string> = {
                    fresh: theme.colors.success,
                    fading: theme.colors.warning,
                    stale: '#F97316',
                    decayed: theme.colors.error,
                  };
                  return (
                    <View key={status} style={styles.confItem}>
                      <Text style={[styles.confCount, { color: colors[status] }]}>{count}</Text>
                      <Text style={styles.confLabel}>{status}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {stressLoading && !stress && (
          <View style={styles.loadingSection}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        )}

        <View style={{ height: theme.spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, padding: theme.spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  greeting: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  planPreview: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  viewAll: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  planItemName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  completed: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  planItemMeta: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  confCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  confRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.sm,
  },
  confItem: { alignItems: 'center' },
  confCount: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
  },
  confLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textTransform: 'capitalize',
  },
  loadingSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
});
