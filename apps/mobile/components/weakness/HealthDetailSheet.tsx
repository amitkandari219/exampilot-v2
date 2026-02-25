import React, { useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import { useTopicHealth } from '../../hooks/useWeakness';
import type { HealthCategory } from '../../types';

interface HealthDetailSheetProps {
  visible: boolean;
  topicId: string;
  topicName: string;
  onClose: () => void;
}

function getCategoryColors(theme: Theme) {
  return {
    critical: theme.colors.error,
    weak: theme.colors.orange,
    moderate: theme.colors.warning,
    strong: theme.colors.success,
    exam_ready: theme.colors.primary,
  };
}

const CATEGORY_LABELS: Record<HealthCategory, string> = {
  critical: 'Critical',
  weak: 'Weak',
  moderate: 'Moderate',
  strong: 'Strong',
  exam_ready: 'Ready',
};

const COMPONENTS: { key: 'confidence' | 'revision' | 'effort' | 'stability'; label: string; weight: string }[] = [
  { key: 'confidence', label: 'Confidence', weight: '40%' },
  { key: 'revision', label: 'Revision', weight: '25%' },
  { key: 'effort', label: 'Effort', weight: '20%' },
  { key: 'stability', label: 'Stability', weight: '15%' },
];

function getBarColor(score: number, theme: Theme): string {
  if (score >= 70) return theme.colors.success;
  if (score >= 40) return theme.colors.warning;
  return theme.colors.error;
}

export function HealthDetailSheet({ visible, topicId, topicName, onClose }: HealthDetailSheetProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data: health, isLoading } = useTopicHealth(topicId);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title} numberOfLines={2}>{topicName}</Text>

          {isLoading && (
            <Text style={styles.loadingText}>Loading...</Text>
          )}

          {health && (
            <>
              <View style={styles.scoreRow}>
                <Text style={[styles.bigScore, { color: getCategoryColors(theme)[health.category] }]}>
                  {health.health_score}
                </Text>
                <View style={[styles.categoryPill, { backgroundColor: getCategoryColors(theme)[health.category] + '20' }]}>
                  <Text style={[styles.categoryText, { color: getCategoryColors(theme)[health.category] }]}>
                    {CATEGORY_LABELS[health.category]}
                  </Text>
                </View>
              </View>

              <View style={styles.componentsSection}>
                {COMPONENTS.map(({ key, label, weight }) => {
                  const value = health.components[key];
                  const barColor = getBarColor(value, theme);
                  return (
                    <View key={key} style={styles.componentRow}>
                      <View style={styles.componentLabelRow}>
                        <Text style={styles.componentLabel}>{label}</Text>
                        <Text style={styles.componentWeight}>{weight}</Text>
                      </View>
                      <View style={styles.barContainer}>
                        <View style={styles.barBg}>
                          <View style={[styles.barFill, { width: `${value}%`, backgroundColor: barColor }]} />
                        </View>
                        <Text style={[styles.componentValue, { color: barColor }]}>{value}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {health.recommendation ? (
                <View style={styles.recSection}>
                  <Text style={styles.recLabel}>Recommendation</Text>
                  <Text style={styles.recText}>{health.recommendation}</Text>
                </View>
              ) : null}
            </>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: theme.spacing.xl,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  loadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: theme.spacing.xl,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  bigScore: {
    fontSize: 36,
    fontWeight: '800',
  },
  categoryPill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  categoryText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  componentsSection: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  componentRow: {
    gap: 4,
  },
  componentLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  componentLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
  },
  componentWeight: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  barBg: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  componentValue: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'right',
  },
  recSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  recLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  recText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  closeButton: {
    marginHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  closeText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
});
