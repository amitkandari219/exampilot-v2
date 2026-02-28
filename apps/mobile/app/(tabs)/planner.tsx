import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import { useDailyPlan, useCompletePlanItem, useDeferPlanItem } from '../../hooks/usePlanner';
import { PlanHeader } from '../../components/planner/PlanHeader';
import { PlanItemCard } from '../../components/planner/PlanItemCard';
import { RecoveryBanner } from '../../components/planner/RecoveryBanner';
import { useBurnout } from '../../hooks/useBurnout';
import { DailyPlanItem } from '../../types';
import { toDateString } from '../../lib/dateUtils';

export default function PlannerScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const today = toDateString(new Date());
  const { data: plan, isLoading } = useDailyPlan(today);
  const { data: burnout } = useBurnout();
  const completeMutation = useCompletePlanItem();
  const deferMutation = useDeferPlanItem();
  const [hoursModal, setHoursModal] = useState<{ itemId: string; estimated: number } | null>(null);
  const [hoursInput, setHoursInput] = useState('');

  const handleComplete = (itemId: string) => {
    const item = plan?.items?.find((i) => i.id === itemId);
    const estimated = item?.estimated_hours || 1;
    setHoursInput(String(estimated));
    setHoursModal({ itemId, estimated });
  };

  const confirmComplete = () => {
    if (!hoursModal) return;
    const hours = parseFloat(hoursInput) || hoursModal.estimated;
    completeMutation.mutate({ itemId: hoursModal.itemId, actualHours: hours });
    setHoursModal(null);
  };

  const handleDefer = (itemId: string) => {
    deferMutation.mutate(itemId);
  };

  const completedCount = plan?.items?.filter((i) => i.status === 'completed').length || 0;
  const totalCount = plan?.items?.length || 0;
  const allDone = totalCount > 0 && completedCount === totalCount;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        ListHeaderComponent={
          <>
            {plan && (
              <PlanHeader
                date={plan.plan_date}
                availableHours={plan.available_hours}
                energyLevel={plan.energy_level}
                isLightDay={plan.is_light_day}
              />
            )}
            {burnout?.in_recovery && burnout.recovery_day && (
              <RecoveryBanner day={burnout.recovery_day} totalDays={5} />
            )}
            {plan?.is_light_day && !burnout?.in_recovery && (
              <View style={styles.lightDayBanner}>
                <Text style={styles.lightDayText}>Light day - calibrated for sustainable progress</Text>
              </View>
            )}
          </>
        }
        data={plan?.items || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlanItemCard item={item} onComplete={handleComplete} onDefer={handleDefer} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No study items for today</Text>
            <Text style={styles.emptySubtext}>Your plan will generate automatically</Text>
          </View>
        }
        ListFooterComponent={
          <>
            {allDone && (
              <View style={styles.celebration}>
                <Text style={styles.celebrationText}>All done for today!</Text>
                <Text style={styles.celebrationSub}>Great work. Rest well.</Text>
              </View>
            )}
            {totalCount > 0 && (
              <View style={styles.progressFooter}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${(completedCount / totalCount) * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>{completedCount}/{totalCount} completed</Text>
              </View>
            )}
          </>
        }
        contentContainerStyle={styles.list}
      />
      <Modal visible={!!hoursModal} transparent animationType="fade" onRequestClose={() => setHoursModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>How long did you study?</Text>
            <TextInput
              style={styles.hoursInput}
              value={hoursInput}
              onChangeText={setHoursInput}
              keyboardType="decimal-pad"
              selectTextOnFocus
              autoFocus
            />
            <Text style={styles.hoursUnit}>hours</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setHoursModal(null)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={confirmComplete}>
                <Text style={styles.modalConfirmText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  list: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lightDayBanner: {
    backgroundColor: '#1E3A2F',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  lightDayText: {
    color: theme.colors.success,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  empty: { alignItems: 'center', paddingVertical: theme.spacing.xxl },
  emptyText: { fontSize: theme.fontSize.lg, color: theme.colors.textMuted, fontWeight: '600' },
  emptySubtext: { fontSize: theme.fontSize.sm, color: theme.colors.textMuted, marginTop: theme.spacing.xs },
  celebration: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  celebrationText: { fontSize: theme.fontSize.xl, fontWeight: '800', color: theme.colors.success },
  celebrationSub: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
  progressFooter: { marginTop: theme.spacing.md, alignItems: 'center' },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  hoursInput: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.primary,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
    minWidth: 80,
    paddingVertical: theme.spacing.xs,
  },
  hoursUnit: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  modalConfirm: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.background,
    fontWeight: '700',
  },
});
