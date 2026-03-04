import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, Modal, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform, Pressable, ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useCreateQuickLog } from '../../hooks/useQuickLog';

const SUBJECTS = [
  'Polity', 'History', 'Geography', 'Economics', 'Science',
  'Environment', 'Ethics', 'CSAT', 'Current Affairs', 'Answer Writing',
];

export function QuickLogFAB() {
  const { session } = useAuth();
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [mins, setMins] = useState(60);
  const [topic, setTopic] = useState('');
  const [success, setSuccess] = useState(false);
  const createLog = useCreateQuickLog();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!session) return null;

  const resetForm = () => {
    setSelectedSubject(null);
    setMins(60);
    setTopic('');
    setSuccess(false);
  };

  const handleClose = () => {
    setVisible(false);
    resetForm();
  };

  const handleSubmit = () => {
    if (!selectedSubject) return;
    const hours = mins / 60;
    const notes = selectedSubject + (topic.trim() ? ': ' + topic.trim() : '');
    createLog.mutate({ hours, notes }, {
      onSuccess: () => setSuccess(true),
    });
  };

  const canSubmit = selectedSubject !== null && !createLog.isPending;

  return (
    <>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalWrap}
          >
            <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
              <View style={styles.handle} />

              {success ? (
                <View style={styles.successContainer}>
                  <Text style={styles.successIcon}>✓</Text>
                  <Text style={styles.successTitle}>Logged!</Text>
                  <Text style={styles.successDetail}>
                    {mins} min of {selectedSubject} added to today
                  </Text>
                  <TouchableOpacity onPress={handleClose}>
                    <Text style={styles.closeLink}>Close</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.title}>Log Study Session</Text>

                  {/* Subject chips */}
                  <Text style={styles.label}>Subject</Text>
                  <View style={styles.chipGrid}>
                    {SUBJECTS.map((sub) => (
                      <TouchableOpacity
                        key={sub}
                        style={[
                          styles.chip,
                          selectedSubject === sub && {
                            backgroundColor: theme.colors.accent,
                            borderColor: theme.colors.accent,
                          },
                        ]}
                        onPress={() => setSelectedSubject(selectedSubject === sub ? null : sub)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.chipText,
                          selectedSubject === sub && { color: theme.colors.background },
                        ]}>
                          {sub}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Duration slider */}
                  <Text style={styles.label}>Duration</Text>
                  <Text style={styles.minsDisplay}>{mins}</Text>
                  <Text style={styles.minsUnit}>minutes</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={15}
                    maximumValue={180}
                    step={15}
                    value={mins}
                    onValueChange={(v) => setMins(Math.round(v))}
                    minimumTrackTintColor={theme.colors.accent}
                    maximumTrackTintColor={theme.colors.border}
                    thumbTintColor={theme.colors.accent}
                  />
                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderBound}>15 min</Text>
                    <Text style={styles.sliderBound}>180 min</Text>
                  </View>

                  {/* Optional topic */}
                  <TextInput
                    style={styles.input}
                    value={topic}
                    onChangeText={setTopic}
                    placeholder="+ Add specific topic (optional)"
                    placeholderTextColor={theme.colors.textMuted}
                    returnKeyType="done"
                  />

                  {/* Submit button */}
                  <TouchableOpacity
                    style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.submitText}>
                      {createLog.isPending ? 'Logging...' : 'Log Study Session'}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>['theme']) {
  return StyleSheet.create({
    fab: {
      position: 'absolute',
      bottom: 100,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.green,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    fabIcon: {
      fontSize: 28,
      fontWeight: '600',
      color: '#fff',
      marginTop: -2,
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalWrap: {
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      paddingBottom: 40,
      maxHeight: '85%',
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
      alignSelf: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 20,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },

    // Subject chips
    chipGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 20,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.text,
    },

    // Duration slider
    minsDisplay: {
      fontSize: 36,
      fontWeight: '800',
      color: theme.colors.accent,
      textAlign: 'center',
    },
    minsUnit: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 4,
    },
    slider: {
      marginHorizontal: -4,
    },
    sliderLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    sliderBound: {
      fontSize: 11,
      color: theme.colors.textMuted,
    },

    // Topic input
    input: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 14,
      fontSize: 14,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 16,
    },

    // Submit
    submitBtn: {
      backgroundColor: theme.colors.green,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 4,
    },
    submitBtnDisabled: {
      opacity: 0.5,
    },
    submitText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#fff',
    },

    // Success state
    successContainer: {
      alignItems: 'center',
      paddingVertical: 24,
    },
    successIcon: {
      fontSize: 48,
      color: theme.colors.green,
      marginBottom: 12,
    },
    successTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.green,
      marginBottom: 8,
    },
    successDetail: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
    },
    closeLink: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.accent,
    },
  });
}
