import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, TextInput, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Theme } from '../constants/theme';
import { useSyllabus } from '../hooks/useSyllabus';
import { useTopicNotes, useAddTopicNote, useDeleteTopicNote } from '../hooks/useTopicNotes';
import { useTopicResources } from '../hooks/useResources';
import { V4Card } from '../components/v4/V4Card';
import { V4Bar } from '../components/v4/V4Bar';
import { V4Pill } from '../components/v4/V4Pill';
import { V4SectionLabel } from '../components/v4/V4SectionLabel';
import { V4Tip } from '../components/v4/V4Tip';
import type { TopicResource } from '../types';

type FilterKey = 'all' | 'untouched' | 'revision' | 'weak' | 'exam_ready';
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'untouched', label: 'Untouched' },
  { key: 'revision', label: 'Needs Revision' },
  { key: 'weak', label: 'Weak' },
  { key: 'exam_ready', label: 'Exam Ready' },
];

const STATUS_VARIANTS: Record<string, 'accent' | 'warn' | 'danger' | 'green' | 'purple' | 'muted'> = {
  untouched: 'muted',
  in_progress: 'accent',
  first_pass: 'warn',
  revised: 'purple',
  exam_ready: 'green',
  deferred_scope: 'danger',
};

const CONFIDENCE_VARIANTS: Record<string, 'green' | 'accent' | 'warn' | 'danger'> = {
  fresh: 'green',
  fading: 'warn',
  stale: 'danger',
  decayed: 'danger',
};

