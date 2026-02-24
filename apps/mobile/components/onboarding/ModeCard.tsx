import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { theme } from '../../constants/theme';
import { ModeDefinition } from '../../types';

interface ModeCardProps {
  mode: ModeDefinition;
  selected?: boolean;
  recommended?: boolean;
  onPress: () => void;
}

export function ModeCard({ mode, selected, recommended, onPress }: ModeCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{mode.icon}</Text>
        <View style={styles.titleWrap}>
          <Text style={[styles.title, selected && styles.titleSelected]}>{mode.title}</Text>
          <Text style={styles.subtitle}>{mode.subtitle}</Text>
        </View>
        {recommended && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Recommended</Text>
          </View>
        )}
      </View>
      <Text style={styles.description}>{mode.description}</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  icon: {
    fontSize: 28,
    marginRight: theme.spacing.md,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  titleSelected: {
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.background,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});
