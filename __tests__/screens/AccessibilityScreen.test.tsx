import './screenTestMocks';

import React from 'react';
import { render } from '@testing-library/react-native';

import AccessibilityScreen from '../../src/screens/AccessibilityScreen';
import { mockConfigGet, resetScreenMocks } from './screenTestMocks';

describe('AccessibilityScreen', () => {
  beforeEach(() => {
    resetScreenMocks();
  });

  it('renders accessibility statement by default', () => {
    const { getByTestId } = render(<AccessibilityScreen />);

    expect(getByTestId('accessibility_view')).toBeTruthy();
    expect(getByTestId('accessibility-statement')).toBeTruthy();
  });

  it('renders markdown content when enabled', () => {
    mockConfigGet.mockReturnValue({
      markdown: { accessibility: true },
    });

    const { getByTestId } = render(<AccessibilityScreen />);

    expect(getByTestId('markdown').props.children).toBe(
      'accessibility markdown en'
    );
  });
});
