import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { theme } from '../../constants/theme';
import { useCreateMock } from '../../hooks/useMockTest';
import { useSyllabusProgress } from '../../hooks/useSyllabus';

interface Props {
  visible: boolean;
  onClose: () => void;
}

type EntryMode = 'quick' | 'detailed';

interface SubjectBreakdownEntry {
  subject_id: string;
  subject_name: string;
  total: string;
  correct: string;
}

interface QuestionRow {
  subject_id: string;
  topic_id: string;
  is_correct: boolean;
}

export function MockEntrySheet({ visible, onClose }: Props) {
  const [mode, setMode] = useState<EntryMode>('quick');
  const [testName, setTestName] = useState('');
  const [totalQuestions, setTotalQuestions] = useState('100');
  const [correct, setCorrect] = useState('');
  const [incorrect, setIncorrect] = useState('');
  const [showSubjectBreakdown, setShowSubjectBreakdown] = useState(false);
  const [subjectBreakdown, setSubjectBreakdown] = useState<SubjectBreakdownEntry[]>([]);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);

  const { data: subjects } = useSyllabusProgress();
  const createMock = useCreateMock();

  const resetForm = () => {
    setTestName('');
    setTotalQuestions('100');
    setCorrect('');
    setIncorrect('');
    setShowSubjectBreakdown(false);
    setSubjectBreakdown([]);
    setQuestions([]);
    setMode('quick');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubjectToggle = () => {
    if (!showSubjectBreakdown && subjects) {
      setSubjectBreakdown(
        subjects.map((s: any) => ({ subject_id: s.id, subject_name: s.name, total: '', correct: '' }))
      );
    }
    setShowSubjectBreakdown(!showSubjectBreakdown);
  };

  const updateBreakdown = (index: number, field: 'total' | 'correct', value: string) => {
    setSubjectBreakdown((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addQuestion = () => {
    const firstSubject = subjects?.[0];
    setQuestions((prev) => [...prev, {
      subject_id: firstSubject?.id || '',
      topic_id: '',
      is_correct: false,
    }]);
  };

  const updateQuestion = (index: number, field: keyof QuestionRow, value: any) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!testName.trim()) {
      Alert.alert('Error', 'Please enter a test name');
      return;
    }
    const total = parseInt(totalQuestions, 10);
    if (!total || total <= 0) {
      Alert.alert('Error', 'Total questions must be greater than 0');
      return;
    }

    if (mode === 'quick') {
      const c = parseInt(correct, 10) || 0;
      const inc = parseInt(incorrect, 10) || 0;
      if (c + inc > total) {
        Alert.alert('Error', 'Correct + Incorrect cannot exceed total questions');
        return;
      }

      const payload: Record<string, unknown> = {
        test_name: testName.trim(),
        total_questions: total,
        correct: c,
        incorrect: inc,
      };

      if (showSubjectBreakdown) {
        const breakdown = subjectBreakdown
          .filter((sb) => parseInt(sb.total, 10) > 0)
          .map((sb) => ({
            subject_id: sb.subject_id,
            total: parseInt(sb.total, 10) || 0,
            correct: parseInt(sb.correct, 10) || 0,
          }));
        if (breakdown.length > 0) {
          payload.subject_breakdown = breakdown;
        }
      }

      createMock.mutate(payload, {
        onSuccess: () => handleClose(),
        onError: (err: any) => Alert.alert('Error', err.message || 'Failed to save mock test'),
      });
    } else {
      // Detailed mode
      if (questions.length === 0) {
        Alert.alert('Error', 'Add at least one question');
        return;
      }

      const payload: Record<string, unknown> = {
        test_name: testName.trim(),
        total_questions: total,
        correct: 0,
        incorrect: 0,
        questions: questions.map((q) => ({
          subject_id: q.subject_id,
          topic_id: q.topic_id || null,
          is_correct: q.is_correct,
          is_attempted: true,
        })),
      };

      createMock.mutate(payload, {
        onSuccess: () => handleClose(),
        onError: (err: any) => Alert.alert('Error', err.message || 'Failed to save mock test'),
      });
    }
  };

  const totalNum = parseInt(totalQuestions, 10) || 0;
  const correctNum = parseInt(correct, 10) || 0;
  const incorrectNum = parseInt(incorrect, 10) || 0;
  const unattempted = Math.max(0, totalNum - correctNum - incorrectNum);
  const score = (correctNum * 2) - (incorrectNum * 0.66);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Record Mock Test</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeBtn}>X</Text>
            </TouchableOpacity>
          </View>

          {/* Mode Toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'quick' && styles.modeBtnActive]}
              onPress={() => setMode('quick')}
            >
              <Text style={[styles.modeBtnText, mode === 'quick' && styles.modeBtnTextActive]}>Quick</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'detailed' && styles.modeBtnActive]}
              onPress={() => setMode('detailed')}
            >
              <Text style={[styles.modeBtnText, mode === 'detailed' && styles.modeBtnTextActive]}>Detailed</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {/* Common Fields */}
            <Text style={styles.label}>Test Name</Text>
            <TextInput
              style={styles.input}
              value={testName}
              onChangeText={setTestName}
              placeholder="e.g. Prelims Mock 4"
              placeholderTextColor={theme.colors.textMuted}
            />

            <Text style={styles.label}>Total Questions</Text>
            <TextInput
              style={styles.input}
              value={totalQuestions}
              onChangeText={setTotalQuestions}
              keyboardType="number-pad"
              placeholderTextColor={theme.colors.textMuted}
            />

            {mode === 'quick' ? (
              <>
                <View style={styles.row}>
                  <View style={styles.halfField}>
                    <Text style={styles.label}>Correct</Text>
                    <TextInput
                      style={styles.input}
                      value={correct}
                      onChangeText={setCorrect}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={theme.colors.textMuted}
                    />
                  </View>
                  <View style={styles.halfField}>
                    <Text style={styles.label}>Incorrect</Text>
                    <TextInput
                      style={styles.input}
                      value={incorrect}
                      onChangeText={setIncorrect}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={theme.colors.textMuted}
                    />
                  </View>
                </View>

                <View style={styles.previewRow}>
                  <Text style={styles.previewText}>Unattempted: {unattempted}</Text>
                  <Text style={styles.previewText}>Score: {score.toFixed(1)} / {totalNum * 2}</Text>
                </View>

                {/* Subject Breakdown Toggle */}
                <TouchableOpacity style={styles.toggleRow} onPress={handleSubjectToggle}>
                  <Text style={styles.toggleText}>
                    {showSubjectBreakdown ? '- Hide' : '+ Add'} Subject Breakdown
                  </Text>
                </TouchableOpacity>

                {showSubjectBreakdown && subjectBreakdown.map((sb, i) => (
                  <View key={sb.subject_id} style={styles.breakdownRow}>
                    <Text style={styles.breakdownName} numberOfLines={1}>{sb.subject_name}</Text>
                    <TextInput
                      style={styles.breakdownInput}
                      value={sb.total}
                      onChangeText={(v) => updateBreakdown(i, 'total', v)}
                      keyboardType="number-pad"
                      placeholder="Tot"
                      placeholderTextColor={theme.colors.textMuted}
                    />
                    <TextInput
                      style={styles.breakdownInput}
                      value={sb.correct}
                      onChangeText={(v) => updateBreakdown(i, 'correct', v)}
                      keyboardType="number-pad"
                      placeholder="Cor"
                      placeholderTextColor={theme.colors.textMuted}
                    />
                  </View>
                ))}
              </>
            ) : (
              <>
                {/* Detailed Mode */}
                <Text style={styles.label}>Questions ({questions.length})</Text>
                {questions.map((q, i) => (
                  <View key={i} style={styles.questionRow}>
                    <Text style={styles.questionNum}>Q{i + 1}</Text>

                    {/* Subject Picker */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
                      {(subjects || []).map((s: any) => (
                        <TouchableOpacity
                          key={s.id}
                          style={[styles.chip, q.subject_id === s.id && styles.chipActive]}
                          onPress={() => updateQuestion(i, 'subject_id', s.id)}
                        >
                          <Text style={[styles.chipText, q.subject_id === s.id && styles.chipTextActive]} numberOfLines={1}>
                            {s.name.slice(0, 12)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    {/* Correct/Incorrect Toggle */}
                    <TouchableOpacity
                      style={[styles.resultBtn, q.is_correct ? styles.resultCorrect : styles.resultIncorrect]}
                      onPress={() => updateQuestion(i, 'is_correct', !q.is_correct)}
                    >
                      <Text style={styles.resultText}>{q.is_correct ? 'C' : 'X'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => removeQuestion(i)}>
                      <Text style={styles.removeBtn}>-</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity style={styles.addBtn} onPress={addQuestion}>
                  <Text style={styles.addBtnText}>+ Add Question</Text>
                </TouchableOpacity>
              </>
            )}

            <View style={{ height: theme.spacing.lg }} />
          </ScrollView>

          <TouchableOpacity
            style={[styles.submitBtn, createMock.isPending && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={createMock.isPending}
          >
            <Text style={styles.submitText}>
              {createMock.isPending ? 'Saving...' : 'Save Mock Test'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '90%',
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
  modeToggle: {
    flexDirection: 'row',
    margin: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    padding: 2,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  modeBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  modeBtnText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  modeBtnTextActive: {
    color: theme.colors.background,
  },
  body: {
    paddingHorizontal: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
    marginTop: theme.spacing.sm,
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
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  halfField: {
    flex: 1,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  previewText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  toggleRow: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  toggleText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  breakdownName: {
    flex: 1,
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
  },
  breakdownInput: {
    width: 50,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    padding: 6,
    color: theme.colors.text,
    fontSize: theme.fontSize.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    textAlign: 'center',
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    padding: 6,
  },
  questionNum: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    width: 24,
  },
  pickerScroll: {
    flex: 1,
    maxHeight: 28,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    marginRight: 4,
  },
  chipActive: {
    backgroundColor: theme.colors.primary + '30',
  },
  chipText: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
  },
  chipTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  resultBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCorrect: {
    backgroundColor: theme.colors.success + '30',
  },
  resultIncorrect: {
    backgroundColor: theme.colors.error + '30',
  },
  resultText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
    color: theme.colors.text,
  },
  removeBtn: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.error,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  addBtn: {
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  addBtnText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '600',
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
