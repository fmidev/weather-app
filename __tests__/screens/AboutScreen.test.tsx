import './screenTestMocks';

import React from 'react';
import { render } from '@testing-library/react-native';

import AboutScreen from '../../src/screens/AboutScreen';
import { mockConfigGet, mockState, resetScreenMocks } from './screenTestMocks';

describe('AboutScreen', () => {
  beforeEach(() => {
    resetScreenMocks();
  });

  it('renders plain about content', () => {
    const { getByTestId, getByText } = render(<AboutScreen />);

    expect(getByText('about:title')).toBeTruthy();
    expect(getByTestId('about_version_info').props.children).toContain(
      'about:versionInfo'
    );
  });

  it('renders markdown content when enabled', () => {
    mockState.language = 'fi';
    mockConfigGet.mockReturnValue({
      markdown: { aboutTheApplication: true },
    });

    const { getByTestId } = render(<AboutScreen />);

    expect(getByTestId('markdown').props.children).toBe('about markdown fi');
    expect(getByTestId('about_version_info')).toBeTruthy();
  });
});
