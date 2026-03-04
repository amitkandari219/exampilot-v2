/**
 * ============================================================
 *  ExamPilot UX Vision Demo — All 6 Phases Visualized
 * ============================================================
 *
 *  This is a standalone demo file showcasing every planned UX
 *  change. Run it in any React Native / Expo environment:
 *
 *     npx expo start
 *     // then import this file temporarily in app/index.tsx
 *
 *  Or just read through it — every section is labeled with
 *  the Phase + Gap number it addresses.
 * ============================================================
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ViewStyle,
} from 'react-native';

// ─── THEME ────────────────────────────────────────────────
const T = {
  bg: '#0B1120',
  surface: '#131C31',
  card: '#1A2540',
  accent: '#3ECFB4',
  accentDim: '#3ECFB415',
  text: '#E8ECF4',
  textSec: '#7B8BA5',
  textMuted: '#4A5568',
  border: '#1E2D4A',
  green: '#34D399',
  greenDim: '#34D39920',
  warn: '#F59E42',
  warnDim: '#F59E4220',
  danger: '#EF4444',
  dangerDim: '#EF444420',
  purple: '#A78BFA',
  purpleDim: '#A78BFA20',
  recovery: '#065F46',
};

// ─── DEMO APP ─────────────────────────────────────────────
export default function UXVisionDemo() {
  const [userType, setUserType] = useState('fresher'); // 'fresher' | 'experienced'
  const [daysUsed, setDaysUsed] = useState(1);
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'D' },
    { id: 'syllabus', label: 'Syllabus', icon: 'S' },
    { id: 'planner', label: 'Planner', icon: 'P' },
    { id: 'progress', label: 'Progress', icon: 'G' },
    { id: 'settings', label: 'Settings', icon: '=' },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ═══ DEMO CONTROLS ═══ */}
        <View style={s.controls}>
          <Text style={s.demoTitle}>ExamPilot UX Vision Demo</Text>
          <Text style={s.demoSub}>Toggle between user types and days to see progressive disclosure</Text>

          <View style={s.toggleRow}>
            <TouchableOpacity
              style={[s.toggleBtn, userType === 'fresher' && s.toggleActive]}
              onPress={() => setUserType('fresher')}
            >
              <Text style={[s.toggleText, userType === 'fresher' && s.toggleTextActive]}>Fresher (1st Attempt)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.toggleBtn, userType === 'experienced' && s.toggleActive]}
              onPress={() => setUserType('experienced')}
            >
              <Text style={[s.toggleText, userType === 'experienced' && s.toggleTextActive]}>Experienced (2nd+)</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.dayLabel}>Simulate Day: {daysUsed}</Text>
          <View style={s.dayButtons}>
            {[1, 2, 3, 7, 14, 30].map(d => (
              <TouchableOpacity
                key={d}
                style={[s.dayBtn, daysUsed === d && s.dayBtnActive]}
                onPress={() => setDaysUsed(d)}
              >
                <Text style={[s.dayBtnText, daysUsed === d && s.dayBtnTextActive]}>Day {d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ═══ TAB BAR ═══ */}
        <View style={s.tabBar}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[s.tabItem, activeTab === tab.id && s.tabItemActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[s.tabIcon, activeTab === tab.id && s.tabIconActive]}>{tab.icon}</Text>
              <Text style={[s.tabLabel, activeTab === tab.id && s.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ══════════════════════════════════════════════════════ */}
        {/* ═══ TAB: DASHBOARD ═══ */}
        {/* ══════════════════════════════════════════════════════ */}
        {activeTab === 'dashboard' && <>

        <Divider label="PHASE 1: PLAIN LANGUAGE + PROGRESSIVE DASHBOARD" />

        {/* ═══ P1A: JARGON → PLAIN LANGUAGE ═══ */}
        <SectionHeader title="1A. Jargon Replaced with Plain Language" />
        <View style={s.comparison}>
          <ComparisonCard
            title="BEFORE (Current)"
            items={[
              { label: 'Velocity', value: '1.10x', color: T.danger },
              { label: 'Buffer', value: '4.2d', color: T.danger },
              { label: 'Stress', value: '62/100', color: T.danger },
              { label: 'Gravity-weighted', value: '34%', color: T.danger },
            ]}
            bad
          />
          <ComparisonCard
            title="AFTER (Vision)"
            items={[
              { label: 'Study Pace', value: '10% ahead', color: T.green },
              { label: 'Safety Margin', value: '4 spare days', color: T.green },
              { label: 'Prep Health', value: '62/100', color: T.green },
              { label: 'Importance-weighted', value: '34%', color: T.green },
            ]}
          />
        </View>

        {/* ═══ P1C: TOOLTIPS ON METRICS ═══ */}
        <SectionHeader title="1C. Tooltip on Every Metric" />
        <MetricWithTooltip
          value="10% ahead"
          label="Study Pace"
          tooltip="How fast you're covering the syllabus compared to what's needed to finish on time"
        />
        <MetricWithTooltip
          value="4 spare days"
          label="Safety Margin"
          tooltip="Extra days you've banked from studying ahead. Use them guilt-free on tough days"
        />
        <MetricWithTooltip
          value="12"
          label="Day Streak"
          tooltip="Consecutive days you've studied. Missing a day resets this (3 grace days allowed)"
        />

        {/* ═══ P1D: 3-TIER PROGRESSIVE DASHBOARD ═══ */}
        <SectionHeader title="1D. Progressive Dashboard" />
        <Text style={s.hint}>
          {userType === 'fresher'
            ? `Fresher Day ${daysUsed}: ${daysUsed <= 2 ? 'Tier 1 — Minimal' : daysUsed <= 7 ? 'Tier 2 — Metrics added' : 'Tier 3 — Full dashboard'}`
            : `Experienced Day ${daysUsed}: Full dashboard from Day 1 (veteran bypass)`}
        </Text>

        {/* Simulated Dashboard */}
        <Card bordered>
          {/* Always visible: Header */}
          <View style={s.dashHeader}>
            <View>
              <Text style={s.greetSmall}>Good morning</Text>
              <Text style={s.countdown}>
                Prelims in <Text style={{ color: T.accent }}>142 days</Text>
              </Text>
            </View>
            <Pill label="PRELIMS" color={T.accent} />
          </View>
        </Card>

        {/* Tier 1: Day 1-2 Freshers — Guided Journey + Hero + Summary */}
        {(userType === 'fresher' && daysUsed <= 2) && (
          <>
            <GuidedJourneyDemo day={daysUsed} />
            <HeroCardDemo />
            <Card>
              <Text style={s.summaryLine}>
                You studied <Text style={{ color: T.accent, fontWeight: '800' }}>1.2 hrs</Text> today.{' '}
                <Text style={{ color: T.green, fontWeight: '800' }}>2/5</Text> tasks done.
              </Text>
            </Card>
          </>
        )}

        {/* Tier 2: Day 3-7 Freshers — Add metrics */}
        {((userType === 'fresher' && daysUsed >= 3 && daysUsed <= 7) || userType === 'experienced') && (
          <>
            {userType === 'fresher' && daysUsed <= 3 && <GuidedJourneyDemo day={daysUsed} />}
            <HeroCardDemo />
            <View style={s.metricRow}>
              <MetricBox value="1.2" label="hrs today" sub="of 6 target" color={T.accent} />
              <MetricBox value="2/5" label="tasks done" color={T.green} />
              <MetricBox value="5" label="day streak" color={T.purple} />
            </View>
            <View style={s.metricRow}>
              <MetricBox value="3" label="revisions due" color={T.warn} />
              <MetricBox value="58" label="momentum" sub="7-day score" color={T.accent} />
            </View>
          </>
        )}

        {/* Tier 3: Day 8+ — Full dashboard with readiness */}
        {((userType === 'fresher' && daysUsed >= 8) || (userType === 'experienced' && daysUsed >= 8)) && (
          <>
            <Card bordered>
              <View style={s.readinessHeader}>
                <Text style={s.readinessTitle}>Exam Readiness</Text>
                <Text style={s.readinessScore}>58<Text style={s.readinessMax}>/100</Text></Text>
              </View>
              <BarRow label="Coverage" pct={42} color={T.warn} />
              <BarRow label="Memory Strength" pct={65} color={T.accent} />
              <BarRow label="Consistency" pct={80} color={T.green} />
              <BarRow label="Study Pace" pct={55} color={T.purple} />
              <BarRow label="Weak Areas" pct={38} color={T.danger} />
              <Tip text="Your overall exam readiness based on how much you've covered, how well you remember it, how consistent you are, your pace, and how you handle weak areas." />
            </Card>
          </>
        )}

        <Divider label="PHASE 2: TRANSPARENCY" />

        {/* ═══ P2A: REASON FIELD ON PLAN ITEMS ═══ */}
        <SectionHeader title='2A. "Why This Topic" on Every Plan Item' />
        <View style={s.comparison}>
          <View style={s.compHalf}>
            <Text style={s.compLabel}>BEFORE</Text>
            <PlanItemDemo
              type="NEW"
              typeColor={T.accent}
              subject="Indian Economy"
              topic="Fiscal Policy & Budget"
              duration="90 min"
            />
          </View>
          <View style={s.compHalf}>
            <Text style={s.compLabel}>AFTER</Text>
            <PlanItemDemo
              type="NEW"
              typeColor={T.accent}
              subject="Indian Economy"
              topic="Fiscal Policy & Budget"
              duration="90 min"
              reason="High PYQ weight (asked 8 times in past exams)"
            />
            <PlanItemDemo
              type="REVISION"
              typeColor={T.purple}
              subject="Polity"
              topic="Fundamental Rights"
              duration="45 min"
              reason="Memory fading — last revised 12 days ago"
            />
            <PlanItemDemo
              type="DECAY"
              typeColor={T.danger}
              subject="Geography"
              topic="Monsoon Mechanism"
              duration="30 min"
              reason="Mock accuracy dropped to 25%"
            />
          </View>
        </View>

        {/* ═══ P2B: ACTUAL HOURS PROMPT ═══ */}
        <SectionHeader title="2B. Actual Hours Prompt on Completion" />
        <Card bordered>
          <Text style={s.alertTitle}>How long did you study?</Text>
          <Text style={s.alertSub}>Estimated: 90 min</Text>
          <View style={s.alertButtons}>
            <TouchableOpacity style={[s.alertBtn, { backgroundColor: T.accentDim }]}>
              <Text style={{ color: T.accent, fontWeight: '700' }}>~90 min</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.alertBtn, { backgroundColor: T.warnDim }]}>
              <Text style={{ color: T.warn, fontWeight: '700' }}>Less (~45 min)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.alertBtn, { backgroundColor: T.purpleDim }]}>
              <Text style={{ color: T.purple, fontWeight: '700' }}>More (~135 min)</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* ═══ P2C: ACTIVITY FEED ═══ */}
        <SectionHeader title="2C. System Activity Feed" />
        {(userType === 'experienced' || daysUsed >= 7) ? (
          <Card bordered>
            <Text style={s.feedTitle}>Recent Changes</Text>
            <FeedItem
              time="2h ago"
              title="Strategy recalibrated"
              desc="Daily target adjusted 6→5.5 hrs due to fatigue pattern detected over last 3 days"
            />
            <FeedItem
              time="Yesterday"
              title="3 topics shifted to revision"
              desc="Mock test results triggered reprioritization of Indian Economy topics"
            />
            <FeedItem
              time="3d ago"
              title="Recovery mode exited"
              desc="Burnout recovery complete. Plan restored to full capacity"
            />
          </Card>
        ) : (
          <Text style={s.gated}>Unlocks on Day 7 for freshers</Text>
        )}

        <Divider label="PHASE 3: EMOTIONAL LAYER" />

        {/* ═══ P3A: WELCOME BACK BANNER ═══ */}
        <SectionHeader title="3A. Welcome-Back Banner (after missed days)" />
        <Card style={{ borderWidth: 1, borderColor: T.accent + '44' }}>
          <Text style={[s.welcomeTitle, { color: T.accent }]}>Welcome back!</Text>
          <Text style={s.welcomeBody}>
            You missed 2 days. We've adjusted your plan — you still have{' '}
            <Text style={{ color: T.green, fontWeight: '700' }}>3.2 safety margin days</Text>.{'\n'}
            Let's pick up where you left off!
          </Text>
          <TouchableOpacity style={s.heroBtn}>
            <Text style={s.heroBtnText}>Open Today's Plan</Text>
          </TouchableOpacity>
        </Card>

        {/* ═══ P3B: GUIDED JOURNEY ═══ */}
        <SectionHeader title="3B. Guided Day 1-3 Journey (replaces welcome card)" />
        <GuidedJourneyDemo day={1} showAll />
        <View style={{ height: 8 }} />
        <GuidedJourneyDemo day={2} showAll />
        <View style={{ height: 8 }} />
        <GuidedJourneyDemo day={3} showAll />

        {/* ═══ P3C: WARM EMPTY STATES ═══ */}
        <SectionHeader title="3C. Warm Empty States" />
        <View style={s.comparison}>
          <View style={s.compHalf}>
            <Text style={s.compLabel}>BEFORE</Text>
            <Card>
              <Text style={s.emptyOld}>No mock tests recorded yet</Text>
              <Text style={s.emptyOldSub}>Tap "+ Record Mock" to add your first test</Text>
            </Card>
          </View>
          <View style={s.compHalf}>
            <Text style={s.compLabel}>AFTER</Text>
            <Card style={{ borderWidth: 1, borderColor: T.accent + '33' }}>
              <Text style={s.emptyNew}>Ready for your first mock?</Text>
              <Text style={s.emptyNewSub}>
                Recording mock scores helps us find your weak spots and optimize your study plan around them.
              </Text>
              <TouchableOpacity style={[s.emptyBtn, { backgroundColor: T.accentDim }]}>
                <Text style={{ color: T.accent, fontWeight: '700', fontSize: 13 }}>+ Record Mock</Text>
              </TouchableOpacity>
            </Card>
          </View>
        </View>

        {/* ═══ P3D: CELEBRATION VARIATIONS ═══ */}
        <SectionHeader title="3D. Celebration Variations" />
        <Card style={{ borderWidth: 1, borderColor: T.green }}>
          <Text style={s.celebTitle}>All done for today!</Text>
          <Text style={s.celebSub}>That's 12 days in a row! You're building unstoppable momentum.</Text>
        </Card>
        <View style={{ height: 8 }} />
        <Card style={{ borderWidth: 1, borderColor: T.green }}>
          <Text style={s.celebTitle}>All done for today!</Text>
          <Text style={s.celebSub}>First day conquered! The hardest part is starting — and you just did it.</Text>
        </Card>
        <View style={{ height: 8 }} />
        <Card style={{ borderWidth: 1, borderColor: T.green }}>
          <Text style={s.celebTitle}>All done for today!</Text>
          <Text style={s.celebSub}>Back at it after a break — welcome back! Consistency beats perfection.</Text>
        </Card>

        <Divider label="PHASE 4: FRESHER-SPECIFIC" />

        {/* ═══ P4A: RESOURCE GUIDANCE ═══ */}
        <SectionHeader title="4A. Topic Resource Guidance" />
        <Card bordered>
          <Text style={s.resourceTopic}>Fundamental Rights (Article 12-35)</Text>
          <Pill label="Polity" color={T.purple} />
          <View style={{ height: 12 }} />
          <Text style={s.resourceHeader}>Recommended Resources</Text>
          <ResourceItem icon="📖" title="Indian Polity — M. Laxmikanth" detail="Chapter 7: Fundamental Rights" />
          <ResourceItem icon="📘" title="NCERT Class 11" detail="Indian Constitution at Work — Ch 2" />
          <ResourceItem icon="📝" title="PYQ Practice" detail="23 questions asked (2010-2024) — Trending topic" />
        </Card>

        {/* ═══ P4B: SIMPLIFIED FIRST-WEEK PROGRESS ═══ */}
        <SectionHeader title="4B. Simplified First-Week Progress" />
        <View style={s.comparison}>
          <View style={s.compHalf}>
            <Text style={s.compLabel}>BEFORE (Day 1)</Text>
            <Card>
              <Text style={s.emptyOld}>7 charts + 12 metrics</Text>
              <Text style={s.emptyOldSub}>Velocity, Buffer, Stress, Benchmark, Weekly Review, Mocks, CA — all showing zeros</Text>
            </Card>
          </View>
          <View style={s.compHalf}>
            <Text style={s.compLabel}>AFTER (Day 1)</Text>
            <Card style={{ borderWidth: 1, borderColor: T.accent + '33' }}>
              <View style={s.simpleProgress}>
                <View style={s.progressCircle}>
                  <Text style={s.progressPct}>0%</Text>
                </View>
                <Text style={s.simpleProgressText}>
                  Keep studying for a few days to see detailed analytics here. Focus on your daily plan for now!
                </Text>
              </View>
            </Card>
          </View>
        </View>

        <Divider label="PHASE 5: EXPERIENCED-SPECIFIC" />

        {/* ═══ P5A: PAST ATTEMPT INTAKE ═══ */}
        <SectionHeader title="5A. Past Attempt Intake (Onboarding for 2nd+ attempt)" />
        {userType === 'experienced' ? (
          <>
            <Card bordered>
              <Text style={s.onboardQ}>What was your Prelims score last time?</Text>
              <View style={s.sliderDemo}>
                <Text style={s.sliderMin}>0</Text>
                <View style={s.sliderTrack}>
                  <View style={[s.sliderFill, { width: '45%' }]} />
                  <View style={s.sliderThumb} />
                </View>
                <Text style={s.sliderMax}>200</Text>
              </View>
              <Text style={s.sliderValue}>90 / 200</Text>
              <View style={s.cutoffLine}>
                <Text style={s.cutoffText}>Cutoff ~102 — You were 12 marks short</Text>
              </View>
            </Card>

            <Card bordered>
              <Text style={s.onboardQ}>Which Mains papers were your weakest?</Text>
              <View style={s.chipRow}>
                {['GS-I', 'GS-II', 'GS-III', 'GS-IV', 'Essay', 'Optional'].map((p, i) => (
                  <TouchableOpacity key={p} style={[s.chip, i < 2 && s.chipSelected]}>
                    <Text style={[s.chipText, i < 2 && s.chipTextSelected]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            <Card bordered>
              <Text style={s.onboardQ}>What was your biggest challenge?</Text>
              <View style={s.optionList}>
                {[
                  { label: 'Time Management', selected: false },
                  { label: 'Answer Writing Quality', selected: true },
                  { label: 'Revision & Retention', selected: false },
                  { label: 'Negative Marking', selected: false },
                ].map(opt => (
                  <TouchableOpacity key={opt.label} style={[s.optionCard, opt.selected && s.optionSelected]}>
                    <Text style={[s.optionText, opt.selected && s.optionTextSelected]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </>
        ) : (
          <Text style={s.gated}>Only shown to 2nd+ attempt candidates during onboarding</Text>
        )}

        {/* ═══ P5B: DEEP MOCK ANALYSIS ═══ */}
        <SectionHeader title="5B. Deep Mock Analysis (replaces generic recommendations)" />
        <View style={s.comparison}>
          <View style={s.compHalf}>
            <Text style={s.compLabel}>BEFORE</Text>
            <Card>
              <Text style={s.emptyOld}>Score: 78/200</Text>
              <Text style={s.emptyOldSub}>Recommendation: "Focus on building fundamentals"</Text>
            </Card>
          </View>
          <View style={s.compHalf}>
            <Text style={s.compLabel}>AFTER</Text>
            <Card bordered>
              <Text style={s.mockScore}>78<Text style={s.mockMax}>/200</Text></Text>

              <View style={s.mockStat}>
                <Text style={s.mockStatLabel}>Negative Marking Impact</Text>
                <Text style={[s.mockStatValue, { color: T.danger }]}>-19.8 marks (30 wrong)</Text>
              </View>
              <View style={s.mockStat}>
                <Text style={s.mockStatLabel}>Attempt Rate</Text>
                <Text style={s.mockStatValue}>72% (72/100 attempted)</Text>
              </View>
              <View style={s.mockStat}>
                <Text style={s.mockStatLabel}>Cutoff Distance</Text>
                <Text style={[s.mockStatValue, { color: T.warn }]}>24 marks below estimated cutoff</Text>
              </View>

              <Text style={[s.resourceHeader, { marginTop: 12 }]}>Weakest Areas — Fix These First</Text>
              <MockGapItem subject="Indian Economy" acc="2/8 correct" action="Revise Fiscal Policy & Banking from Ramesh Singh Ch 4-6" />
              <MockGapItem subject="Environment" acc="1/6 correct" action="Read Shankar IAS Environment Ch 1-3 + practice 20 PYQs" />
              <MockGapItem subject="Modern History" acc="3/10 correct" action="Focus on 1857-1947 timeline from Spectrum Ch 8-15" />
            </Card>
          </View>
        </View>

        {/* ═══ P5C: ANSWER WRITING TRACKER ═══ */}
        <SectionHeader title="5C. Answer Writing Tracker (Mains mode)" />
        <Card bordered>
          <Text style={s.feedTitle}>Answer Writing This Week</Text>
          <View style={s.metricRow}>
            <MetricBox value="12" label="answers" sub="this week" color={T.accent} />
            <MetricBox value="187" label="avg words" color={T.purple} />
            <MetricBox value="22m" label="avg time" color={T.green} />
          </View>
          <View style={s.metricRow}>
            <MetricBox value="6.8" label="avg rating" sub="self-assessed /10" color={T.warn} />
            <MetricBox value="GS-II" label="weakest paper" sub="4 answers only" color={T.danger} />
          </View>
          <TouchableOpacity style={[s.heroBtn, { marginTop: 12 }]}>
            <Text style={s.heroBtnText}>+ Log Answer Practice</Text>
          </TouchableOpacity>
        </Card>

        {/* ═══ P5D: SELECTIVE REVISION ═══ */}
        <SectionHeader title="5D. Selective Revision for Repeaters" />
        {userType === 'experienced' ? (
          <Card bordered>
            <Text style={s.feedTitle}>Past Attempt Weakness Boost</Text>
            <Tip text="Because you identified GS-I and GS-II as your weakest Mains papers, topics from these papers get +4 priority boost in your daily plan." />
            <PlanItemDemo
              type="NEW"
              typeColor={T.accent}
              subject="GS-I: Indian Heritage"
              topic="Art & Architecture"
              duration="90 min"
              reason="Past attempt weakness (GS-I) + High PYQ weight"
            />
          </Card>
        ) : (
          <Text style={s.gated}>Only applies to 2nd+ attempt candidates with past attempt data</Text>
        )}

        <Divider label="PHASE 6: POLISH" />

        {/* ═══ P6A: PROACTIVE ALERTS ═══ */}
        <SectionHeader title="6A. Proactive Smart Alerts" />
        <AlertBannerDemo
          severity="critical"
          title="Indian Economy untouched for 16 days"
          message="This subject has 8 high-PYQ topics. Schedule a session today to stay on track."
          action="Add to today's plan"
        />
        <View style={{ height: 8 }} />
        <AlertBannerDemo
          severity="warning"
          title="5 topics dropping to 'stale' by Thursday"
          message="Quick 30-min revision sessions can prevent full re-study later."
          action="View topics"
        />
        <View style={{ height: 8 }} />
        <AlertBannerDemo
          severity="info"
          title="Mock test in 5 days"
          message="Geography coverage is only 28%. Consider prioritizing Environment & Ecology topics."
          action="Adjust plan"
        />

        {/* ═══ P6B: PEER BENCHMARKING ═══ */}
        <SectionHeader title="6B. Peer Benchmarking" />
        <Card bordered>
          <Text style={s.feedTitle}>How You Compare</Text>
          <Text style={s.peerSub}>Anonymized comparison with aspirants at similar stage</Text>
          <PercentileBar label="Syllabus Coverage" pct={72} percentile="Top 28%" />
          <PercentileBar label="Study Pace" pct={65} percentile="Top 35%" />
          <PercentileBar label="Consistency" pct={88} percentile="Top 12%" />
          <PercentileBar label="Mock Accuracy" pct={45} percentile="Top 55%" />
          <Tip text="Your consistency is exceptional — in the top 12% of aspirants. Keep this streak going!" />
        </Card>

        {/* ═══ P6C: MICRO-ANIMATIONS ═══ */}
        <SectionHeader title="6C. Micro-Animations (described)" />
        <Card>
          <Text style={s.animDesc}>Task completion: Smooth fade + strikethrough animation (200ms ease-out)</Text>
          <Text style={s.animDesc}>Dashboard sections: Staggered fade-in on mount (each card 100ms delay)</Text>
          <Text style={s.animDesc}>Progress bars: Animated fill from 0% to value on mount (400ms spring)</Text>
          <Text style={s.animDesc}>Journey checkboxes: Scale bounce on check (150ms spring)</Text>
          <Text style={s.animDesc}>Welcome-back banner: Slide-down entrance (300ms ease-out)</Text>
        </Card>

        <Divider label="SCORE PROJECTION" />

        {/* ═══ SCORE PROJECTION TABLE ═══ */}
        <Card bordered>
          <Text style={s.feedTitle}>Projected UX Score After Each Phase</Text>
          <View style={{ height: 12 }} />
          <ScoreRow phase="Current" fresher="4.5" experienced="6.5" />
          <ScoreRow phase="Phase 1" fresher="6.5" experienced="7.0" highlight />
          <ScoreRow phase="Phase 2" fresher="7.0" experienced="8.0" />
          <ScoreRow phase="Phase 3" fresher="8.0" experienced="8.5" highlight />
          <ScoreRow phase="Phase 4" fresher="8.5" experienced="8.5" />
          <ScoreRow phase="Phase 5" fresher="8.5" experienced="9.0" highlight />
          <ScoreRow phase="Phase 6" fresher="9.0+" experienced="9.5" final />
        </Card>

        <View style={{ height: 40 }} />
        </>}

        {/* ══════════════════════════════════════════════════════ */}
        {/* ═══ TAB: SYLLABUS ═══ */}
        {/* ══════════════════════════════════════════════════════ */}
        {activeTab === 'syllabus' && <>

        <Divider label="SYLLABUS MAP — REDESIGNED" />

        {/* Summary Bar */}
        <Card bordered>
          <View style={s.sylSummaryRow}>
            <View style={s.sylSummaryItem}>
              <Text style={[s.sylSummaryValue, { color: T.accent }]}>466</Text>
              <Text style={s.sylSummaryLabel}>Topics</Text>
            </View>
            <View style={s.sylSummaryDivider} />
            <View style={s.sylSummaryItem}>
              <Text style={[s.sylSummaryValue, { color: T.green }]}>34%</Text>
              <Text style={s.sylSummaryLabel}>Weighted</Text>
            </View>
            <View style={s.sylSummaryDivider} />
            <View style={s.sylSummaryItem}>
              <Text style={[s.sylSummaryValue, { color: T.purple }]}>58</Text>
              <Text style={s.sylSummaryLabel}>Avg Confidence</Text>
            </View>
          </View>
        </Card>

        {/* Subject Cards */}
        <SyllabusSubjectCard
          name="Indian Polity & Governance"
          paper="GS-II"
          topicsDone={28}
          topicsTotal={52}
          weightedPct={62}
          confidence={71}
          expanded
          chapters={[
            { name: 'Indian Constitution', done: 8, total: 12, pct: 72 },
            { name: 'Parliament & State Legislature', done: 6, total: 8, pct: 65 },
            { name: 'Judiciary', done: 4, total: 7, pct: 55 },
          ]}
          topics={[
            { name: 'Fundamental Rights (Art 12-35)', status: 'revised', confidence: 82, pyq: 5, health: 'strong', resource: 'Laxmikanth Ch 7' },
            { name: 'Directive Principles (Art 36-51)', status: 'first_pass', confidence: 55, pyq: 3, health: 'moderate', resource: 'Laxmikanth Ch 8' },
            { name: 'Amendment Procedure (Art 368)', status: 'untouched', confidence: 0, pyq: 4, health: 'critical', resource: 'Laxmikanth Ch 10' },
          ]}
        />

        <SyllabusSubjectCard
          name="Indian Economy"
          paper="GS-III"
          topicsDone={8}
          topicsTotal={45}
          weightedPct={22}
          confidence={38}
          chapters={[]}
          topics={[]}
        />

        <SyllabusSubjectCard
          name="Geography"
          paper="GS-I"
          topicsDone={15}
          topicsTotal={38}
          weightedPct={41}
          confidence={52}
          chapters={[]}
          topics={[]}
        />

        {/* NEW: Resource guidance on topic detail */}
        <SectionHeader title="NEW: Topic Detail with Resources (Phase 4A)" />
        <Card bordered>
          <View style={s.topicDetailHeader}>
            <Text style={s.topicDetailName}>Fundamental Rights (Art 12-35)</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Pill label="GS-II" color={T.purple} />
              <Pill label="REVISED" color={T.green} />
            </View>
          </View>

          <View style={s.topicDetailStats}>
            <MetricBox value="82%" label="Confidence" color={T.green} />
            <MetricBox value="5" label="PYQ Count" sub="Trending" color={T.warn} />
            <MetricBox value="4.5h" label="Time Spent" color={T.accent} />
          </View>

          <Text style={s.resourceHeader}>Recommended Resources</Text>
          <ResourceItem icon="📖" title="Indian Polity — M. Laxmikanth" detail="Chapter 7: Fundamental Rights (pp 103-142)" />
          <ResourceItem icon="📘" title="NCERT Class 11" detail="Indian Constitution at Work — Ch 2: Rights in the Constitution" />
          <ResourceItem icon="📝" title="PYQ Practice" detail="23 questions (2010-2024) — Download PDF" />
          <ResourceItem icon="🎥" title="Vision IAS Lecture" detail="Polity Module 3 — Fundamental Rights (2hr 15min)" />

          <Text style={[s.resourceHeader, { marginTop: 12 }]}>Revision History</Text>
          <View style={s.revisionTimeline}>
            <RevisionEntry date="Feb 28" type="FSRS Review" rating="Good" days="Next: Mar 14" />
            <RevisionEntry date="Feb 15" type="First Revision" rating="Hard" days="Interval: 13d" />
            <RevisionEntry date="Feb 2" type="First Pass" rating="—" days="Initial study" />
          </View>
        </Card>

        <View style={{ height: 40 }} />
        </>}

        {/* ══════════════════════════════════════════════════════ */}
        {/* ═══ TAB: PLANNER ═══ */}
        {/* ══════════════════════════════════════════════════════ */}
        {activeTab === 'planner' && <>

        <Divider label="SMART DAILY PLANNER — REDESIGNED" />

        {/* Capacity Card */}
        <Card bordered>
          <View style={s.capacityHeader}>
            <Text style={s.capacityTitle}>Today's Plan</Text>
            <Text style={s.capacityHours}>4.5 hrs / 6 hrs</Text>
          </View>
          <BarRow label="" pct={75} color={T.accent} />
          <Text style={s.bufferLabel}>1.5 hrs buffer remaining</Text>
        </Card>

        {/* Recovery Banner (conditional) */}
        <Card style={{ backgroundColor: T.recovery, borderWidth: 1, borderColor: T.green + '33' }}>
          <Text style={{ color: T.green, fontWeight: '700', fontSize: 14 }}>Recovery Mode — Day 2/5</Text>
          <Text style={{ color: T.green + 'CC', fontSize: 12, marginTop: 4 }}>Calibrated for sustainable progress</Text>
          <BarRow label="" pct={40} color={T.green} />
        </Card>

        {/* Plan Items WITH reasons (Phase 2A) */}
        <SectionHeader title="Tasks with 'Why This Topic' reasons" />

        <PlanItemDemo
          type="NEW"
          typeColor={T.accent}
          subject="Indian Economy"
          topic="Fiscal Policy & Budget"
          duration="90 min"
          reason="High PYQ weight (asked 8 times in past exams)"
        />
        <PlanItemDemo
          type="REVISION"
          typeColor={T.purple}
          subject="Polity"
          topic="Fundamental Rights (Art 12-35)"
          duration="45 min"
          reason="Spaced repetition — memory fading, last revised 12 days ago"
        />
        <PlanItemDemo
          type="DECAY"
          typeColor={T.danger}
          subject="Geography"
          topic="Monsoon Mechanism"
          duration="30 min"
          reason="Mock accuracy dropped to 25% — urgent revision needed"
        />
        <PlanItemDemo
          type="NEW"
          typeColor={T.accent}
          subject="Modern History"
          topic="Quit India Movement"
          duration="60 min"
          reason="Blind spot — high-weight topic not yet attempted"
        />

        {userType === 'experienced' && (
          <PlanItemDemo
            type="NEW"
            typeColor={T.accent}
            subject="GS-I: Art & Culture"
            topic="Mughal Architecture"
            duration="60 min"
            reason="Past attempt weakness (GS-I) + High PYQ weight"
          />
        )}

        {/* STRETCH task */}
        <View style={{ opacity: 0.6 }}>
          <PlanItemDemo
            type="DAILY"
            typeColor={T.warn}
            subject="Current Affairs"
            topic="Weekly CA consolidation"
            duration="30 min"
            reason="Optional stretch goal — bonus if you have time"
          />
        </View>

        {/* Quick Log */}
        <View style={[s.planItem, { borderLeftColor: T.green, borderLeftWidth: 3, opacity: 0.7 }]}>
          <View style={{ flex: 1 }}>
            <View style={s.planItemTag}>
              <Pill label="LOGGED" color={T.green} />
              <Text style={s.planItemSubject}>Quick study session</Text>
            </View>
            <Text style={s.planItemTopic}>Logged via Quick Log — 45 min</Text>
            <Text style={{ fontSize: 10, color: T.green, marginTop: 3 }}>Counts toward today's hours</Text>
          </View>
        </View>

        {/* Actual Hours Prompt (Phase 2B) */}
        <SectionHeader title="NEW: Actual Hours Prompt on Completion" />
        <Card bordered>
          <Text style={s.alertTitle}>How long did you study?</Text>
          <Text style={s.alertSub}>Estimated: 90 min</Text>
          <View style={s.alertButtons}>
            <TouchableOpacity style={[s.alertBtn, { backgroundColor: T.accentDim }]}>
              <Text style={{ color: T.accent, fontWeight: '700' }}>~90 min</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.alertBtn, { backgroundColor: T.warnDim }]}>
              <Text style={{ color: T.warn, fontWeight: '700' }}>Less</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.alertBtn, { backgroundColor: T.purpleDim }]}>
              <Text style={{ color: T.purple, fontWeight: '700' }}>More</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Celebration Variations (Phase 3D) */}
        <SectionHeader title="NEW: Celebration Variations" />
        <Card style={{ borderWidth: 1, borderColor: T.green }}>
          <Text style={s.celebTitle}>All done for today!</Text>
          <Text style={s.celebSub}>12 days in a row! You're building unstoppable momentum.</Text>
        </Card>

        {/* Progress Bar */}
        <View style={s.planProgressBar}>
          <BarRow label="" pct={80} color={T.green} />
          <Text style={{ color: T.green, fontWeight: '700', fontSize: 13, textAlign: 'right' }}>4/5</Text>
        </View>

        <View style={{ height: 40 }} />
        </>}

        {/* ══════════════════════════════════════════════════════ */}
        {/* ═══ TAB: PROGRESS ═══ */}
        {/* ══════════════════════════════════════════════════════ */}
        {activeTab === 'progress' && <>

        <Divider label="PROGRESS — REDESIGNED" />

        {/* Simplified first-week view for freshers */}
        {userType === 'fresher' && daysUsed < 3 ? (
          <>
            <SectionHeader title="Fresher Day 1-2: Simplified View" />
            <Card style={{ borderWidth: 1, borderColor: T.accent + '33' }}>
              <View style={s.simpleProgress}>
                <View style={s.progressCircle}>
                  <Text style={s.progressPct}>0%</Text>
                </View>
                <Text style={s.simpleProgressText}>
                  Keep studying for a few days to see detailed analytics here.{'\n'}Focus on your daily plan for now!
                </Text>
              </View>
            </Card>
          </>
        ) : (
          <>
            {/* Full Progress View */}
            <Text style={s.pageTitle}>Progress</Text>

            {/* Progress Rings */}
            <View style={s.ringRow}>
              <View style={s.ringItem}>
                <View style={[s.progressCircle, { borderColor: T.accent }]}>
                  <Text style={s.progressPct}>34%</Text>
                </View>
                <Text style={s.ringLabel}>Topics</Text>
              </View>
              <View style={s.ringItem}>
                <View style={[s.progressCircle, { borderColor: T.green }]}>
                  <Text style={[s.progressPct, { color: T.green }]}>28%</Text>
                </View>
                <Text style={s.ringLabel}>Importance-weighted</Text>
              </View>
            </View>

            {/* Stats with plain language */}
            <View style={s.metricRow}>
              <MetricBox value="10% ahead" label="Study Pace" sub="of required pace" color={T.accent} />
              <MetricBox value="4 spare" label="Safety Margin" sub="days banked" color={T.green} />
              <MetricBox value="12d" label="Streak" color={T.purple} />
            </View>

            {/* Benchmark Score */}
            <Card bordered>
              <View style={s.readinessHeader}>
                <Text style={s.readinessTitle}>Exam Readiness</Text>
                <Text style={s.readinessScore}>58<Text style={s.readinessMax}>/100</Text></Text>
              </View>
              <BarRow label="Coverage" pct={42} color={T.warn} />
              <BarRow label="Memory Strength" pct={65} color={T.accent} />
              <BarRow label="Consistency" pct={80} color={T.green} />
              <BarRow label="Study Pace" pct={55} color={T.purple} />
              <BarRow label="Weak Areas" pct={38} color={T.danger} />
            </Card>

            {/* Weekly Review */}
            <Card bordered>
              <Text style={s.feedTitle}>Weekly Review — Feb 24-Mar 2</Text>
              <View style={s.metricRow}>
                <MetricBox value="32h" label="Total Hours" sub="target: 36h" color={T.accent} />
                <MetricBox value="18" label="Topics Done" color={T.green} />
                <MetricBox value="87%" label="Plan Adherence" color={T.purple} />
              </View>
              <Text style={[s.resourceHeader, { marginTop: 8 }]}>Wins</Text>
              <Text style={s.weeklyItem}>Completed all Polity chapters ahead of schedule</Text>
              <Text style={s.weeklyItem}>Streak maintained for 12 consecutive days</Text>
              <Text style={[s.resourceHeader, { marginTop: 8 }]}>Focus Areas</Text>
              <Text style={s.weeklyItem}>Indian Economy confidence dropped to 38 — schedule 3 revision sessions</Text>
              <Text style={s.weeklyItem}>Geography untouched for 10 days — add to this week's plan</Text>
            </Card>

            {/* Preparation Health (renamed from Stress) */}
            <Card bordered>
              <Text style={s.feedTitle}>Preparation Health</Text>
              <Tip text="Higher score = healthier preparation. Based on your pace, safety margin, timeline, and memory strength." />
              <View style={{ marginTop: 8 }}>
                <BarRow label="Pace" pct={72} color={T.accent} />
                <BarRow label="Safety Margin" pct={85} color={T.green} />
                <BarRow label="Time Left" pct={55} color={T.warn} />
                <BarRow label="Memory" pct={60} color={T.purple} />
              </View>
              <View style={s.healthScoreRow}>
                <Text style={s.healthScoreLabel}>Overall Health</Text>
                <Text style={[s.healthScoreValue, { color: T.green }]}>68/100 — Good</Text>
              </View>
            </Card>

            {/* Subject Progress Grid */}
            <SectionHeader title="Subject Coverage" />
            <View style={s.subjectGrid}>
              <SubjectMiniCard name="Polity" pct={62} color={T.green} />
              <SubjectMiniCard name="Economy" pct={22} color={T.danger} />
              <SubjectMiniCard name="History" pct={45} color={T.warn} />
              <SubjectMiniCard name="Geography" pct={41} color={T.warn} />
              <SubjectMiniCard name="Science" pct={55} color={T.accent} />
              <SubjectMiniCard name="Ethics" pct={30} color={T.danger} />
            </View>

            {/* Deep Mock Analysis (Phase 5B) */}
            <SectionHeader title="Mock Tests — Deep Analysis" />
            {userType === 'experienced' ? (
              <Card bordered>
                <Text style={s.mockScore}>78<Text style={s.mockMax}>/200</Text></Text>
                <View style={s.mockStat}>
                  <Text style={s.mockStatLabel}>Negative Marking</Text>
                  <Text style={[s.mockStatValue, { color: T.danger }]}>-19.8 marks</Text>
                </View>
                <View style={s.mockStat}>
                  <Text style={s.mockStatLabel}>Attempt Rate</Text>
                  <Text style={s.mockStatValue}>72%</Text>
                </View>
                <View style={s.mockStat}>
                  <Text style={s.mockStatLabel}>Cutoff Distance</Text>
                  <Text style={[s.mockStatValue, { color: T.warn }]}>24 marks below</Text>
                </View>
                <Text style={[s.resourceHeader, { marginTop: 12 }]}>Fix These First</Text>
                <MockGapItem subject="Indian Economy" acc="2/8 correct" action="Revise Fiscal Policy from Ramesh Singh Ch 4-6" />
                <MockGapItem subject="Environment" acc="1/6 correct" action="Read Shankar IAS Ch 1-3 + practice 20 PYQs" />
              </Card>
            ) : (
              <Card style={{ borderWidth: 1, borderColor: T.accent + '33' }}>
                <Text style={s.emptyNew}>Ready for your first mock?</Text>
                <Text style={s.emptyNewSub}>Recording scores helps us find your weak spots and optimize your plan.</Text>
                <TouchableOpacity style={[s.emptyBtn, { backgroundColor: T.accentDim }]}>
                  <Text style={{ color: T.accent, fontWeight: '700', fontSize: 13 }}>+ Record Mock</Text>
                </TouchableOpacity>
              </Card>
            )}

            {/* Answer Writing Stats (Phase 5C) */}
            <SectionHeader title="NEW: Answer Writing Tracker (Mains mode)" />
            <Card bordered>
              <Text style={s.feedTitle}>Answer Writing This Week</Text>
              <View style={s.metricRow}>
                <MetricBox value="12" label="Answers" sub="this week" color={T.accent} />
                <MetricBox value="187" label="Avg Words" color={T.purple} />
                <MetricBox value="22m" label="Avg Time" color={T.green} />
              </View>
              <TouchableOpacity style={[s.heroBtn, { marginTop: 12 }]}>
                <Text style={s.heroBtnText}>+ Log Answer Practice</Text>
              </TouchableOpacity>
            </Card>

            {/* Peer Benchmarking (Phase 6B) */}
            <SectionHeader title="NEW: Peer Comparison" />
            <Card bordered>
              <Text style={s.feedTitle}>How You Compare</Text>
              <Text style={s.peerSub}>Anonymized comparison with aspirants at similar stage</Text>
              <PercentileBar label="Syllabus Coverage" pct={72} percentile="Top 28%" />
              <PercentileBar label="Study Pace" pct={65} percentile="Top 35%" />
              <PercentileBar label="Consistency" pct={88} percentile="Top 12%" />
              <Tip text="Your consistency is exceptional — in the top 12% of aspirants!" />
            </Card>
          </>
        )}

        <View style={{ height: 40 }} />
        </>}

        {/* ══════════════════════════════════════════════════════ */}
        {/* ═══ TAB: SETTINGS ═══ */}
        {/* ══════════════════════════════════════════════════════ */}
        {activeTab === 'settings' && <>

        <Divider label="SETTINGS — REDESIGNED" />

        {/* Profile */}
        <Card bordered>
          <Text style={s.settingsSection}>PROFILE</Text>
          <View style={s.settingsRow}>
            <Text style={s.settingsLabel}>Name</Text>
            <Text style={s.settingsValue}>{userType === 'fresher' ? 'Rahul Sharma' : 'Priya Patel'}</Text>
          </View>
          <View style={s.settingsRow}>
            <Text style={s.settingsLabel}>Exam Date</Text>
            <Text style={s.settingsValue}>Jun 15, 2026</Text>
          </View>
          <View style={s.settingsRow}>
            <Text style={s.settingsLabel}>Days Left</Text>
            <Text style={[s.settingsValue, { color: T.accent }]}>103 days</Text>
          </View>
          <View style={s.settingsRow}>
            <Text style={s.settingsLabel}>Days of Prep</Text>
            <Text style={s.settingsValue}>{daysUsed} days</Text>
          </View>
        </Card>

        {/* Exam Mode */}
        <Card bordered>
          <Text style={s.settingsSection}>EXAM MODE</Text>
          <View style={s.segmentControl}>
            <View style={[s.segment, s.segmentActive]}>
              <Text style={s.segmentTextActive}>Prelims</Text>
            </View>
            <View style={s.segment}>
              <Text style={s.segmentText}>Mains</Text>
            </View>
            <View style={s.segment}>
              <Text style={s.segmentText}>Post-Prelims</Text>
            </View>
          </View>
          <Tip text="Switching mode regenerates tomorrow's plan and adjusts subject priorities." />
        </Card>

        {/* Study Preference */}
        <Card bordered>
          <Text style={s.settingsSection}>STUDY APPROACH</Text>
          <View style={{ gap: 8 }}>
            <View style={[s.optionCard, s.optionSelected]}>
              <Text style={s.optionTextSelected}>Mixed daily</Text>
              <Text style={{ fontSize: 11, color: T.accent + 'CC', marginTop: 2 }}>Study multiple subjects each day for variety</Text>
            </View>
            <View style={s.optionCard}>
              <Text style={s.optionText}>Sequential</Text>
              <Text style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Focus on one subject at a time until complete</Text>
            </View>
          </View>
        </Card>

        {/* Daily Hours */}
        <Card bordered>
          <Text style={s.settingsSection}>DAILY TARGET</Text>
          <Text style={{ fontSize: 32, fontWeight: '800', color: T.accent, textAlign: 'center', marginVertical: 8 }}>6.5h</Text>
          <View style={s.sliderDemo}>
            <Text style={s.sliderMin}>2h</Text>
            <View style={s.sliderTrack}>
              <View style={s.sliderFill} />
            </View>
            <Text style={s.sliderMax}>12h</Text>
          </View>
        </Card>

        {/* Strategy (read-only) */}
        <Card bordered>
          <Text style={s.settingsSection}>STRATEGY</Text>
          <View style={s.settingsRow}>
            <Text style={s.settingsLabel}>Mode</Text>
            <Pill label={userType === 'experienced' ? 'AGGRESSIVE' : 'BALANCED'} color={userType === 'experienced' ? T.warn : T.accent} />
          </View>
          <Tip text="Auto-calculated from your attempt, daily hours, and schedule. Change hours or redo onboarding to recalculate." />
        </Card>

        {/* BEFORE/AFTER: Settings that were hidden */}
        <SectionHeader title="REMOVED: No More Algorithm Parameters" />
        <View style={s.comparison}>
          <View style={s.compHalf}>
            <Text style={s.compLabel}>BEFORE (V2)</Text>
            <Card style={{ borderWidth: 1, borderColor: T.danger + '44' }}>
              <Text style={{ color: T.danger, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>Exposed to users:</Text>
              <Text style={s.removedParam}>Fatigue Threshold: 85</Text>
              <Text style={s.removedParam}>Buffer Capacity: 0.15</Text>
              <Text style={s.removedParam}>FSRS Retention: 0.9</Text>
              <Text style={s.removedParam}>Burnout Threshold: 75</Text>
              <Text style={s.removedParam}>[Recalibrate Now] button</Text>
            </Card>
          </View>
          <View style={s.compHalf}>
            <Text style={s.compLabel}>AFTER (V4)</Text>
            <Card style={{ borderWidth: 1, borderColor: T.green + '44' }}>
              <Text style={{ color: T.green, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>Hidden from users:</Text>
              <Text style={s.keptParam}>All algorithm params auto-managed</Text>
              <Text style={s.keptParam}>Strategy shown read-only</Text>
              <Text style={s.keptParam}>Recalibration happens silently</Text>
              <Text style={s.keptParam}>Activity feed shows what changed</Text>
            </Card>
          </View>
        </View>

        {/* Gamification */}
        <Card bordered>
          <Text style={s.settingsSection}>ACHIEVEMENTS</Text>
          <View style={{ alignItems: 'center', marginVertical: 8 }}>
            <Pill label="LEVEL 7" color={T.accent} />
            <Text style={{ fontSize: 24, fontWeight: '800', color: T.accent, marginTop: 8 }}>12,450 XP</Text>
            <BarRow label="" pct={65} color={T.accent} />
            <Text style={{ fontSize: 11, color: T.textSec }}>350 / 1000 XP to Level 8</Text>
          </View>
          <View style={s.badgeGrid}>
            {['First Week', 'Momentum', 'PYQ Master', 'Comeback Kid', 'First Mock', '100 Topics'].map(b => (
              <View key={b} style={s.badgeItem}>
                <View style={s.badgeIcon}><Text style={{ fontSize: 16 }}>🏆</Text></View>
                <Text style={s.badgeName}>{b}</Text>
              </View>
            ))}
            {['Unbreakable', 'Halfway', 'Phoenix'].map(b => (
              <View key={b} style={[s.badgeItem, { opacity: 0.3 }]}>
                <View style={s.badgeIcon}><Text style={{ fontSize: 16 }}>🔒</Text></View>
                <Text style={s.badgeName}>{b}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Notifications */}
        <Card bordered>
          <Text style={s.settingsSection}>NOTIFICATIONS</Text>
          <View style={s.settingsRow}>
            <Text style={s.settingsLabel}>Daily reminders</Text>
            <View style={[s.switchTrack, s.switchOn]}>
              <View style={[s.switchThumb, s.switchThumbOn]} />
            </View>
          </View>
          <View style={s.settingsRow}>
            <Text style={s.settingsLabel}>Weekly summary alerts</Text>
            <View style={[s.switchTrack, s.switchOn]}>
              <View style={[s.switchThumb, s.switchThumbOn]} />
            </View>
          </View>
          <View style={s.settingsRow}>
            <Text style={s.settingsLabel}>Streak warnings</Text>
            <View style={s.switchTrack}>
              <View style={s.switchThumb} />
            </View>
          </View>
        </Card>

        {/* Actions */}
        <TouchableOpacity style={s.redoBtn}>
          <Text style={{ color: T.accent, fontWeight: '700' }}>Redo Onboarding</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.redoBtn, { borderColor: T.danger + '44' }]}>
          <Text style={{ color: T.danger, fontWeight: '700' }}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
        </>}

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── REUSABLE DEMO COMPONENTS ─────────────────────────────

function Card({ children, bordered, style }: { children: React.ReactNode; bordered?: boolean; style?: ViewStyle }) {
  return (
    <View style={[s.card, bordered && s.cardBordered, style]}>
      {children}
    </View>
  );
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.pill, { backgroundColor: color + '20' }]}>
      <Text style={[s.pillText, { color }]}>{label}</Text>
    </View>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <View style={s.tip}>
      <Text style={s.tipIcon}>?</Text>
      <Text style={s.tipText}>{text}</Text>
    </View>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <View style={s.divider}>
      <View style={s.dividerLine} />
      <Text style={s.dividerLabel}>{label}</Text>
      <View style={s.dividerLine} />
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={s.sectionTitle}>{title}</Text>;
}

function MetricBox({ value, label, sub, color }: { value: string | number; label: string; sub?: string; color?: string }) {
  return (
    <View style={s.metricBox}>
      <Text style={[s.metricValue, { color: color || T.text }]}>{value}</Text>
      <Text style={s.metricLabel}>{label}</Text>
      {sub && <Text style={s.metricSub}>{sub}</Text>}
    </View>
  );
}

function MetricWithTooltip({ value, label, tooltip }: { value: string; label: string; tooltip: string }) {
  const [show, setShow] = useState(false);
  return (
    <View style={{ marginBottom: 8 }}>
      <View style={s.tooltipMetric}>
        <View style={{ flex: 1 }}>
          <Text style={[s.metricValue, { color: T.accent }]}>{value}</Text>
          <Text style={s.metricLabel}>{label}</Text>
        </View>
        <TouchableOpacity style={s.tooltipBtn} onPress={() => setShow(!show)}>
          <Text style={s.tooltipBtnText}>?</Text>
        </TouchableOpacity>
      </View>
      {show && <Tip text={tooltip} />}
    </View>
  );
}

function BarRow({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <View style={s.barHeader}>
        <Text style={s.barLabel}>{label}</Text>
        <Text style={s.barPct}>{pct}%</Text>
      </View>
      <View style={s.barTrack}>
        <View style={[s.barFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function ComparisonCard({ title, items, bad }: { title: string; items: { label: string; value: string; color: string }[]; bad?: boolean }) {
  return (
    <View style={s.compHalf}>
      <Text style={s.compLabel}>{title}</Text>
      <Card style={bad ? { borderWidth: 1, borderColor: T.danger + '44' } : { borderWidth: 1, borderColor: T.green + '44' }}>
        {items.map((it, i) => (
          <View key={i} style={s.compItem}>
            <Text style={s.compItemLabel}>{it.label}</Text>
            <Text style={[s.compItemValue, { color: it.color }]}>{it.value}</Text>
          </View>
        ))}
      </Card>
    </View>
  );
}

function PlanItemDemo({ type, typeColor, subject, topic, duration, reason }: { type: string; typeColor: string; subject: string; topic: string; duration: string; reason?: string }) {
  return (
    <View style={[s.planItem, { borderLeftColor: typeColor }]}>
      <View style={{ flex: 1 }}>
        <View style={s.planItemTag}>
          <Pill label={type} color={typeColor} />
          <Text style={s.planItemSubject}>{subject}</Text>
        </View>
        <Text style={s.planItemTopic}>{topic}</Text>
        {reason && <Text style={s.planItemReason}>{reason}</Text>}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={s.planItemDuration}>{duration}</Text>
        <Text style={s.planItemStart}>Start</Text>
      </View>
    </View>
  );
}

function HeroCardDemo() {
  return (
    <View style={s.heroCard}>
      <Text style={s.heroLabel}>START HERE</Text>
      <Text style={s.heroTitle}>Indian Economy — Fiscal Policy & Budget</Text>
      <Text style={s.heroMeta}>New topic · ~90 min</Text>
      <Text style={s.heroReason}>High PYQ weight (asked 8 times in past exams)</Text>
      <TouchableOpacity style={s.heroBtn}>
        <Text style={s.heroBtnText}>Start Studying</Text>
      </TouchableOpacity>
    </View>
  );
}

function GuidedJourneyDemo({ day, showAll }: { day: number; showAll?: boolean }) {
  const steps: Record<number, { label: string; done: boolean }[]> = {
    1: [
      { label: 'Open your planner', done: true },
      { label: 'Start your first topic', done: true },
      { label: 'Mark it complete when done', done: false },
    ],
    2: [
      { label: 'Complete 2 planned topics', done: false },
      { label: 'Check if any revisions are due', done: false },
    ],
    3: [
      { label: 'Check your Progress tab', done: false },
      { label: 'Try to finish all planned tasks', done: false },
    ],
  };
  const daySteps = steps[day] || steps[1];

  return (
    <Card style={{ borderWidth: 1, borderColor: T.accent + '44' }}>
      <Text style={s.journeyTitle}>Day {day} Journey</Text>
      {daySteps.map((step, i) => (
        <View key={i} style={s.journeyStep}>
          <View style={[s.journeyCheck, step.done && s.journeyCheckDone]}>
            {step.done && <Text style={s.journeyCheckmark}>✓</Text>}
          </View>
          <Text style={[s.journeyLabel, step.done && s.journeyLabelDone]}>{step.label}</Text>
        </View>
      ))}
      {showAll && day === 1 && (
        <Text style={s.journeyHint}>1 step to go! You're almost there.</Text>
      )}
    </Card>
  );
}

function FeedItem({ time, title, desc }: { time: string; title: string; desc: string }) {
  return (
    <View style={s.feedItem}>
      <Text style={s.feedTime}>{time}</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.feedItemTitle}>{title}</Text>
        <Text style={s.feedItemDesc}>{desc}</Text>
      </View>
    </View>
  );
}

function AlertBannerDemo({ severity, title, message, action }: { severity: 'critical' | 'warning' | 'info'; title: string; message: string; action: string }) {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    critical: { bg: T.dangerDim, border: T.danger, text: T.danger },
    warning: { bg: T.warnDim, border: T.warn, text: T.warn },
    info: { bg: T.accentDim, border: T.accent, text: T.accent },
  };
  const c = colors[severity];
  return (
    <View style={[s.alertBanner, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[s.alertBannerTitle, { color: c.text }]}>{title}</Text>
      <Text style={s.alertBannerMsg}>{message}</Text>
      <TouchableOpacity style={[s.alertBannerBtn, { backgroundColor: c.border + '30' }]}>
        <Text style={{ color: c.text, fontWeight: '700', fontSize: 12 }}>{action}</Text>
      </TouchableOpacity>
    </View>
  );
}

function ResourceItem({ icon, title, detail }: { icon: string; title: string; detail: string }) {
  return (
    <View style={s.resourceItem}>
      <Text style={s.resourceIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.resourceTitle}>{title}</Text>
        <Text style={s.resourceDetail}>{detail}</Text>
      </View>
    </View>
  );
}

function MockGapItem({ subject, acc, action }: { subject: string; acc: string; action: string }) {
  return (
    <View style={s.mockGap}>
      <View style={s.mockGapHeader}>
        <Text style={[s.mockGapSubject, { color: T.danger }]}>{subject}</Text>
        <Text style={s.mockGapAcc}>{acc}</Text>
      </View>
      <Text style={s.mockGapAction}>{action}</Text>
    </View>
  );
}

function PercentileBar({ label, pct, percentile }: { label: string; pct: number; percentile: string }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={s.barHeader}>
        <Text style={s.barLabel}>{label}</Text>
        <Text style={[s.barPct, { color: T.accent }]}>{percentile}</Text>
      </View>
      <View style={s.barTrack}>
        <View style={[s.barFill, { width: `${pct}%`, backgroundColor: T.accent }]} />
      </View>
    </View>
  );
}

function ScoreRow({ phase, fresher, experienced, highlight, final: isFinal }: { phase: string; fresher: string; experienced: string; highlight?: boolean; final?: boolean }) {
  // renamed 'final' to 'isFinal' to avoid reserved word issues
  return (
    <View style={[s.scoreRow, highlight && s.scoreHighlight, isFinal && s.scoreFinal]}>
      <Text style={[s.scorePhase, isFinal && { color: T.accent }]}>{phase}</Text>
      <Text style={[s.scoreVal, isFinal && { color: T.green, fontWeight: '800' }]}>{fresher}</Text>
      <Text style={[s.scoreVal, isFinal && { color: T.green, fontWeight: '800' }]}>{experienced}</Text>
    </View>
  );
}

// ─── SYLLABUS COMPONENTS ──────────────────────────────────

function SyllabusSubjectCard({ name, paper, topicsDone, topicsTotal, weightedPct, confidence, expanded, chapters, topics }: {
  name: string; paper: string; topicsDone: number; topicsTotal: number; weightedPct: number; confidence: number;
  expanded?: boolean; chapters: { name: string; done: number; total: number; pct: number }[];
  topics: { name: string; status: string; confidence: number; pyq: number; health: string; resource: string }[];
}) {
  const [open, setOpen] = useState(!!expanded);
  const ringColor = weightedPct > 60 ? T.green : weightedPct > 35 ? T.warn : T.danger;

  return (
    <Card bordered style={{ marginBottom: 8 }}>
      <TouchableOpacity onPress={() => setOpen(!open)} activeOpacity={0.7}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[s.progressCircleSm, { borderColor: ringColor }]}>
            <Text style={[s.progressPctSm, { color: ringColor }]}>{weightedPct}%</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: T.text }}>{name}</Text>
            <Text style={{ fontSize: 11, color: T.textSec }}>{topicsDone}/{topicsTotal} topics · Confidence: {confidence}</Text>
          </View>
          <Pill label={paper} color={T.purple} />
          <Text style={{ color: T.textMuted, marginLeft: 8, fontSize: 16 }}>{open ? '▾' : '▸'}</Text>
        </View>
      </TouchableOpacity>

      {open && chapters.length > 0 && (
        <View style={{ marginTop: 12 }}>
          {chapters.map((ch, i) => (
            <View key={i} style={s.chapterRow}>
              <Text style={s.chapterName}>{ch.name}</Text>
              <Text style={s.chapterProgress}>{ch.done}/{ch.total}</Text>
              <Text style={[s.chapterPct, { color: ch.pct > 60 ? T.green : T.warn }]}>{ch.pct}%</Text>
            </View>
          ))}

          {topics.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {topics.map((t, i) => {
                const statusColors: Record<string, string> = { revised: T.green, first_pass: T.accent, untouched: T.textMuted, in_progress: T.purple };
                const healthColors: Record<string, string> = { strong: T.green, moderate: T.warn, critical: T.danger, exam_ready: T.accent };
                return (
                  <View key={i} style={s.topicRow}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: T.text }}>{t.name}</Text>
                        <Pill label={t.status.replace('_', ' ').toUpperCase()} color={statusColors[t.status] || T.textMuted} />
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <Pill label={t.health.toUpperCase()} color={healthColors[t.health] || T.textMuted} />
                        <Text style={{ fontSize: 10, color: T.textMuted }}>Confidence: {t.confidence}%</Text>
                        <Text style={{ fontSize: 10, color: T.warn }}>PYQ: {t.pyq}</Text>
                      </View>
                      {t.resource && <Text style={{ fontSize: 10, color: T.accent, marginTop: 3 }}>📚 {t.resource}</Text>}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}
    </Card>
  );
}

function RevisionEntry({ date, type, rating, days }: { date: string; type: string; rating: string; days: string }) {
  return (
    <View style={s.revisionRow}>
      <View style={s.revisionDot} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: T.text }}>{type}</Text>
          <Text style={{ fontSize: 10, color: T.textMuted }}>{date}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
          <Text style={{ fontSize: 10, color: T.textSec }}>Rating: {rating}</Text>
          <Text style={{ fontSize: 10, color: T.accent }}>{days}</Text>
        </View>
      </View>
    </View>
  );
}

function SubjectMiniCard({ name, pct, color }: { name: string; pct: number; color: string }) {
  return (
    <View style={s.subjectMini}>
      <View style={[s.progressCircleSm, { borderColor: color }]}>
        <Text style={[s.progressPctSm, { color }]}>{pct}%</Text>
      </View>
      <Text style={s.subjectMiniName}>{name}</Text>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1, padding: 16 },

  // Demo controls
  controls: { marginBottom: 24 },
  demoTitle: { fontSize: 22, fontWeight: '800', color: T.accent, marginBottom: 4 },
  demoSub: { fontSize: 12, color: T.textSec, marginBottom: 16 },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  toggleBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: T.card, alignItems: 'center', borderWidth: 1, borderColor: T.border },
  toggleActive: { backgroundColor: T.accentDim, borderColor: T.accent },
  toggleText: { color: T.textSec, fontWeight: '600', fontSize: 13 },
  toggleTextActive: { color: T.accent },
  dayLabel: { fontSize: 12, color: T.textSec, marginBottom: 8 },
  dayButtons: { flexDirection: 'row', gap: 6 },
  dayBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: T.card, borderWidth: 1, borderColor: T.border },
  dayBtnActive: { backgroundColor: T.accentDim, borderColor: T.accent },
  dayBtnText: { color: T.textSec, fontSize: 11, fontWeight: '600' },
  dayBtnTextActive: { color: T.accent },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: T.border },
  dividerLabel: { fontSize: 10, fontWeight: '700', color: T.accent, marginHorizontal: 8, letterSpacing: 0.5 },

  // Section
  sectionTitle: { fontSize: 14, fontWeight: '700', color: T.text, marginBottom: 10, marginTop: 4 },

  // Card
  card: { backgroundColor: T.card, borderRadius: 14, padding: 16, marginBottom: 8 },
  cardBordered: { borderWidth: 1, borderColor: T.border },

  // Pill
  pill: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 8, alignSelf: 'flex-start' },
  pillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  // Tip
  tip: { flexDirection: 'row', backgroundColor: T.accentDim, borderRadius: 10, padding: 10, marginTop: 8 },
  tipIcon: { fontSize: 11, fontWeight: '800', color: T.accent, marginRight: 8, backgroundColor: T.accent + '30', width: 18, height: 18, borderRadius: 9, textAlign: 'center', lineHeight: 18 },
  tipText: { fontSize: 11, color: T.textSec, flex: 1, lineHeight: 17 },

  // Dashboard header
  dashHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greetSmall: { fontSize: 13, color: T.textSec },
  countdown: { fontSize: 22, fontWeight: '700', color: T.text, marginTop: 2 },

  // Summary line
  summaryLine: { fontSize: 14, color: T.textSec, lineHeight: 22, textAlign: 'center' },

  // Metrics
  metricRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  metricBox: { flex: 1, backgroundColor: T.card, borderRadius: 14, padding: 14 },
  metricValue: { fontSize: 20, fontWeight: '800' },
  metricLabel: { fontSize: 11, color: T.textSec, marginTop: 4 },
  metricSub: { fontSize: 10, color: T.textMuted, marginTop: 2 },

  // Tooltip metric
  tooltipMetric: { flexDirection: 'row', backgroundColor: T.card, borderRadius: 14, padding: 14, alignItems: 'center' },
  tooltipBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: T.accent + '30', alignItems: 'center', justifyContent: 'center' },
  tooltipBtnText: { fontSize: 12, fontWeight: '800', color: T.accent },

  // Readiness
  readinessHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  readinessTitle: { fontSize: 14, fontWeight: '700', color: T.text },
  readinessScore: { fontSize: 26, fontWeight: '800', color: T.accent },
  readinessMax: { fontSize: 14, color: T.textSec },

  // Bar
  barHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barLabel: { fontSize: 12, color: T.textSec },
  barPct: { fontSize: 12, color: T.textMuted },
  barTrack: { height: 6, backgroundColor: T.surface, borderRadius: 3 },
  barFill: { height: 6, borderRadius: 3 },

  // Comparison
  comparison: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  compHalf: { flex: 1 },
  compLabel: { fontSize: 10, fontWeight: '700', color: T.textMuted, marginBottom: 6, letterSpacing: 0.5 },
  compItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: T.border },
  compItemLabel: { fontSize: 12, color: T.textSec },
  compItemValue: { fontSize: 12, fontWeight: '700' },

  // Plan items
  planItem: { flexDirection: 'row', backgroundColor: T.card, borderRadius: 12, padding: 12, marginBottom: 6, borderLeftWidth: 3 },
  planItemTag: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  planItemSubject: { fontSize: 13, fontWeight: '700', color: T.text },
  planItemTopic: { fontSize: 11, color: T.textSec },
  planItemReason: { fontSize: 10, color: T.textMuted, fontStyle: 'italic', marginTop: 3 },
  planItemDuration: { fontSize: 13, fontWeight: '700', color: T.text },
  planItemStart: { fontSize: 10, color: T.accent, marginTop: 2 },

  // Hero card
  heroCard: { backgroundColor: T.accentDim, borderRadius: 18, borderWidth: 1.5, borderColor: T.accent + '33', padding: 20, marginBottom: 8 },
  heroLabel: { fontSize: 11, fontWeight: '700', color: T.accent, letterSpacing: 1.5, marginBottom: 8 },
  heroTitle: { fontSize: 17, fontWeight: '700', color: T.text, marginBottom: 4 },
  heroMeta: { fontSize: 12, color: T.textSec, marginBottom: 4 },
  heroReason: { fontSize: 11, color: T.textMuted, fontStyle: 'italic', marginBottom: 12 },
  heroBtn: { backgroundColor: T.accent, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 12, alignSelf: 'flex-start' },
  heroBtnText: { color: T.bg, fontWeight: '700', fontSize: 14 },

  // Welcome back
  welcomeTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  welcomeBody: { fontSize: 13, color: T.text, lineHeight: 20, marginBottom: 12 },

  // Journey
  journeyTitle: { fontSize: 14, fontWeight: '700', color: T.accent, marginBottom: 12 },
  journeyStep: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  journeyCheck: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: T.textMuted, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  journeyCheckDone: { backgroundColor: T.green, borderColor: T.green },
  journeyCheckmark: { color: T.bg, fontSize: 12, fontWeight: '800' },
  journeyLabel: { fontSize: 13, color: T.text },
  journeyLabelDone: { textDecorationLine: 'line-through', color: T.textMuted },
  journeyHint: { fontSize: 11, color: T.accent, marginTop: 4, fontStyle: 'italic' },

  // Empty states
  emptyOld: { fontSize: 13, color: T.textMuted, fontWeight: '600', textAlign: 'center' },
  emptyOldSub: { fontSize: 11, color: T.textMuted, textAlign: 'center', marginTop: 4 },
  emptyNew: { fontSize: 14, fontWeight: '700', color: T.accent, textAlign: 'center' },
  emptyNewSub: { fontSize: 12, color: T.textSec, textAlign: 'center', marginTop: 6, lineHeight: 18 },
  emptyBtn: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10, marginTop: 12 },

  // Celebration
  celebTitle: { fontSize: 20, fontWeight: '800', color: T.green, textAlign: 'center' },
  celebSub: { fontSize: 13, color: T.textSec, textAlign: 'center', marginTop: 6, lineHeight: 19 },

  // Feed
  feedTitle: { fontSize: 14, fontWeight: '700', color: T.text, marginBottom: 12 },
  feedItem: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.border },
  feedTime: { fontSize: 10, color: T.textMuted, width: 60 },
  feedItemTitle: { fontSize: 12, fontWeight: '600', color: T.text },
  feedItemDesc: { fontSize: 11, color: T.textSec, marginTop: 2, lineHeight: 16 },

  // Alert
  alertTitle: { fontSize: 15, fontWeight: '700', color: T.text, textAlign: 'center' },
  alertSub: { fontSize: 12, color: T.textSec, textAlign: 'center', marginTop: 4, marginBottom: 12 },
  alertButtons: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  alertBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },

  // Alert banner
  alertBanner: { borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 0 },
  alertBannerTitle: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  alertBannerMsg: { fontSize: 11, color: T.textSec, lineHeight: 17, marginBottom: 8 },
  alertBannerBtn: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },

  // Onboarding
  onboardQ: { fontSize: 16, fontWeight: '700', color: T.text, marginBottom: 14 },
  sliderDemo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sliderMin: { fontSize: 11, color: T.textMuted },
  sliderMax: { fontSize: 11, color: T.textMuted },
  sliderTrack: { flex: 1, height: 6, backgroundColor: T.surface, borderRadius: 3 },
  sliderFill: { height: 6, backgroundColor: T.accent, borderRadius: 3, width: '45%' as any },
  sliderThumb: { position: 'absolute' as const, left: '45%' as any, top: -5, width: 16, height: 16, borderRadius: 8, backgroundColor: T.accent },
  sliderValue: { fontSize: 20, fontWeight: '800', color: T.accent, textAlign: 'center' },
  cutoffLine: { backgroundColor: T.warnDim, borderRadius: 8, padding: 8, marginTop: 8 },
  cutoffText: { fontSize: 11, color: T.warn, textAlign: 'center', fontWeight: '600' },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border },
  chipSelected: { backgroundColor: T.accentDim, borderColor: T.accent },
  chipText: { fontSize: 13, color: T.textSec, fontWeight: '600' },
  chipTextSelected: { color: T.accent },

  // Options
  optionList: { gap: 8 },
  optionCard: { padding: 14, borderRadius: 12, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border },
  optionSelected: { borderColor: T.accent, backgroundColor: T.accentDim },
  optionText: { fontSize: 14, color: T.textSec, fontWeight: '600' },
  optionTextSelected: { color: T.accent },

  // Resources
  resourceTopic: { fontSize: 16, fontWeight: '700', color: T.text, marginBottom: 6 },
  resourceHeader: { fontSize: 12, fontWeight: '700', color: T.accent, letterSpacing: 0.5, marginBottom: 10 },
  resourceItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  resourceIcon: { fontSize: 18, marginTop: 2 },
  resourceTitle: { fontSize: 13, fontWeight: '600', color: T.text },
  resourceDetail: { fontSize: 11, color: T.textSec, marginTop: 2 },

  // Mock deep
  mockScore: { fontSize: 32, fontWeight: '800', color: T.accent, textAlign: 'center', marginBottom: 12 },
  mockMax: { fontSize: 16, color: T.textSec },
  mockStat: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: T.border },
  mockStatLabel: { fontSize: 12, color: T.textSec },
  mockStatValue: { fontSize: 12, fontWeight: '700', color: T.text },
  mockGap: { backgroundColor: T.surface, borderRadius: 10, padding: 10, marginBottom: 6 },
  mockGapHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  mockGapSubject: { fontSize: 13, fontWeight: '700' },
  mockGapAcc: { fontSize: 11, color: T.textMuted },
  mockGapAction: { fontSize: 11, color: T.textSec, fontStyle: 'italic', lineHeight: 16 },

  // Peer
  peerSub: { fontSize: 11, color: T.textMuted, marginBottom: 12 },

  // Simple progress
  simpleProgress: { alignItems: 'center', paddingVertical: 8 },
  progressCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: T.accent + '30', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  progressPct: { fontSize: 20, fontWeight: '800', color: T.accent },
  simpleProgressText: { fontSize: 12, color: T.textSec, textAlign: 'center', lineHeight: 18 },

  // Score table
  scoreRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: T.border },
  scoreHighlight: { backgroundColor: T.surface },
  scoreFinal: { backgroundColor: T.accentDim, borderRadius: 8, borderBottomWidth: 0 },
  scorePhase: { flex: 1, fontSize: 12, color: T.textSec, fontWeight: '600' },
  scoreVal: { width: 70, fontSize: 13, fontWeight: '600', color: T.text, textAlign: 'center' },

  // Misc
  hint: { fontSize: 11, color: T.accent, marginBottom: 8, fontStyle: 'italic' },
  gated: { fontSize: 12, color: T.textMuted, fontStyle: 'italic', textAlign: 'center', paddingVertical: 16 },
  animDesc: { fontSize: 12, color: T.textSec, lineHeight: 20, marginBottom: 4 },

  // Tab bar
  tabBar: { flexDirection: 'row', backgroundColor: T.surface, borderRadius: 14, marginBottom: 16, padding: 4 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  tabItemActive: { backgroundColor: T.accentDim },
  tabIcon: { fontSize: 16, fontWeight: '800', color: T.textMuted },
  tabIconActive: { color: T.accent },
  tabLabel: { fontSize: 9, color: T.textMuted, marginTop: 2 },
  tabLabelActive: { color: T.accent },

  // Page title
  pageTitle: { fontSize: 28, fontWeight: '800', color: T.text, marginBottom: 16 },

  // Syllabus
  sylSummaryRow: { flexDirection: 'row', alignItems: 'center' },
  sylSummaryItem: { flex: 1, alignItems: 'center' },
  sylSummaryDivider: { width: 1, height: 30, backgroundColor: T.border },
  sylSummaryValue: { fontSize: 20, fontWeight: '800' },
  sylSummaryLabel: { fontSize: 10, color: T.textMuted, marginTop: 2 },
  progressCircleSm: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  progressPctSm: { fontSize: 11, fontWeight: '800' },
  chapterRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: T.border, paddingLeft: 8 },
  chapterName: { flex: 1, fontSize: 12, color: T.textSec },
  chapterProgress: { fontSize: 11, color: T.textMuted, marginRight: 8 },
  chapterPct: { fontSize: 12, fontWeight: '700', width: 35, textAlign: 'right' },
  topicRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.border, paddingLeft: 16 },

  // Topic detail
  topicDetailHeader: { marginBottom: 12 },
  topicDetailName: { fontSize: 16, fontWeight: '700', color: T.text, marginBottom: 6 },
  topicDetailStats: { flexDirection: 'row', gap: 8, marginBottom: 12 },

  // Revision timeline
  revisionTimeline: {},
  revisionRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 10 },
  revisionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: T.accent, marginTop: 4 },

  // Subject grid
  subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  subjectMini: { width: '30%' as any, alignItems: 'center', backgroundColor: T.card, borderRadius: 12, padding: 12 },
  subjectMiniName: { fontSize: 10, color: T.textSec, marginTop: 6, textAlign: 'center' },

  // Progress rings
  ringRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  ringItem: { alignItems: 'center' },
  ringLabel: { fontSize: 10, color: T.textMuted, marginTop: 6 },

  // Planner
  capacityHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  capacityTitle: { fontSize: 14, fontWeight: '700', color: T.text },
  capacityHours: { fontSize: 13, color: T.textSec },
  bufferLabel: { fontSize: 11, color: T.textMuted, marginTop: 2 },
  planProgressBar: { backgroundColor: T.card, borderRadius: 14, padding: 14, marginTop: 8 },

  // Weekly review
  weeklyItem: { fontSize: 12, color: T.textSec, lineHeight: 18, marginBottom: 4, paddingLeft: 8 },

  // Health score
  healthScoreRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: T.border, marginTop: 8 },
  healthScoreLabel: { fontSize: 13, fontWeight: '600', color: T.text },
  healthScoreValue: { fontSize: 14, fontWeight: '700' },

  // Settings
  settingsSection: { fontSize: 11, fontWeight: '700', color: T.textMuted, letterSpacing: 1, marginBottom: 12 },
  settingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.border },
  settingsLabel: { fontSize: 14, color: T.text },
  settingsValue: { fontSize: 14, color: T.textSec },
  segmentControl: { flexDirection: 'row', backgroundColor: T.surface, borderRadius: 10, padding: 3, marginBottom: 8 },
  segment: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  segmentActive: { backgroundColor: T.accentDim },
  segmentText: { fontSize: 12, color: T.textMuted, fontWeight: '600' },
  segmentTextActive: { fontSize: 12, color: T.accent, fontWeight: '700' },
  removedParam: { fontSize: 11, color: T.danger + 'CC', marginBottom: 4, textDecorationLine: 'line-through' as const },
  keptParam: { fontSize: 11, color: T.green + 'CC', marginBottom: 4 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  badgeItem: { alignItems: 'center', width: '20%' as any },
  badgeIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center' },
  badgeName: { fontSize: 8, color: T.textSec, marginTop: 4, textAlign: 'center' },
  switchTrack: { width: 44, height: 24, borderRadius: 12, backgroundColor: T.surface, justifyContent: 'center', paddingHorizontal: 2 },
  switchOn: { backgroundColor: T.accent + '40' },
  switchThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: T.textMuted },
  switchThumbOn: { backgroundColor: T.accent, alignSelf: 'flex-end' as const },
  redoBtn: { backgroundColor: T.card, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: T.border },
});