export default function FullSyllabusScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { daysUsed, isVeteran } = useUser();
  const { data: syllabus, isLoading } = useSyllabus();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  // Lock screen for freshers < day 14
  if (!isVeteran && daysUsed < 14) {
    const remaining = 14 - daysUsed;
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.lockContainer}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockTitle}>Full Syllabus unlocks in {remaining} days</Text>
          <Text style={styles.lockDesc}>
            Seeing 466 topics in week 1 causes anxiety. Focus on the daily plan for now — we'll reveal the full picture when you're ready.
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.lockBtn}>
            <Text style={styles.lockBtnText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.accent} /></View>
      </SafeAreaView>
    );
  }

  const subjects = syllabus?.subjects || [];

  // Global stats
  let totalTopics = 0;
  let completedTopics = 0;
  for (const sub of subjects) {
    for (const ch of sub.chapters) {
      for (const topic of ch.topics) {
        totalTopics++;
        if (topic.user_progress?.status && topic.user_progress.status !== 'untouched') {
          completedTopics++;
        }
      }
    }
  }
  const globalPct = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Filter topics
  const matchesFilter = (status: string | undefined, confStatus: string | undefined) => {
    if (filter === 'all') return true;
    if (filter === 'untouched') return !status || status === 'untouched';
    if (filter === 'revision') return confStatus === 'fading' || confStatus === 'stale' || confStatus === 'decayed';
    if (filter === 'weak') return status === 'in_progress' || status === 'first_pass';
    if (filter === 'exam_ready') return status === 'exam_ready';
    return true;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Full Syllabus</Text>

        {/* Global stats */}
        <V4Card style={styles.statsCard}>
          <Text style={styles.statsText}>
            {completedTopics} of {totalTopics} topics · Weighted by PYQ
          </Text>
          <V4Bar progress={globalPct} height={6} />
        </V4Card>

        <V4Tip message="Weighted by PYQ importance — high-frequency topics count more toward completion." variant="info" />

        {/* Filter bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, filter === f.key && { backgroundColor: theme.colors.accent }]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[
                styles.filterText,
                filter === f.key && { color: theme.colors.background },
              ]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 3-level collapsible */}
        {subjects.map((subject) => {
          const subExpanded = expandedSubjects[subject.id] ?? false;

          // Count matching topics for this subject
          let subMatchCount = 0;
          for (const ch of subject.chapters) {
            for (const t of ch.topics) {
              if (matchesFilter(t.user_progress?.status, t.user_progress?.confidence_status)) {
                subMatchCount++;
              }
            }
          }
          if (filter !== 'all' && subMatchCount === 0) return null;

          return (
            <View key={subject.id}>
              <TouchableOpacity
                style={styles.subjectRow}
                onPress={() => setExpandedSubjects((prev) => ({ ...prev, [subject.id]: !prev[subject.id] }))}
              >
                <Text style={styles.subjectName}>{subject.name}</Text>
                <Text style={styles.subjectMeta}>{subMatchCount} topics {subExpanded ? '▾' : '▸'}</Text>
              </TouchableOpacity>

              {subExpanded && subject.chapters.map((chapter) => {
                const chExpanded = expandedChapters[chapter.id] ?? false;
                const matchingTopics = chapter.topics.filter((t) =>
                  matchesFilter(t.user_progress?.status, t.user_progress?.confidence_status)
                );
                if (filter !== 'all' && matchingTopics.length === 0) return null;

                return (
                  <View key={chapter.id}>
                    <TouchableOpacity
                      style={styles.chapterRow}
                      onPress={() => setExpandedChapters((prev) => ({ ...prev, [chapter.id]: !prev[chapter.id] }))}
                    >
                      <Text style={styles.chapterName}>{chapter.name}</Text>
                      <Text style={styles.chapterMeta}>{matchingTopics.length} {chExpanded ? '▾' : '▸'}</Text>
                    </TouchableOpacity>

                    {chExpanded && matchingTopics.map((topic) => {
                      const isExpanded = expandedTopic === topic.id;
                      const status = topic.user_progress?.status || 'untouched';
                      const confStatus = topic.user_progress?.confidence_status || '';
                      const pyqDots = Math.min(5, Math.ceil(topic.pyq_weight));

                      return (
                        <View key={topic.id}>
                          <TouchableOpacity
                            style={styles.topicRow}
                            onPress={() => setExpandedTopic(isExpanded ? null : topic.id)}
                          >
                            <View style={styles.topicLeft}>
                              <Text style={styles.topicName} numberOfLines={1}>{topic.name}</Text>
                              <View style={styles.pyqDots}>
                                {Array.from({ length: pyqDots }).map((_, i) => (
                                  <View key={i} style={[styles.pyqDot, { backgroundColor: theme.colors.accent }]} />
                                ))}
                              </View>
                            </View>
                            <View style={styles.topicRight}>
                              <V4Pill label={status.replace(/_/g, ' ').toUpperCase()} variant={STATUS_VARIANTS[status] || 'muted'} />
                              {confStatus && (
                                <V4Pill label={confStatus.toUpperCase()} variant={CONFIDENCE_VARIANTS[confStatus] || 'muted'} />
                              )}
                            </View>
                          </TouchableOpacity>

                          {/* Expanded topic detail */}
                          {isExpanded && (
                            <>
                              {/* Date metadata */}
                              <View style={styles.topicDates}>
                                {topic.user_progress?.last_touched && (
                                  <Text style={styles.dateText}>
                                    Covered: {new Date(topic.user_progress.last_touched).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                  </Text>
                                )}
                                {(topic as any).fsrs_dates?.last_review && (
                                  <Text style={styles.dateText}>
                                    Last revised: {new Date((topic as any).fsrs_dates.last_review).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                  </Text>
                                )}
                                {(topic as any).fsrs_dates?.next_revision && (
                                  <Text style={styles.dateText}>
                                    Next revision: {new Date((topic as any).fsrs_dates.next_revision).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                  </Text>
                                )}
                              </View>
                              <TopicDescriptionAndResources
                                topicId={topic.id}
                                description={topic.description}
                                theme={theme}
                                styles={styles}
                              />
                              <TopicDetail topicId={topic.id} theme={theme} styles={styles} />
                            </>
                          )}
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const RESOURCE_ICON: Record<string, string> = {
  book: '\u{1F4D6}',
  video: '\u{1F3AC}',
  notes: '\u{1F4DD}',
  website: '\u{1F310}',
};

function TopicDescriptionAndResources({ topicId, description, theme, styles }: {
  topicId: string;
  description: string | null;
  theme: Theme;
  styles: any;
}) {
  const { data: resources } = useTopicResources(topicId);

  if (!description && (!resources || resources.length === 0)) return null;

  return (
    <View style={styles.descResContainer}>
      {description && (
        <Text style={styles.descriptionText} numberOfLines={3}>{description}</Text>
      )}
      {resources && resources.length > 0 && (
        <View style={styles.inlineResources}>
          {resources.map((r: TopicResource) => (
            <TouchableOpacity
              key={r.id}
              style={styles.inlineResourceRow}
              disabled={!r.url}
              onPress={() => r.url && Linking.openURL(r.url)}
            >
              <Text style={styles.resourceIconText}>{RESOURCE_ICON[r.resource_type] || '\u{1F4D6}'}</Text>
              <Text style={styles.inlineResourceTitle} numberOfLines={1}>{r.title}</Text>
              <Text style={styles.inlineResourceSource}>{r.source_name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function TopicDetail({ topicId, theme, styles }: { topicId: string; theme: Theme; styles: any }) {
  const { data: notes } = useTopicNotes(topicId);
  const addNote = useAddTopicNote();
  const deleteNote = useDeleteTopicNote();
  const [newNoteText, setNewNoteText] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleAddNote = useCallback(() => {
    if (!newNoteText.trim()) return;
    const isLink = newNoteText.trim().startsWith('http');
    addNote.mutate(
      { topicId, noteType: isLink ? 'link' : 'text', content: newNoteText.trim() },
      { onSuccess: () => { setNewNoteText(''); setShowInput(false); } }
    );
  }, [newNoteText, topicId, addNote]);

  return (
    <V4Card style={styles.topicDetail}>
      {/* Notes */}
      {notes && notes.length > 0 && (
        <View style={styles.notesList}>
          {notes.map((note) => (
            <View key={note.id} style={styles.noteRow}>
              <Text style={note.note_type === 'link' ? styles.noteLink : styles.noteText}>
                {note.note_type === 'link' ? '📎 ' : '📝 '}{note.content}
              </Text>
              <TouchableOpacity onPress={() => deleteNote.mutate(note.id)}>
                <Text style={styles.noteDelete}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {showInput ? (
        <View style={styles.noteInputRow}>
          <TextInput
            style={styles.noteInput}
            placeholder="Note or link..."
            placeholderTextColor={theme.colors.textMuted}
            value={newNoteText}
            onChangeText={setNewNoteText}
            onSubmitEditing={handleAddNote}
            autoFocus
          />
          <TouchableOpacity onPress={handleAddNote} style={styles.noteAddBtn}>
            <Text style={styles.noteAddBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setShowInput(true)}>
          <Text style={styles.addNoteLink}>+ Add note or link</Text>
        </TouchableOpacity>
      )}
    </V4Card>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1 },
  content: { padding: theme.spacing.lg, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: { marginBottom: 8 },
  backText: { fontSize: 14, color: theme.colors.accent },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },

  // Lock screen
  lockContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  lockIcon: { fontSize: 48, marginBottom: 16 },
  lockTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.text, textAlign: 'center', marginBottom: 12 },
  lockDesc: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  lockBtn: { paddingVertical: 10, paddingHorizontal: 20 },
  lockBtnText: { fontSize: 15, color: theme.colors.accent, fontWeight: '600' },

  // Stats
  statsCard: { marginBottom: 8 },
  statsText: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 8 },

  // Filter
  filterScroll: { marginVertical: 12 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    marginRight: 8,
  },
  filterText: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },

  // Subjects
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  subjectName: { fontSize: 15, fontWeight: '700', color: theme.colors.text, flex: 1 },
  subjectMeta: { fontSize: 12, color: theme.colors.textMuted },

  // Chapters
  chapterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 4,
  },
  chapterName: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary, flex: 1 },
  chapterMeta: { fontSize: 11, color: theme.colors.textMuted },

  // Topics
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 32,
    paddingRight: 4,
  },
  topicLeft: { flex: 1, marginRight: 8 },
  topicName: { fontSize: 13, color: theme.colors.text },
  topicRight: { flexDirection: 'row', gap: 4 },
  pyqDots: { flexDirection: 'row', gap: 3, marginTop: 3 },
  pyqDot: { width: 5, height: 5, borderRadius: 3 },

  // Topic dates
  topicDates: {
    marginLeft: 32,
    marginRight: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 6,
  },
  dateText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },

  // Description & Resources
  descResContainer: {
    marginLeft: 32,
    marginRight: 4,
    paddingVertical: 6,
  },
  descriptionText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 6,
  },
  inlineResources: { gap: 4 },
  inlineResourceRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingVertical: 3,
  },
  resourceIconText: { fontSize: 13 },
  inlineResourceTitle: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '500' as const,
    flex: 1,
  },
  inlineResourceSource: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },

  // Topic detail
  topicDetail: { marginLeft: 32, marginRight: 4, marginBottom: 8 },
  notesList: { marginBottom: 8 },
  noteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  noteText: { fontSize: 12, color: theme.colors.warning, fontStyle: 'italic', flex: 1 },
  noteLink: { fontSize: 12, color: theme.colors.purple, flex: 1 },
  noteDelete: { fontSize: 18, color: theme.colors.textMuted, paddingHorizontal: 8 },
  noteInputRow: { flexDirection: 'row', gap: 8 },
  noteInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: theme.colors.text,
  },
  noteAddBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.accent,
    borderRadius: 8,
  },
  noteAddBtnText: { fontSize: 12, fontWeight: '600', color: theme.colors.background },
  addNoteLink: { fontSize: 12, color: theme.colors.accent, marginTop: 4 },
});
