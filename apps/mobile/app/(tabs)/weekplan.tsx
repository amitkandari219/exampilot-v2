import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert, Modal, Pressable,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { Theme } from '../../constants/theme';
import { useWeekPlan, WeekPlanData } from '../../hooks/useWeekPlan';
import { useMovePlanItem, useDeferPlanItemV2 } from '../../hooks/usePlanner';
import { V4Card } from '../../components/v4/V4Card';
import { V4Bar } from '../../components/v4/V4Bar';
import { V4Pill } from '../../components/v4/V4Pill';
import { V4SectionLabel } from '../../components/v4/V4SectionLabel';
import { V4Tip } from '../../components/v4/V4Tip';
import { DailyPlanItem, PlanItemType } from '../../types';
import { toDateString } from '../../lib/dateUtils';

const TYPE_COLORS: Record<PlanItemType, { color: string; variant: 'accent' | 'purple' | 'danger' | 'warn' }> = {
  new: { color: '#3ECFB4', variant: 'accent' },
  revision: { color: '#A78BFA', variant: 'purple' },
  decay_revision: { color: '#EF4444', variant: 'danger' },
  stretch: { color: '#F59E42', variant: 'warn' },
};

const TYPE_LABELS: Record<PlanItemType, string> = {
  new: 'NEW',
  revision: 'REVISION',
  decay_revision: 'DECAY',
  stretch: 'DAILY',
};

