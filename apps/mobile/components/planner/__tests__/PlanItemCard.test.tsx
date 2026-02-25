import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { PlanItemCard } from '../PlanItemCard';
import type { DailyPlanItem } from '../../../types';

const baseItem: DailyPlanItem = {
  id: 'item-1',
  plan_id: 'plan-1',
  topic_id: 'topic-1',
  type: 'new',
  estimated_hours: 2,
  priority_score: 50,
  display_order: 0,
  status: 'pending',
  completed_at: null,
  actual_hours: null,
  topic: {
    id: 'topic-1',
    chapter_id: 'ch-1',
    name: 'Indian Constitution',
    importance: 5,
    difficulty: 3,
    estimated_hours: 2,
    display_order: 1,
    pyq_frequency: 3,
    pyq_weight: 4,
    pyq_trend: 'rising',
    last_pyq_year: 2024,
  },
  chapter_name: 'Polity Basics',
  subject_name: 'Indian Polity',
};

describe('PlanItemCard', () => {
  const onComplete = jest.fn();
  const onDefer = jest.fn();

  beforeEach(() => {
    onComplete.mockReset();
    onDefer.mockReset();
  });

  it('renders topic name', () => {
    const { getByText } = renderWithProviders(
      <PlanItemCard item={baseItem} onComplete={onComplete} onDefer={onDefer} />
    );
    expect(getByText('Indian Constitution')).toBeTruthy();
  });

  it('renders type badge', () => {
    const { getByText } = renderWithProviders(
      <PlanItemCard item={baseItem} onComplete={onComplete} onDefer={onDefer} />
    );
    expect(getByText('NEW')).toBeTruthy();
  });

  it('renders revision badge for revision items', () => {
    const revisionItem = { ...baseItem, type: 'revision' as const };
    const { getByText } = renderWithProviders(
      <PlanItemCard item={revisionItem} onComplete={onComplete} onDefer={onDefer} />
    );
    expect(getByText('REVISION')).toBeTruthy();
  });

  it('renders estimated hours', () => {
    const { getByText } = renderWithProviders(
      <PlanItemCard item={baseItem} onComplete={onComplete} onDefer={onDefer} />
    );
    expect(getByText('2h')).toBeTruthy();
  });

  it('renders subject and chapter badges', () => {
    const { getByText } = renderWithProviders(
      <PlanItemCard item={baseItem} onComplete={onComplete} onDefer={onDefer} />
    );
    expect(getByText('Indian Polity')).toBeTruthy();
    expect(getByText('Polity Basics')).toBeTruthy();
  });

  it('calls onComplete when checkbox pressed', () => {
    const { UNSAFE_getAllByType } = renderWithProviders(
      <PlanItemCard item={baseItem} onComplete={onComplete} onDefer={onDefer} />
    );
    // TouchableOpacity renders as accessible View — find first touchable
    const { TouchableOpacity } = require('react-native');
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[0]); // First touchable is the checkbox
    expect(onComplete).toHaveBeenCalledWith('item-1');
  });

  it('calls onDefer when defer button pressed', () => {
    const { getByText } = renderWithProviders(
      <PlanItemCard item={baseItem} onComplete={onComplete} onDefer={onDefer} />
    );
    fireEvent.press(getByText('Defer'));
    expect(onDefer).toHaveBeenCalledWith('item-1');
  });

  it('hides defer button when completed', () => {
    const completedItem = { ...baseItem, status: 'completed' as const };
    const { queryByText } = renderWithProviders(
      <PlanItemCard item={completedItem} onComplete={onComplete} onDefer={onDefer} />
    );
    expect(queryByText('Defer')).toBeNull();
  });
});
