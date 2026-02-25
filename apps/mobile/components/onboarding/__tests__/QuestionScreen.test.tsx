import React from 'react';
import { Text } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { QuestionScreen } from '../QuestionScreen';

// Mock OnboardingProgressBar and ChatBubble
jest.mock('../OnboardingProgressBar', () => ({
  OnboardingProgressBar: () => null,
}));
jest.mock('../ChatBubble', () => ({
  ChatBubble: ({ message }: { message: string }) => {
    const { Text } = require('react-native');
    return <Text>{message}</Text>;
  },
}));

describe('QuestionScreen', () => {
  it('renders question text', () => {
    const { getByText } = renderWithProviders(
      <QuestionScreen step={0} totalSteps={5} question="How many hours?">
        <Text>Child content</Text>
      </QuestionScreen>
    );
    expect(getByText('How many hours?')).toBeTruthy();
  });

  it('renders subtitle when provided', () => {
    const { getByText } = renderWithProviders(
      <QuestionScreen step={0} totalSteps={5} question="Q" subtitle="Pick one">
        <Text>Body</Text>
      </QuestionScreen>
    );
    expect(getByText('Pick one')).toBeTruthy();
  });

  it('renders children', () => {
    const { getByText } = renderWithProviders(
      <QuestionScreen step={0} totalSteps={5} question="Q">
        <Text>Options here</Text>
      </QuestionScreen>
    );
    expect(getByText('Options here')).toBeTruthy();
  });

  it('renders Continue button by default', () => {
    const { getByText } = renderWithProviders(
      <QuestionScreen step={0} totalSteps={5} question="Q">
        <Text>Body</Text>
      </QuestionScreen>
    );
    expect(getByText('Continue')).toBeTruthy();
  });

  it('renders custom next label', () => {
    const { getByText } = renderWithProviders(
      <QuestionScreen step={0} totalSteps={5} question="Q" nextLabel="Let's Go!">
        <Text>Body</Text>
      </QuestionScreen>
    );
    expect(getByText("Let's Go!")).toBeTruthy();
  });

  it('calls onNext when Continue pressed', () => {
    const onNext = jest.fn();
    const { getByText } = renderWithProviders(
      <QuestionScreen step={0} totalSteps={5} question="Q" onNext={onNext}>
        <Text>Body</Text>
      </QuestionScreen>
    );
    fireEvent.press(getByText('Continue'));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('hides next button when showNext is false', () => {
    const { queryByText } = renderWithProviders(
      <QuestionScreen step={0} totalSteps={5} question="Q" showNext={false}>
        <Text>Body</Text>
      </QuestionScreen>
    );
    expect(queryByText('Continue')).toBeNull();
  });

  it('renders back button for step > 0', () => {
    const { getByText } = renderWithProviders(
      <QuestionScreen step={2} totalSteps={5} question="Q">
        <Text>Body</Text>
      </QuestionScreen>
    );
    expect(getByText('← Back')).toBeTruthy();
  });

  it('does not render back button for step 0', () => {
    const { queryByText } = renderWithProviders(
      <QuestionScreen step={0} totalSteps={5} question="Q">
        <Text>Body</Text>
      </QuestionScreen>
    );
    expect(queryByText('← Back')).toBeNull();
  });

  it('renders chat bubble when chatMessage provided', () => {
    const { getByText } = renderWithProviders(
      <QuestionScreen step={0} totalSteps={5} question="Q" chatMessage="Hello aspirant!">
        <Text>Body</Text>
      </QuestionScreen>
    );
    expect(getByText('Hello aspirant!')).toBeTruthy();
  });
});
