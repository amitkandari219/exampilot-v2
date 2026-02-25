import React, {  useState, useEffect , useMemo } from 'react';
import {
  View, Text, StyleSheet, Modal, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import { useLogCA } from '../../hooks/useCurrentAffairs';
import { useSyllabusProgress } from '../../hooks/useSyllabus';
import type { CADailyLog } from '../../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  existing?: CADailyLog | null;
}

export function CALogSheet({ visible, onClose, existing }: Props) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [completed, setCompleted] = useState(true);
  const [hours, setHours] = useState('1');
  const [notes, setNotes] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const { data: subjects } = useSyllabusProgress();
  const logCA = useLogCA();

  useEffect(() => {
    if (existing) {
      setCompleted(existing.completed);
      setHours(String(existing.hours_spent));
      setNotes(existing.notes || '');
      setSelectedSubjects(existing.tags?.map((t) => t.subject_id) || []);
    } else {
      resetForm();
    }
  }, [existing, visible]);

  const resetForm = () => {
    setCompleted(true);
    setHours('1');
    setNotes('');
    setSelectedSubjects([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSubmit = () => {
    const hoursNum = parseFloat(hours) || 0;
    if (completed && hoursNum <= 0) {
      Alert.alert('Error', 'Please enter hours spent');
      return;
    }

    logCA.mutate(
      {
        hours_spent: completed ? hoursNum : 0,
        completed,
        notes: notes.trim() || undefined,
        subject_ids: selectedSubjects.length > 0 ? selectedSubjects : undefined,
      },
      {
        onSuccess: () => handleClose(),
        onError: (err: any) => Alert.alert('Error', err.message || 'Failed to log CA'),
      }
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Log Current Affairs</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeBtn}>X</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {/* Toggle: Did you read today? */}
            <Text style={styles.label}>Did you read the newspaper today?</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, completed && styles.toggleBtnActive]}
                onPress={() => setCompleted(true)}
              >
                <Text style={[styles.toggleText, completed && styles.toggleTextActive]}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, !completed && styles.toggleBtnNo]}
                onPress={() => setCompleted(false)}
              >
                <Text style={[styles.toggleText, !completed && styles.toggleTextActive]}>No</Text>
              </TouchableOpacity>
            </View>

            {completed && (
              <>
                {/* Hours */}
                <Text style={styles.label}>Hours Spent</Text>
                <TextInput
                  style={styles.input}
                  value={hours}
                  onChangeText={setHours}
                  keyboardType="decimal-pad"
                  placeholder="1.0"
                  placeholderTextColor={theme.colors.textMuted}
                />

                {/* Subject Tags */}
                <Text style={styles.label}>Subjects Covered (tap to select)</Text>
                <View style={styles.chipContainer}>
                  {(subjects || []).map((s: any) => {
                    const isSelected = selectedSubjects.includes(s.id);
                    return (
                      <TouchableOpacity
                        key={s.id}
                        style={[styles.chip, isSelected && styles.chipActive]}
                        onPress={() => toggleSubject(s.id)}
                      >
                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                          {s.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Notes */}
                <Text style={styles.label}>Notes (optional)</Text>
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Key topics, articles..."
                  placeholderTextColor={theme.colors.textMuted}
                  multiline
                  numberOfLines={3}
                />
              </>
            )}

            <View style={{ height: theme.spacing.lg }} />
          </ScrollView>

          <TouchableOpacity
            style={[styles.submitBtn, logCA.isPending && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={logCA.isPending}
          >
            <Text style={styles.submitText}>
              {logCA.isPending ? 'Saving...' : existing ? 'Update Log' : 'Save Log'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '85%',
    paddingBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    color: theme.colors.text,
  },
  closeBtn: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textMuted,
    fontWeight: '700',
    paddingHorizontal: theme.spacing.sm,
  },
  body: {
    paddingHorizontal: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
    marginTop: theme.spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toggleBtnActive: {
    backgroundColor: theme.colors.success + '20',
    borderColor: theme.colors.success,
  },
  toggleBtnNo: {
    backgroundColor: theme.colors.error + '20',
    borderColor: theme.colors.error,
  },
  toggleText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  toggleTextActive: {
    color: theme.colors.text,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  notesInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  chipTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    color: theme.colors.background,
  },
});
