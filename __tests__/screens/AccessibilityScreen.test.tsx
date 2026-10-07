import './screenTestMocks';

import React from 'react';
import { render } from '@testing-library/react-native';

import AccessibilityScreen from '../../src/screens/AccessibilityScreen';
import { mockState, resetScreenMocks } from './screenTestMocks';

describe('AccessibilityScreen', () => {
  beforeEach(() => {
    resetScreenMocks();
  });

  it('renders markdown accessibility content by default', () => {
    const { getByTestId } = render(<AccessibilityScreen />);

    expect(getByTestId('accessibility_view')).toBeTruthy();
    expect(getByTestId('markdown').props.children).toBe('accessibility markdown en');
  });

  it.each(['fi', 'sv', 'en'])('renders localized accessibility markdown (%s)', (language) => {
    mockState.language = language;
    const { getByTestId } = render(<AccessibilityScreen />);

    expect(getByTestId('markdown').props.children).toBe(`accessibility markdown ${language}`);
  });

  it('falls back to English when the current language has no document', () => {
    mockState.language = 'unknown';

    const { getByTestId } = render(<AccessibilityScreen />);

    expect(getByTestId('markdown').props.children).toBe(
      'accessibility markdown en'
    );
  });
});
