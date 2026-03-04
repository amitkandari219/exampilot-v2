import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { QuickLogFAB } from '../../components/v4/QuickLogFAB';

export default function TabsLayout() {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.border,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <TabIcon label="D" color={color} />,
          }}
        />
        <Tabs.Screen
          name="syllabus"
          options={{
            title: 'Syllabus',
            tabBarIcon: ({ color }) => <TabIcon label="S" color={color} />,
          }}
        />
        <Tabs.Screen
          name="planner"
          options={{
            title: 'Planner',
            tabBarIcon: ({ color }) => <TabIcon label="P" color={color} />,
          }}
        />
        <Tabs.Screen
          name="weekplan"
          options={{
            title: 'Week',
            tabBarIcon: ({ color }) => <TabIcon label="W" color={color} />,
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: 'Progress',
            tabBarIcon: ({ color }) => <TabIcon label="G" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <TabIcon label="=" color={color} />,
          }}
        />
      </Tabs>
      <QuickLogFAB />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

function TabIcon({ label, color }: { label: string; color: string }) {
  return (
    <Text style={{ color, fontSize: 18, fontWeight: '700' }}>{label}</Text>
  );
}
