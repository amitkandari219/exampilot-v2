import { supabase } from '../lib/supabase.js';

function linearInterpolate(value: number, low: number, high: number): number {
  // Maps value from [low, high] to [0, 100]
  if (value <= low) return 0;
  if (value >= high) return 100;
  return ((value - low) / (high - low)) * 100;
}

export async function calculateStress(userId: string) {
  // Get latest velocity data
  const { data: velocitySnapshot } = await supabase
    .from('velocity_snapshots')
    .select('*')
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  // Get profile for buffer info
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('buffer_balance, buffer_capacity, buffer_initial, exam_date')
    .eq('id', userId)
    .single();

  // If no velocity data exists yet, return a clean baseline
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

  // Signal: Velocity (0.35)
  // velocity_ratio 1.0+ = optimal, <0.5 = worst
  const velocityRatio = velocitySnapshot?.velocity_ratio || 1.0;
  const signalVelocity = linearInterpolate(velocityRatio, 0.5, 1.2);

  // Signal: Buffer (0.25)
  // Buffer above 50% capacity = good, depleted = bad
  // CHANGED: signal_buffer = 0 when in debt (balance < 0)
  const bufferCapacity = profile?.buffer_capacity || 0.15;
  const examDate = profile?.exam_date ? new Date(profile.exam_date) : new Date();
  const daysRemaining = Math.max(1, Math.ceil((examDate.getTime() - Date.now()) / 86400000));
  // Use fixed buffer_initial set at onboarding; fall back to dynamic calc for legacy users
  const maxBuffer = profile?.buffer_initial ?? daysRemaining * bufferCapacity;
  const bufferBalance = profile?.buffer_balance ?? 0;
  const signalBuffer = bufferBalance < 0 ? 0 : linearInterpolate(maxBuffer > 0 ? bufferBalance / maxBuffer : 0, 0, 0.5);

  // Signal: Time (0.20)
  // More days remaining = less pressure
  const signalTime = linearInterpolate(daysRemaining, 30, 180);

  // Signal: Confidence (0.20)
  // Average confidence across progressed topics
  const { data: progress } = await supabase
    .from('user_progress')
    .select('confidence_score')
    .eq('user_id', userId)
    .gt('confidence_score', 0);

  const avgConfidence = (progress && progress.length > 0)
    ? progress.reduce((s, p) => s + p.confidence_score, 0) / progress.length : 50;
  const signalConfidence = linearInterpolate(avgConfidence, 20, 80);

  // Composite stress score
  const score = signalVelocity * 0.35 + signalBuffer * 0.25 + signalTime * 0.20 + signalConfidence * 0.20;
  const roundedScore = Math.round(Math.max(0, Math.min(100, score)));

  let status: string;
  let label: string;
  if (roundedScore >= 70) { status = 'optimal'; label = 'On Track'; }
  else if (roundedScore >= 45) { status = 'elevated'; label = 'Needs Attention'; }
  else if (roundedScore >= 25) { status = 'risk_zone'; label = 'Elevated'; }
  else { status = 'recovery_triggered'; label = 'Recovery Needed'; }

  // Generate recommendation
  let recommendation: string;
  const weakestSignal = Math.min(signalVelocity, signalBuffer, signalTime, signalConfidence);
  if (weakestSignal === signalVelocity) {
    recommendation = 'Focus on completing high-priority topics to improve your study velocity.';
  } else if (weakestSignal === signalBuffer) {
    recommendation = 'Build buffer by completing extra topics on good days. Small surpluses add up.';
  } else if (weakestSignal === signalTime) {
    recommendation = 'Time is getting tight. Prioritize high PYQ-weight topics for maximum impact.';
  } else {
    recommendation = 'Review topics with declining confidence. Quick revisions maintain long-term retention.';
  }

  // Update velocity snapshot stress columns
  const snapshotDate = new Date().toISOString().split('T')[0];
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
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: history } = await supabase
    .from('velocity_snapshots')
    .select('snapshot_date, stress_score')
    .eq('user_id', userId)
    .gte('snapshot_date', sevenDaysAgo.toISOString().split('T')[0])
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
    recommendation,
    history: (history || []).map((h) => ({ date: h.snapshot_date, score: h.stress_score })),
  };
}
