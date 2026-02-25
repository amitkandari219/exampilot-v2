import React, { useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';

interface ReviewRatingSheetProps {
  visible: boolean;
  topicName: string;
  onRate: (rating: number) => void;
  onClose: () => void;
}

export function ReviewRatingSheet({ visible, topicName, onRate, onClose }: ReviewRatingSheetProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const RATING_OPTIONS = [
    { rating: 1, label: 'Again', color: theme.colors.error, description: 'Completely forgot' },
    { rating: 2, label: 'Hard', color: theme.colors.orange, description: 'Recalled with difficulty' },
    { rating: 3, label: 'Good', color: theme.colors.primary, description: 'Recalled with some effort' },
    { rating: 4, label: 'Easy', color: theme.colors.success, description: 'Recalled effortlessly' },
  ];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.heading}>Rate Your Recall</Text>
          <Text style={styles.topicName} numberOfLines={2}>
            {topicName}
          </Text>

          <View style={styles.ratingGrid}>
            {RATING_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.rating}
                style={[styles.ratingButton, { borderColor: option.color }]}
                onPress={() => onRate(option.rating)}
                activeOpacity={0.7}
              >
                <Text style={[styles.ratingLabel, { color: option.color }]}>{option.label}</Text>
                <Text style={styles.ratingDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeText}>Skip</Text>
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
    marginBottom: theme.spacing.lg,
  },
  heading: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  topicName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  ratingGrid: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  ratingButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 2,
  },
  ratingLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  ratingDescription: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  closeButton: {
    alignSelf: 'center',
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
  },
  closeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
});
