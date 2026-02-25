import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import { ProgressRing } from './ProgressRing';
import { Subject } from '../../types';

interface SubjectProgressGridProps {
  subjects: Subject[];
}

export function SubjectProgressGrid({ subjects }: SubjectProgressGridProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const renderItem = ({ item }: { item: Subject }) => {
    const pct = (item.progress?.weighted_completion || 0) * 100;

    return (
      <View style={styles.gridItem}>
        <ProgressRing percentage={pct} size={48} strokeWidth={3} />
        <Text style={styles.subjectName} numberOfLines={2}>
          {item.name}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subject Progress</Text>
      <FlatList
        data={subjects}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={4}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.md,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  gridItem: {
    width: '23%',
    alignItems: 'center',
  },
  subjectName: {
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
});
