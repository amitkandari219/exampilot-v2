import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useTopicResources } from '../hooks/useResources';
import { WarmEmptyState } from '../components/common/WarmEmptyState';
import type { TopicResource } from '../types';

const RESOURCE_ICON: Record<TopicResource['resource_type'], string> = {
  book: '\u{1F4D6}',
  video: '\u{1F3AC}',
  notes: '\u{1F4DD}',
  website: '\u{1F310}',
};

export default function TopicDetailScreen() {
  const { topicId, topicName, subjectName } = useLocalSearchParams<{
    topicId: string;
    topicName?: string;
    subjectName?: string;
  }>();
  const { theme } = useTheme();
  const { data: resources, isLoading } = useTopicResources(topicId);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const renderResource = ({ item }: { item: TopicResource }) => (
    <View style={styles.resourceCard}>
      <Text style={styles.resourceIcon}>{RESOURCE_ICON[item.resource_type]}</Text>
      <View style={styles.resourceContent}>
        <Text style={styles.resourceTitle}>{item.title}</Text>
        <Text style={styles.resourceSource}>{item.source_name}</Text>
        {item.url && (
          <TouchableOpacity onPress={() => Linking.openURL(item.url!)}>
            <Text style={styles.resourceLink}>Open Link</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.topicName}>{topicName || 'Topic'}</Text>
        {subjectName && <Text style={styles.subjectName}>{subjectName}</Text>}
      </View>

      <Text style={styles.sectionTitle}>Recommended Resources</Text>

      {isLoading ? (
        <Text style={styles.loadingText}>Loading resources...</Text>
      ) : resources && resources.length > 0 ? (
        <FlatList
          data={resources}
          keyExtractor={(item) => item.id}
          renderItem={renderResource}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <WarmEmptyState
          title="No resources yet"
          message="Community resources coming soon."
        />
      )}
    </View>
  );
}

const createStyles = (theme: { colors: Record<string, string>; spacing: Record<string, number>; fontSize: Record<string, number>; borderRadius: Record<string, number> }) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
    },
    topicName: {
      fontSize: theme.fontSize.xl,
      fontWeight: '700',
      color: theme.colors.text,
    },
    subjectName: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    sectionTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
    },
    loadingText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textMuted,
      textAlign: 'center',
      paddingTop: theme.spacing.lg,
    },
    listContent: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
    },
    resourceCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    resourceIcon: {
      fontSize: 22,
      marginRight: theme.spacing.sm,
      marginTop: 2,
    },
    resourceContent: {
      flex: 1,
    },
    resourceTitle: {
      fontSize: theme.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    resourceSource: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textMuted,
    },
    resourceLink: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.accent,
      marginTop: 4,
      fontWeight: '600',
    },
  });