export default function WeekPlanScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { daysUsed, isVeteran } = useUser();
  const [weekOffset, setWeekOffset] = useState(0);
  const { data: weekPlan, isLoading } = useWeekPlan(weekOffset);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [moveModal, setMoveModal] = useState<{ itemId: string; currentDate: string } | null>(null);
  const movePlanItem = useMovePlanItem();
  const deferPlanItem = useDeferPlanItemV2();

  const today = toDateString(new Date());

  const toggleDay = useCallback((date: string) => {
    setExpandedDays((prev) => ({ ...prev, [date]: !prev[date] }));
  }, []);

  const handleMove = useCallback((itemId: string, targetDate: string) => {
    movePlanItem.mutate({ itemId, targetDate }, {
      onSuccess: (result) => {
        setMoveModal(null);
        if (result?.overCapacity) {
          Alert.alert('Day is full', 'Task was moved but the target day exceeds capacity.');
        }
      },
    });
  }, [movePlanItem]);

  const handleDefer = useCallback((itemId: string) => {
    deferPlanItem.mutate(itemId);
  }, [deferPlanItem]);

  // Compute progress
  const progressPct = weekPlan && weekPlan.totalTargetHours > 0
    ? Math.min(100, Math.round((weekPlan.totalPlannedHours / weekPlan.totalTargetHours) * 100))
    : 0;

  // Distribution labels
  const distTotal = weekPlan ? Object.values(weekPlan.taskDistribution).reduce((a, b) => a + b, 0) : 0;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.accent} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Week Plan</Text>

        {/* Week toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, weekOffset === 0 && { backgroundColor: theme.colors.accent }]}
            onPress={() => setWeekOffset(0)}
          >
            <Text style={[styles.toggleText, weekOffset === 0 && { color: theme.colors.background }]}>This Week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, weekOffset === 1 && { backgroundColor: theme.colors.accent }]}
            onPress={() => setWeekOffset(1)}
          >
            <Text style={[styles.toggleText, weekOffset === 1 && { color: theme.colors.background }]}>Next Week</Text>
          </TouchableOpacity>
        </View>

        {/* Weekly summary */}
        {weekPlan && (
          <V4Card style={styles.summaryCard}>
            <Text style={styles.dateRange}>{weekPlan.weekStart} — {weekPlan.weekEnd}</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryHours}>
                {weekPlan.totalPlannedHours}h
                <Text style={styles.summaryTarget}> / {weekPlan.totalTargetHours}h</Text>
              </Text>
              <Text style={styles.summaryPct}>{progressPct}%</Text>
            </View>
            <V4Bar progress={progressPct} height={6} />

            {/* Task distribution */}
            {distTotal > 0 && (
              <View style={styles.distRow}>
                {Object.entries(weekPlan.taskDistribution).map(([type, count]) => {
                  const tc = TYPE_COLORS[type as PlanItemType];
                  return (
                    <View key={type} style={styles.distItem}>
                      <View style={[styles.distDot, { backgroundColor: tc?.color || theme.colors.textMuted }]} />
                      <Text style={styles.distLabel}>{TYPE_LABELS[type as PlanItemType] || type} {count}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </V4Card>
        )}

        {/* First-week behavior */}
        {!isVeteran && daysUsed <= 7 && (
          <V4Tip
            message="Your first week is tentative. Plans adjust as we learn your pace and preferences."
            variant="info"
          />
        )}

        {/* Day rows */}
        {weekPlan?.days.map((day) => {
          const isToday = day.date === today;
          const isPast = day.date < today;
          const isExpanded = expandedDays[day.date] ?? isToday;
          const items: DailyPlanItem[] = (day.plan as any)?.items || [];
          const dayHours = items.reduce((sum, it) => sum + (it.estimated_hours || 0), 0);
          const completedCount = items.filter((it) => it.status === 'completed').length;

          // First-week: show learning placeholder for days > 3
          const showLearningPlaceholder = !isVeteran && daysUsed <= 7 && weekOffset === 0;
          const dayIndex = weekPlan.days.indexOf(day);
          if (showLearningPlaceholder && dayIndex >= 3 && !day.plan) {
            return (
              <V4Card key={day.date} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <View style={styles.dayLeft}>
                    <Text style={styles.dayName}>{day.dayName}</Text>
                    <Text style={styles.dayDate}>{day.date.slice(5)}</Text>
                  </View>
                  <V4Pill label="LEARNING" variant="purple" />
                </View>
                <Text style={styles.learningText}>
                  We're still learning your pace. This day will fill in as you study.
                </Text>
              </V4Card>
            );
          }

          return (
            <TouchableOpacity key={day.date} onPress={() => toggleDay(day.date)} activeOpacity={0.7}>
              <V4Card style={[styles.dayCard, isToday && { borderLeftWidth: 3, borderLeftColor: theme.colors.accent }]}>
                <View style={styles.dayHeader}>
                  <View style={styles.dayLeft}>
                    <Text style={[styles.dayName, isPast && { opacity: 0.5 }]}>{day.dayName}</Text>
                    <Text style={styles.dayDate}>{day.date.slice(5)}</Text>
                    {isToday && <V4Pill label="TODAY" variant="accent" />}
                  </View>
                  <View style={styles.dayRight}>
                    <Text style={styles.dayMeta}>{items.length} tasks · {dayHours.toFixed(1)}h</Text>
                    {completedCount > 0 && (
                      <Text style={styles.dayDone}>{completedCount}/{items.length} done</Text>
                    )}
                  </View>
                </View>

                {/* Expanded task list */}
                {isExpanded && items.length > 0 && (
                  <View style={styles.taskList}>
                    {items.map((item) => {
                      const tc = TYPE_COLORS[item.type] || TYPE_COLORS.new;
                      const isComplete = item.status === 'completed';
                      return (
                        <View
                          key={item.id}
                          style={[
                            styles.taskRow,
                            { borderLeftColor: tc.color },
                            isComplete && { opacity: 0.5 },
                          ]}
                        >
                          <View style={styles.taskInfo}>
                            <V4Pill label={TYPE_LABELS[item.type] || 'NEW'} variant={tc.variant} />
                            <Text style={styles.taskSubject} numberOfLines={1}>
                              {(item as any).subject_name || ''}
                            </Text>
                            <Text style={styles.taskTopic} numberOfLines={1}>
                              {(item as any).topic?.name || 'Topic'}
                            </Text>
                            <Text style={styles.taskHours}>{item.estimated_hours}h</Text>
                          </View>

                          {!isComplete && !isPast && (
                            <View style={styles.taskActions}>
                              <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => setMoveModal({ itemId: item.id, currentDate: day.date })}
                              >
                                <Text style={styles.actionBtnText}>Move</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => handleDefer(item.id)}
                              >
                                <Text style={styles.actionBtnText}>Defer</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}

                {isExpanded && items.length === 0 && (
                  <Text style={styles.noTasks}>No tasks planned</Text>
                )}
              </V4Card>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Move day picker modal */}
      {moveModal && weekPlan && (
        <Modal transparent animationType="fade" onRequestClose={() => setMoveModal(null)}>
          <Pressable style={styles.modalOverlay} onPress={() => setMoveModal(null)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Move to which day?</Text>
              <View style={styles.dayPicker}>
                {weekPlan.days.map((day) => {
                  const isPast = day.date < today;
                  const isCurrent = day.date === moveModal.currentDate;
                  return (
                    <TouchableOpacity
                      key={day.date}
                      style={[
                        styles.dayPickerBtn,
                        isPast && styles.dayPickerDisabled,
                        isCurrent && { borderColor: theme.colors.accent, borderWidth: 2 },
                      ]}
                      onPress={() => !isPast && !isCurrent && handleMove(moveModal.itemId, day.date)}
                      disabled={isPast || isCurrent}
                    >
                      <Text style={[
                        styles.dayPickerText,
                        isPast && { color: theme.colors.textMuted },
                        day.date === today && { color: theme.colors.accent },
                      ]}>{day.dayName}</Text>
                      <Text style={[styles.dayPickerDate, isPast && { color: theme.colors.textMuted }]}>
                        {day.date.slice(8)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setMoveModal(null)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1 },
  content: { padding: theme.spacing.lg, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },

  // Toggle
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  toggleText: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },

  // Summary
  summaryCard: { marginBottom: 12 },
  dateRange: { fontSize: 12, color: theme.colors.textMuted, marginBottom: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  summaryHours: { fontSize: 22, fontWeight: '800', color: theme.colors.text },
  summaryTarget: { fontSize: 14, fontWeight: '400', color: theme.colors.textSecondary },
  summaryPct: { fontSize: 16, fontWeight: '700', color: theme.colors.accent },
  distRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  distItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distDot: { width: 8, height: 8, borderRadius: 4 },
  distLabel: { fontSize: 11, color: theme.colors.textSecondary },

  // Day cards
  dayCard: { marginBottom: 8 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayRight: { alignItems: 'flex-end' },
  dayName: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  dayDate: { fontSize: 12, color: theme.colors.textMuted },
  dayMeta: { fontSize: 12, color: theme.colors.textSecondary },
  dayDone: { fontSize: 11, color: theme.colors.success, marginTop: 2 },
  learningText: { fontSize: 12, color: theme.colors.textMuted, marginTop: 8, fontStyle: 'italic' },
  noTasks: { fontSize: 12, color: theme.colors.textMuted, marginTop: 8, fontStyle: 'italic' },

  // Task list
  taskList: { marginTop: 10 },
  taskRow: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingVertical: 8,
    marginBottom: 6,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    paddingRight: 10,
  },
  taskInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  taskSubject: { fontSize: 11, color: theme.colors.textMuted, maxWidth: 80 },
  taskTopic: { fontSize: 13, color: theme.colors.text, flex: 1 },
  taskHours: { fontSize: 12, color: theme.colors.textSecondary },
  taskActions: { flexDirection: 'row', gap: 8, marginTop: 6 },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionBtnText: { fontSize: 11, color: theme.colors.textSecondary },

  // Move modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    width: '85%',
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 16, textAlign: 'center' },
  dayPicker: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  dayPickerBtn: {
    width: 56,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dayPickerDisabled: { opacity: 0.4 },
  dayPickerText: { fontSize: 12, fontWeight: '600', color: theme.colors.text },
  dayPickerDate: { fontSize: 10, color: theme.colors.textSecondary, marginTop: 2 },
  modalCancel: { marginTop: 16, alignItems: 'center' },
  modalCancelText: { fontSize: 14, color: theme.colors.textSecondary },
});
