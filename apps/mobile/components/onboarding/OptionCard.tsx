import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface OptionCardProps {
  label: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
}

export function OptionCard({ label, description, selected, onPress }: OptionCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      {description && (
        <Text style={[styles.description, selected && styles.descriptionSelected]}>
          {description}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  cardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#0E2A3A',
  },
  label: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  labelSelected: {
    color: theme.colors.primary,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  descriptionSelected: {
    color: theme.colors.textSecondary,
  },
});
