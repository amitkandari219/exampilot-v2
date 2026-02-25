import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { SubjectCard } from '../SubjectCard';
import type { Subject } from '../../../types';

// Mock ChapterAccordion to avoid deep render tree
jest.mock('../ChapterAccordion', () => ({
  ChapterAccordion: () => null,
}));

const mockSubject: Subject = {
  id: 'sub-1',
  name: 'Indian Polity',
  papers: ['GS-II'],
  importance: 5,
  difficulty: 3,
  estimated_hours: 40,
  display_order: 1,
  chapters: [],
  progress: {
    total_topics: 20,
    completed_topics: 8,
    weighted_completion: 45,
    avg_confidence: 62,
  },
};

describe('SubjectCard', () => {
  const onTopicPress = jest.fn();

  it('renders subject name', () => {
    const { getByText } = renderWithProviders(
      <SubjectCard subject={mockSubject} onTopicPress={onTopicPress} />
    );
    expect(getByText('Indian Polity')).toBeTruthy();
  });

  it('renders topic count', () => {
    const { getByText } = renderWithProviders(
      <SubjectCard subject={mockSubject} onTopicPress={onTopicPress} />
    );
    expect(getByText('8/20 topics')).toBeTruthy();
  });

  it('renders weighted completion percentage', () => {
    const { getByText } = renderWithProviders(
      <SubjectCard subject={mockSubject} onTopicPress={onTopicPress} />
    );
    expect(getByText('45%')).toBeTruthy();
    expect(getByText('weighted')).toBeTruthy();
  });

  it('renders confidence score', () => {
    const { getByText } = renderWithProviders(
      <SubjectCard subject={mockSubject} onTopicPress={onTopicPress} />
    );
    expect(getByText('62')).toBeTruthy();
    expect(getByText('confidence')).toBeTruthy();
  });

  it('toggles expanded state on press', () => {
    const { getByText } = renderWithProviders(
      <SubjectCard subject={mockSubject} onTopicPress={onTopicPress} />
    );
    // Initially shows down arrow
    expect(getByText('\u25BC')).toBeTruthy();
    // Press to expand
    fireEvent.press(getByText('Indian Polity'));
    // Now shows up arrow
    expect(getByText('\u25B2')).toBeTruthy();
  });

  it('handles missing progress gracefully', () => {
    const subjectNoProgress = { ...mockSubject, progress: undefined };
    const { getByText } = renderWithProviders(
      <SubjectCard subject={subjectNoProgress} onTopicPress={onTopicPress} />
    );
    expect(getByText('0/0 topics')).toBeTruthy();
    expect(getByText('0%')).toBeTruthy();
  });
});
