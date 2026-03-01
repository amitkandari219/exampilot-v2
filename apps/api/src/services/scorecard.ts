import { supabase } from '../lib/supabase.js';

interface ScorecardInput {
  attempt_year: number;
  stage: 'prelims' | 'mains' | 'interview';
  gs1_marks?: number;
  gs2_marks?: number;
  gs3_marks?: number;
  gs4_marks?: number;
  essay_marks?: number;
  optional_marks?: number;
  prelims_score?: number;
  total_marks?: number;
}

// GS paper → subject mapping (UPSC standard)
const GS_PAPER_SUBJECTS: Record<string, string[]> = {
  gs1: ['History', 'Geography', 'Indian Society'],
  gs2: ['Polity', 'Governance', 'International Relations'],
  gs3: ['Economy', 'Science & Technology', 'Environment', 'Disaster Management', 'Internal Security'],
  gs4: ['Ethics'],
};

// Mains paper max marks
const MAINS_MAX = { gs: 250, essay: 250, optional: 500 };

export async function importScorecard(userId: string, input: ScorecardInput) {
  const { error } = await supabase
    .from('upsc_scorecards')
    .upsert({
      user_id: userId,
      attempt_year: input.attempt_year,
      stage: input.stage,
      gs1_marks: input.gs1_marks ?? null,
      gs2_marks: input.gs2_marks ?? null,
      gs3_marks: input.gs3_marks ?? null,
      gs4_marks: input.gs4_marks ?? null,
      essay_marks: input.essay_marks ?? null,
      optional_marks: input.optional_marks ?? null,
      prelims_score: input.prelims_score ?? null,
      total_marks: input.total_marks ?? null,
    }, { onConflict: 'user_id,attempt_year,stage' });

  if (error) throw error;
  return { success: true };
}

export async function getScorecardAnalysis(userId: string) {
  const { data: scorecards } = await supabase
    .from('upsc_scorecards')
    .select('*')
    .eq('user_id', userId)
    .order('attempt_year', { ascending: false });

  if (!scorecards || scorecards.length === 0) return { scorecards: [], weak_zones: [], analysis: null };

  // Get subjects for mapping
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name');

  const subjectNameMap = new Map((subjects || []).map((s: { id: string; name: string }) => [s.name, s.id]));

  // Analyze mains scorecards to find weak GS papers
  const mainsCards = scorecards.filter((s: { stage: string }) => s.stage === 'mains');
  const weakZones: Array<{
    paper: string;
    marks: number;
    max_marks: number;
    percentage: number;
    mapped_subjects: string[];
    level: 'critical' | 'weak' | 'average' | 'strong';
  }> = [];

  for (const card of mainsCards) {
    const gsScores = [
      { paper: 'gs1', marks: card.gs1_marks },
      { paper: 'gs2', marks: card.gs2_marks },
      { paper: 'gs3', marks: card.gs3_marks },
      { paper: 'gs4', marks: card.gs4_marks },
    ];

    for (const gs of gsScores) {
      if (gs.marks == null) continue;
      const pct = (gs.marks / MAINS_MAX.gs) * 100;
      const mappedSubjects = GS_PAPER_SUBJECTS[gs.paper] || [];
      const level = pct < 30 ? 'critical' : pct < 40 ? 'weak' : pct < 55 ? 'average' : 'strong';

      weakZones.push({
        paper: gs.paper.toUpperCase(),
        marks: gs.marks,
        max_marks: MAINS_MAX.gs,
        percentage: Math.round(pct * 10) / 10,
        mapped_subjects: mappedSubjects,
        level,
      });
    }

    if (card.essay_marks != null) {
      const pct = (card.essay_marks / MAINS_MAX.essay) * 100;
      weakZones.push({
        paper: 'Essay',
        marks: card.essay_marks,
        max_marks: MAINS_MAX.essay,
        percentage: Math.round(pct * 10) / 10,
        mapped_subjects: [],
        level: pct < 30 ? 'critical' : pct < 40 ? 'weak' : pct < 55 ? 'average' : 'strong',
      });
    }
  }

  weakZones.sort((a, b) => a.percentage - b.percentage);

  // Map weak subjects to IDs for planner integration
  const weakSubjectIds: string[] = [];
  for (const zone of weakZones.filter((z) => z.level === 'critical' || z.level === 'weak')) {
    for (const subj of zone.mapped_subjects) {
      const id = subjectNameMap.get(subj);
      if (id && !weakSubjectIds.includes(id)) weakSubjectIds.push(id);
    }
  }

  return {
    scorecards: scorecards.map((s: Record<string, unknown>) => ({
      attempt_year: s.attempt_year,
      stage: s.stage,
      gs1_marks: s.gs1_marks,
      gs2_marks: s.gs2_marks,
      gs3_marks: s.gs3_marks,
      gs4_marks: s.gs4_marks,
      essay_marks: s.essay_marks,
      optional_marks: s.optional_marks,
      prelims_score: s.prelims_score,
      total_marks: s.total_marks,
    })),
    weak_zones: weakZones,
    weak_subject_ids: weakSubjectIds,
    analysis: {
      weakest_paper: weakZones[0]?.paper || null,
      papers_below_40pct: weakZones.filter((z) => z.percentage < 40).length,
    },
  };
}
