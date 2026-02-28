import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import type { ScopeTriageResult } from '../../types';

interface ScopeTriageCardProps {
  data: ScopeTriageResult;
}

export function ScopeTriageCard({ data }: ScopeTriageCardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!data.needs_triage) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Scope Check</Text>
      <Text style={styles.description}>
        You have {data.topics_remaining} topics left but can realistically cover ~{data.max_coverable} in {data.days_remaining} days.
      </Text>
      {data.suggested_deferrals.length > 0 && (
        <View style={styles.list}>
          <Text style={styles.listHeader}>Consider deferring ({data.suggested_deferrals.length} topics):</Text>
          {data.suggested_deferrals.slice(0, 5).map((item: ScopeTriageResult['suggested_deferrals'][0]) => (
            <View key={item.topic_id} style={styles.listItem}>
              <Text style={styles.listItemText} numberOfLines={1}>{item.topic_name}</Text>
              <Text style={styles.listItemMeta}>{item.subject_name}</Text>
            </View>
          ))}
          {data.suggested_deferrals.length > 5 && (
            <Text style={styles.moreText}>+{data.suggested_deferrals.length - 5} more</Text>
          )}
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.warning + '40',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.warning,
  },
  title: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.warning,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  list: {
    marginTop: theme.spacing.sm,
  },
  listHeader: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  listItemText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    flex: 1,
  },
  listItemMeta: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.sm,
  },
  moreText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
});
