import React, {  useState , useMemo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../constants/theme';
import { useSimulator } from '../hooks/useSimulator';
import { ScenarioCard } from '../components/simulator/ScenarioCard';
import { SimulationResultCard } from '../components/simulator/SimulationResultCard';
import type { SimulationScenarioType, SimulationResult, StrategyMode } from '../types';

const SCENARIOS: Array<{
  type: SimulationScenarioType;
  icon: string;
  title: string;
  description: string;
}> = [
  { type: 'skip_days', icon: '\u23F8', title: 'Skip Days', description: 'What if I take a break for N days?' },
  { type: 'change_hours', icon: '\u23F1', title: 'Change Study Hours', description: 'What if I study more or fewer hours?' },
  { type: 'change_strategy', icon: '\u2699', title: 'Switch Strategy', description: 'What if I change my strategy mode?' },
  { type: 'change_exam_date', icon: '\uD83D\uDCC5', title: 'Move Exam Date', description: 'What if my exam date changes?' },
  { type: 'defer_topics', icon: '\u2702', title: 'Defer Topics', description: 'What if I drop some low-priority topics?' },
];

const STRATEGY_OPTIONS: { value: StrategyMode; label: string }[] = [
  { value: 'conservative', label: 'Conservative' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'aggressive', label: 'Aggressive' },
  { value: 'working_professional', label: 'Working Professional' },
];

type Phase = 'select' | 'input' | 'result';

export default function SimulatorScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const simulator = useSimulator();

  const [phase, setPhase] = useState<Phase>('select');
  const [selectedType, setSelectedType] = useState<SimulationScenarioType | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);

  // Input state per scenario
  const [skipDays, setSkipDays] = useState('3');
  const [dailyHours, setDailyHours] = useState('6');
  const [strategyMode, setStrategyMode] = useState<StrategyMode>('balanced');
  const [examDate, setExamDate] = useState('');
  const [deferCount, setDeferCount] = useState('5');

  function selectScenario(type: SimulationScenarioType) {
    setSelectedType(type);
    setPhase('input');
  }

  function reset() {
    setPhase('select');
    setSelectedType(null);
    setResult(null);
    simulator.reset();
  }

  function getParams(): Record<string, any> {
    switch (selectedType) {
      case 'skip_days': return { days: parseInt(skipDays, 10) || 3 };
      case 'change_hours': return { daily_hours: parseFloat(dailyHours) || 6 };
      case 'change_strategy': return { strategy_mode: strategyMode };
      case 'change_exam_date': return { exam_date: examDate };
      case 'defer_topics': return { count: parseInt(deferCount, 10) || 5 };
      default: return {};
    }
  }

  async function runScenario() {
    if (!selectedType) return;
    const params = getParams();
    simulator.mutate({ type: selectedType, params }, {
      onSuccess: (data) => {
        setResult(data);
        setPhase('result');
      },
    });
  }

  function renderInput() {
    switch (selectedType) {
      case 'skip_days':
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Number of days to skip</Text>
            <TextInput
              style={styles.textInput}
              value={skipDays}
              onChangeText={setSkipDays}
              keyboardType="number-pad"
              placeholder="3"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>
        );
      case 'change_hours':
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New daily study hours</Text>
            <TextInput
              style={styles.textInput}
              value={dailyHours}
              onChangeText={setDailyHours}
              keyboardType="decimal-pad"
              placeholder="6"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>
        );
      case 'change_strategy':
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Strategy mode</Text>
            {STRATEGY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.radioRow, strategyMode === opt.value && styles.radioRowSelected]}
                onPress={() => setStrategyMode(opt.value)}
              >
                <View style={[styles.radio, strategyMode === opt.value && styles.radioSelected]} />
                <Text style={[styles.radioLabel, strategyMode === opt.value && styles.radioLabelSelected]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'change_exam_date':
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New exam date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.textInput}
              value={examDate}
              onChangeText={setExamDate}
              placeholder="2026-06-15"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>
        );
      case 'defer_topics':
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Number of topics to defer</Text>
            <TextInput
              style={styles.textInput}
              value={deferCount}
              onChangeText={setDeferCount}
              keyboardType="number-pad"
              placeholder="5"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>
        );
      default:
        return null;
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>&larr;</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>What If Simulator</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Phase: Select scenario */}
        {phase === 'select' && (
          <View>
            <Text style={styles.sectionTitle}>Choose a scenario</Text>
            <Text style={styles.sectionSubtitle}>
              Explore hypothetical changes without affecting your real data.
            </Text>
            {SCENARIOS.map((s) => (
              <ScenarioCard
                key={s.type}
                icon={s.icon}
                title={s.title}
                description={s.description}
                onPress={() => selectScenario(s.type)}
              />
            ))}
          </View>
        )}

        {/* Phase: Input */}
        {phase === 'input' && selectedType && (
          <View>
            <Text style={styles.sectionTitle}>
              {SCENARIOS.find((s) => s.type === selectedType)?.title}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {SCENARIOS.find((s) => s.type === selectedType)?.description}
            </Text>

            {renderInput()}

            <TouchableOpacity
              style={[styles.runButton, simulator.isPending && styles.runButtonDisabled]}
              onPress={runScenario}
              disabled={simulator.isPending}
            >
              {simulator.isPending ? (
                <ActivityIndicator color={theme.colors.background} />
              ) : (
                <Text style={styles.runButtonText}>Run Simulation</Text>
              )}
            </TouchableOpacity>

            {simulator.isError && (
              <Text style={styles.errorText}>
                {simulator.error?.message || 'Simulation failed'}
              </Text>
            )}

            <TouchableOpacity style={styles.backLink} onPress={reset}>
              <Text style={styles.backLinkText}>&larr; Back to scenarios</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Phase: Result */}
        {phase === 'result' && result && (
          <View>
            <SimulationResultCard result={result} />

            <TouchableOpacity style={styles.tryAnother} onPress={reset}>
              <Text style={styles.tryAnotherText}>Try Another Scenario</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: theme.spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.primary,
  },
  headerTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.text,
  },
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  radioRowSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryDark,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.textMuted,
    marginRight: theme.spacing.sm,
  },
  radioSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  radioLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  radioLabelSelected: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  runButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  runButtonDisabled: {
    opacity: 0.6,
  },
  runButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.background,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  backLinkText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
  },
  tryAnother: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  tryAnotherText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
