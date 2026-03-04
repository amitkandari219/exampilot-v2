import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface V4MetricBoxProps {
  value: string | number;
  label: string;
  sublabel?: string;
  valueColor?: string;
  tooltip?: string;
}

export function V4MetricBox({ value, label, sublabel, valueColor, tooltip }: V4MetricBoxProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [showTip, setShowTip] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.value, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {tooltip ? (
          <TouchableOpacity onPress={() => setShowTip(!showTip)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <View style={styles.helpCircle}>
              <Text style={styles.helpText}>?</Text>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
      {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
      {showTip && tooltip ? <Text style={styles.tooltip}>{tooltip}</Text> : null}
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>['theme']) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.card,
      borderRadius: 14,
      padding: 14,
    },
    value: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.text,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },
    label: {
      fontSize: 11,
      color: theme.colors.textSecondary,
    },
    helpCircle: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: theme.colors.textMuted + '33',
      alignItems: 'center',
      justifyContent: 'center',
    },
    helpText: {
      fontSize: 9,
      fontWeight: '700',
      color: theme.colors.textMuted,
    },
    sublabel: {
      fontSize: 10,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    tooltip: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      marginTop: 4,
      lineHeight: 14,
    },
  });
}
