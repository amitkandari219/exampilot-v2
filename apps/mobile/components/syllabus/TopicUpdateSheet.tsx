import React, {  useState, useEffect , useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import type { TopicWithProgress, TopicStatus } from '../../types';

interface TopicUpdateSheetProps {
  visible: boolean;
  topic: TopicWithProgress | null;
  onClose: () => void;
  onSave: (updates: {
    status: TopicStatus;
    hours_spent: number;
    confidence_score: number;
    notes: string;
  }) => void;
}

const ALL_STATUSES: { value: TopicStatus; label: string }[] = [
  { value: 'untouched', label: 'Untouched' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'first_pass', label: 'First Pass' },
  { value: 'revised', label: 'Revised' },
  { value: 'exam_ready', label: 'Exam Ready' },
  { value: 'deferred_scope', label: 'Deferred' },
];

export function TopicUpdateSheet({ visible, topic, onClose, onSave }: TopicUpdateSheetProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [status, setStatus] = useState<TopicStatus>('untouched');
  const [hoursSpent, setHoursSpent] = useState('0');
  const [confidence, setConfidence] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (topic) {
      const progress = topic.user_progress;
      setStatus(progress?.status ?? 'untouched');
      setHoursSpent(String(progress?.actual_hours_spent ?? 0));
      setConfidence(progress?.confidence_score ?? 0);
      setNotes(progress?.notes ?? '');
    }
  }, [topic]);

  const handleSave = () => {
    onSave({
      status,
      hours_spent: parseFloat(hoursSpent) || 0,
      confidence_score: confidence,
      notes,
    });
  };

  const adjustConfidence = (delta: number) => {
    setConfidence((prev) => Math.max(0, Math.min(100, prev + delta)));
  };

  if (!topic) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title} numberOfLines={2}>
            {topic.name}
          </Text>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Status Picker */}
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusGrid}>
              {ALL_STATUSES.map((s) => (
                <TouchableOpacity
                  key={s.value}
                  style={[styles.statusChip, status === s.value && styles.statusChipActive]}
                  onPress={() => setStatus(s.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      status === s.value && styles.statusChipTextActive,
                    ]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Hours Spent */}
            <Text style={styles.label}>Hours Spent</Text>
            <TextInput
              style={styles.input}
              value={hoursSpent}
              onChangeText={setHoursSpent}
              keyboardType="decimal-pad"
              placeholderTextColor={theme.colors.textMuted}
              placeholder="0"
            />

            {/* Confidence Slider */}
            <View style={styles.confidenceLabelRow}>
              <Text style={styles.label}>Confidence</Text>
              <Text style={styles.confidenceValue}>{confidence}</Text>
            </View>
            <View style={styles.confidenceBarContainer}>
              <View style={styles.confidenceBarBg}>
                <View
                  style={[styles.confidenceBarFill, { width: `${confidence}%` }]}
                />
              </View>
            </View>
            <View style={styles.sliderRow}>
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() => adjustConfidence(-10)}
                activeOpacity={0.7}
              >
                <Text style={styles.sliderButtonText}>-10</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() => adjustConfidence(-5)}
                activeOpacity={0.7}
              >
                <Text style={styles.sliderButtonText}>-5</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() => adjustConfidence(5)}
                activeOpacity={0.7}
              >
                <Text style={styles.sliderButtonText}>+5</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() => adjustConfidence(10)}
                activeOpacity={0.7}
              >
                <Text style={styles.sliderButtonText}>+10</Text>
              </TouchableOpacity>
            </View>

            {/* Notes */}
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              placeholderTextColor={theme.colors.textMuted}
              placeholder="Add notes..."
              textAlignVertical="top"
            />
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.7}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
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
    maxHeight: '85%',
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
    marginBottom: theme.spacing.md,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  statusChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '15',
  },
  statusChipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  statusChipTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  notesInput: {
    minHeight: 80,
  },
  confidenceLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  confidenceValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  sliderButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  sliderButtonText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  confidenceBarContainer: {
    marginTop: theme.spacing.sm,
  },
  confidenceBarBg: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  saveText: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.background,
  },
});
