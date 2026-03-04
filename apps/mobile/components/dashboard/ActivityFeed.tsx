import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import { V4Card } from '../v4/V4Card';
import { useSystemEvents } from '../../hooks/useSystemEvents';

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ActivityFeed() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data: events, isLoading } = useSystemEvents(5);

  if (isLoading || !events || events.length === 0) return null;

  return (
    <V4Card bordered style={styles.container}>
      <Text style={styles.title}>Recent Activity</Text>
      {events.map((event) => (
        <View key={event.id} style={styles.eventRow}>
          <View style={styles.dot} />
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            {event.description && (
              <Text style={styles.eventDesc}>{event.description}</Text>
            )}
          </View>
          <Text style={styles.eventTime}>{relativeTime(event.created_at)}</Text>
        </View>
      ))}
    </V4Card>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accent,
    marginTop: 5,
    marginRight: 10,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  eventDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  eventTime: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginLeft: 8,
  },
});
