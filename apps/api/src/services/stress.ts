import { supabase } from '../lib/supabase.js';
import { toDateString, daysAgo, daysUntil } from '../utils/dateUtils.js';
import { piecewiseLerp } from '../utils/math.js';
import { STRESS_WEIGHTS } from '../constants/thresholds.js';

// Anchor points per signal
const VELOCITY_POINTS: [number, number][] = [[0.2, 0], [0.4, 10], [0.6, 30], [0.8, 55], [1.0, 80], [1.2, 100]];
const BUFFER_POINTS: [number, number][] = [[0, 0], [0.25, 25], [0.50, 55], [0.75, 80], [1.0, 100]];
const TIME_GAP_POINTS: [number, number][] = [[-0.3, 0], [-0.2, 15], [-0.1, 40], [0, 70], [0.1, 100]];
const CONFIDENCE_POINTS: [number, number][] = [[20, 0], [30, 10], [40, 25], [50, 50], [60, 75], [70, 100]];

const SIGNAL_NAMES = ['velocity', 'buffer', 'time', 'confidence'] as const;
type SignalName = typeof SIGNAL_NAMES[number];

const SIGNAL_RECOMMENDATIONS: Record<SignalName, string> = {
  velocity: 'Your study velocity is the weakest signal. Focus on completing high-priority topics to close the pace gap.',
  buffer: 'Your buffer bank is the weakest signal. Build surplus on good days — even small deposits compound over time.',
  time: 'Your completion gap vs timeline is the weakest signal. Prioritize high PYQ-weight topics for maximum exam impact.',
  confidence: 'Topic confidence is the weakest signal. Schedule quick revisions for fading topics before they decay further.',
};

export async function calculateStress(userId: string) {
  // Fetch velocity snapshot + profile + confidence in parallel
  const [velocityRes, profileRes, confidenceRes] = await Promise.all([
    supabase
      .from('velocity_snapshots')
      .select('velocity_ratio, weighted_completion_pct, snapshot_date')
      .eq('user_id', userId)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('user_profiles')
      .select('buffer_balance, buffer_initial, buffer_capacity, exam_date, created_at')
      .eq('id', userId)
      .single(),
    supabase
      .from('user_progress')
      .select('confidence_score')
      .eq('user_id', userId)
      .gt('confidence_score', 0),
  ]);

  const velocitySnapshot = velocityRes.data;
  const profile = profileRes.data;

  // Baseline if no data yet
  if (!velocitySnapshot) {
    return {
      score: 0,
      status: 'optimal',
      label: 'On Track',
      signals: { velocity: 0, buffer: 0, time: 0, confidence: 0 },
      recommendation: 'Complete your first study session to start tracking stress levels.',
      history: [],
    };
  }

  // ---- Signal: Velocity (weight 0.35) ----
  const velocityRatio = velocitySnapshot.velocity_ratio || 1.0;
  const signalVelocity = piecewiseLerp(velocityRatio, VELOCITY_POINTS);

  // ---- Signal: Buffer (weight 0.25) ----
  const bufferBalance = profile?.buffer_balance ?? 0;
  const bufferCapacity = profile?.buffer_capacity || 0.15;
  const examDate = profile?.exam_date ? new Date(profile.exam_date) : new Date();
  const daysRemaining = daysUntil(examDate);
  const bufferInitial = profile?.buffer_initial ?? daysRemaining * bufferCapacity;
  // Debt mode → signal = 0; otherwise piecewise on balance/initial ratio
  const bufferRatio = bufferInitial > 0 ? bufferBalance / bufferInitial : 0;
  const signalBuffer = bufferBalance < 0 ? 0 : piecewiseLerp(bufferRatio, BUFFER_POINTS);

  // ---- Signal: Time (weight 0.20) — completion gap ----
  const weightedCompletion = velocitySnapshot.weighted_completion_pct || 0;
  // Expected completion = fraction of total study period elapsed
  const onboardingDate = profile?.created_at
    ? new Date(profile.created_at) : new Date(Date.now() - 90 * 86400000);
  const totalDays = daysUntil(examDate, onboardingDate);
  const daysElapsed = totalDays - daysRemaining;
  const expectedCompletion = Math.min(1, daysElapsed / totalDays);
  const completionGap = weightedCompletion - expectedCompletion;
  const signalTime = piecewiseLerp(completionGap, TIME_GAP_POINTS);

  // ---- Signal: Confidence (weight 0.20) ----
  const progressRows = confidenceRes.data || [];
  const avgConfidence = progressRows.length > 0
    ? progressRows.reduce((s, p) => s + p.confidence_score, 0) / progressRows.length : 50;
  const signalConfidence = piecewiseLerp(avgConfidence, CONFIDENCE_POINTS);

  // ---- Composite ----
  const score = signalVelocity * STRESS_WEIGHTS.VELOCITY + signalBuffer * STRESS_WEIGHTS.BUFFER + signalTime * STRESS_WEIGHTS.TIME + signalConfidence * STRESS_WEIGHTS.CONFIDENCE;
  const roundedScore = Math.round(Math.max(0, Math.min(100, score)));

  let status: string;
  let label: string;
  if (roundedScore >= 70) { status = 'optimal'; label = 'On Track'; }
  else if (roundedScore >= 45) { status = 'elevated'; label = 'Needs Attention'; }
  else if (roundedScore >= 25) { status = 'risk_zone'; label = 'Elevated'; }
  else { status = 'recovery_triggered'; label = 'Recovery Needed'; }

  // Identify weakest signal for targeted recommendation
  const signalValues: Record<SignalName, number> = {
    velocity: signalVelocity,
    buffer: signalBuffer,
    time: signalTime,
    confidence: signalConfidence,
  };
  const weakest = SIGNAL_NAMES.reduce((min, name) =>
    signalValues[name] < signalValues[min] ? name : min, SIGNAL_NAMES[0]);
  const recommendation = SIGNAL_RECOMMENDATIONS[weakest];

  // Update velocity snapshot stress columns
  const snapshotDate = toDateString(new Date());
  await supabase
    .from('velocity_snapshots')
    .update({
      stress_score: roundedScore,
      stress_status: status,
      signal_velocity: signalVelocity,
      signal_buffer: signalBuffer,
      signal_time: signalTime,
      signal_confidence: signalConfidence,
    })
    .eq('user_id', userId)
    .eq('snapshot_date', snapshotDate);

  // Get 7-day history
  const { data: history } = await supabase
    .from('velocity_snapshots')
    .select('snapshot_date, stress_score')
    .eq('user_id', userId)
    .gte('snapshot_date', toDateString(daysAgo(7)))
    .order('snapshot_date', { ascending: true });

  return {
    score: roundedScore,
    status,
    label,
    signals: {
      velocity: Math.round(signalVelocity),
      buffer: Math.round(signalBuffer),
      time: Math.round(signalTime),
      confidence: Math.round(signalConfidence),
    },
    weakest_signal: weakest,
    recommendation,
    history: (history || []).map((h) => ({ date: h.snapshot_date, score: h.stress_score })),
  };
}
