import React from 'react';
import { render } from '@testing-library/react-native';

import DayDetailsDescription from '../../src/components/warnings/DayDetailsDescription';

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      hourListText: '#2b2b2b',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'warnings:noWarningsText') return 'No warnings';
      return key;
    },
  }),
}));

const warningBase = {
  type: 'wind' as any,
  language: 'fi',
  duration: {
    startTime: '2035-03-03T10:00:00+02:00',
    endTime: '2035-03-03T20:00:00+02:00',
  },
  severity: 'moderate' as any,
};

describe('DayDetailsDescription', () => {
  it('renders no-warnings message when warnings list is empty', () => {
    const { getByText } = render(<DayDetailsDescription warnings={[]} />);

    const label = getByText('No warnings');
    expect(label).toBeTruthy();

    const styles = Array.isArray(label.props.style) ? label.props.style : [label.props.style];
    const mergedStyle = Object.assign({}, ...styles);
    expect(mergedStyle.color).toBe('#2b2b2b');
  });

  it('renders only the first warning description when warnings exist', () => {
    const warnings = [
      {
        ...warningBase,
        description: 'Strong wind in coastal areas.',
      },
      {
        ...warningBase,
        description: 'Heavy rain later in evening.',
      },
    ];

    const { getByText, queryByText } = render(<DayDetailsDescription warnings={warnings as any} />);

    expect(getByText('Strong wind in coastal areas.')).toBeTruthy();
    expect(queryByText('Heavy rain later in evening.')).toBeNull();
    expect(queryByText('No warnings')).toBeNull();
  });
});
