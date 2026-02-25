import React, {  useState , useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../constants/theme';
import { strategyModes, getModeDefinition, getDefaultParams } from '../../constants/strategyModes';
import { ModeCard } from '../onboarding/ModeCard';
import { StrategyMode, StrategyParams } from '../../types';

interface StrategyCardProps {
  currentMode: StrategyMode;
  params: StrategyParams;
  onModeChange: (mode: StrategyMode) => void;
  onParamsChange: (params: Partial<StrategyParams>) => void;
}

const paramLabels: Record<keyof StrategyParams, { label: string; min: number; max: number; unit: string }> = {
  revision_frequency: { label: 'Revision Frequency', min: 2, max: 14, unit: 'days' },
  daily_new_topics: { label: 'New Topics / Day', min: 1, max: 4, unit: '' },
  pyq_weight: { label: 'PYQ Emphasis', min: 20, max: 60, unit: '%' },
  answer_writing_sessions: { label: 'Answer Writing / Week', min: 2, max: 7, unit: '' },
  current_affairs_time: { label: 'Current Affairs', min: 15, max: 90, unit: 'min/day' },
  optional_ratio: { label: 'Optional Subject Time', min: 10, max: 35, unit: '%' },
  test_frequency: { label: 'Mock Tests / Month', min: 1, max: 8, unit: '' },
  break_days: { label: 'Break Days / Month', min: 1, max: 6, unit: '' },
  deep_study_hours: { label: 'Deep Study Hours', min: 1, max: 8, unit: 'hrs/day' },
  revision_backlog_limit: { label: 'Revision Backlog Limit', min: 3, max: 25, unit: '' },
  csat_time: { label: 'CSAT Practice', min: 0, max: 60, unit: 'min/day' },
  essay_practice: { label: 'Essay Practice / Month', min: 1, max: 8, unit: '' },
};

export function StrategyCard({ currentMode, params, onModeChange, onParamsChange }: StrategyCardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [showModal, setShowModal] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const modeDef = getModeDefinition(currentMode);

  const handleModeSelect = (mode: StrategyMode) => {
    onModeChange(mode);
    AsyncStorage.setItem('strategy_mode', mode);
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Study Strategy</Text>
      </View>

      <View style={styles.currentMode}>
        <Text style={styles.modeIcon}>{modeDef.icon}</Text>
        <View style={styles.modeInfo}>
          <Text style={styles.modeName}>{modeDef.title}</Text>
          <Text style={styles.modeSubtitle}>{modeDef.subtitle}</Text>
        </View>
        <TouchableOpacity style={styles.changeBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.changeBtnText}>Change</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.modeDescription}>{modeDef.description}</Text>

      <TouchableOpacity
        style={styles.advancedToggle}
        onPress={() => setShowAdvanced(!showAdvanced)}
      >
        <Text style={styles.advancedText}>
          {showAdvanced ? 'Hide advanced settings' : 'Show advanced settings'}
        </Text>
      </TouchableOpacity>

      {showAdvanced && (
        <View style={styles.paramsContainer}>
          {(Object.keys(paramLabels) as (keyof StrategyParams)[]).map((key) => {
            const config = paramLabels[key];
            const value = params[key];
            return (
              <View key={key} style={styles.paramRow}>
                <View style={styles.paramHeader}>
                  <Text style={styles.paramLabel}>{config.label}</Text>
                  <Text style={styles.paramValue}>
                    {value} {config.unit}
                  </Text>
                </View>
                <Slider
                  style={styles.paramSlider}
                  minimumValue={config.min}
                  maximumValue={config.max}
                  step={1}
                  value={value}
                  onSlidingComplete={(val) => onParamsChange({ [key]: val })}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.colors.surfaceLight}
                  thumbTintColor={theme.colors.primary}
                />
              </View>
            );
          })}
        </View>
      )}

      {/* Mode selection modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Strategy Mode</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {strategyModes.map((mode) => (
                <ModeCard
                  key={mode.mode}
                  mode={mode}
                  selected={currentMode === mode.mode}
                  onPress={() => handleModeSelect(mode.mode)}
                />
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  currentMode: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  modeIcon: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  modeInfo: {
    flex: 1,
  },
  modeName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  modeSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  changeBtn: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  changeBtnText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  modeDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  advancedToggle: {
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  advancedText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
  paramsContainer: {
    marginTop: theme.spacing.md,
  },
  paramRow: {
    marginBottom: theme.spacing.md,
  },
  paramHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  paramLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  paramValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  paramSlider: {
    height: 32,
  },
  modalSafe: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
  },
  modalClose: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
});
