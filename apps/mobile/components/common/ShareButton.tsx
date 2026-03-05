import React from 'react';
import { Share, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface ShareButtonProps {
  getText: () => string;
  label?: string;
}

export function ShareButton({ getText, label = 'Share' }: ShareButtonProps) {
  const { theme } = useTheme();

  const handlePress = async () => {
    try {
      await Share.share({ message: getText() });
    } catch {
      // User dismissed or share failed — no action needed
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[styles.button, { borderColor: theme.colors.border }]}
    >
      <Text style={[styles.label, { color: theme.colors.accent }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
