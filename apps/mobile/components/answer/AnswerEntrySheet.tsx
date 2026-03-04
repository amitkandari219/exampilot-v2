import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import { useLogAnswer } from '../../hooks/useAnswerWriting';

interface AnswerEntrySheetProps {
  visible: boolean;
  onClose: () => void;
}

export function AnswerEntrySheet({ visible, onClose }: AnswerEntrySheetProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const logAnswer = useLogAnswer();

  const [wordCount, setWordCount] = useState('');
  const [timeTaken, setTimeTaken] = useState('');
  const [selfScore, setSelfScore] = useState(5);
  const [questionText, setQuestionText] = useState('');

  const handleSubmit = () => {
    logAnswer.mutate({
      word_count: wordCount ? parseInt(wordCount, 10) : undefined,
      time_taken_minutes: timeTaken ? parseInt(timeTaken, 10) : undefined,
      self_score: selfScore,
      question_text: questionText || undefined,
    }, {
      onSuccess: () => {
        setWordCount('');
        setTimeTaken('');
        setSelfScore(5);
        setQuestionText('');
        onClose();
      },
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Log Answer Practice</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeBtn}>x</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Question (optional)</Text>
            <TextInput
              style={styles.input}
              value={questionText}
              onChangeText={setQuestionText}
              placeholder="e.g. Discuss the role of judiciary..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
            />

            <Text style={styles.label}>Word Count</Text>
            <TextInput
              style={styles.input}
              value={wordCount}
              onChangeText={setWordCount}
              keyboardType="numeric"
              placeholder="e.g. 250"
              placeholderTextColor={theme.colors.textMuted}
            />

            <Text style={styles.label}>Time Taken (minutes)</Text>
            <TextInput
              style={styles.input}
              value={timeTaken}
              onChangeText={setTimeTaken}
              keyboardType="numeric"
              placeholder="e.g. 15"
              placeholderTextColor={theme.colors.textMuted}
            />

            <Text style={styles.label}>Self Score: {selfScore}/10</Text>
            <View style={styles.scoreRow}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <TouchableOpacity
                  key={n}
                  style={[styles.scoreDot, n === selfScore && { backgroundColor: theme.colors.accent }]}
                  onPress={() => setSelfScore(n)}
                >
                  <Text style={[styles.scoreNum, n === selfScore && { color: theme.colors.background }]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={logAnswer.isPending}>
              <Text style={styles.submitText}>{logAnswer.isPending ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: theme.colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  closeBtn: { fontSize: 20, color: theme.colors.textMuted, paddingHorizontal: 8 },
  label: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: theme.colors.surface, borderRadius: 10, padding: 12, fontSize: 14, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border },
  scoreRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 },
  scoreDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  scoreNum: { fontSize: 12, fontWeight: '700', color: theme.colors.text },
  submitBtn: { backgroundColor: theme.colors.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  submitText: { color: theme.colors.background, fontWeight: '700', fontSize: 15 },
});
