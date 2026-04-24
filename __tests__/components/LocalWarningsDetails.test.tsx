import React from 'react';
import { render } from '@testing-library/react-native';

import LocalWarningsDetails from '../../src/components/warnings/cap/LocalWarningsDetails';

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      hourListText: '#333333',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'noWarningsText') return 'No warnings';
      if (key === 'warnings:severities:2') return 'Severe';
      return key;
    },
  }),
}));

jest.mock('../../src/components/warnings/cap/WarningItem', () => ({
  __esModule: true,
  default: ({ timespan }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`warning-item-${timespan}`}>{timespan}</Text>;
  },
}));

describe('LocalWarningsDetails', () => {
  it('renders empty state when there are no warnings', () => {
    const { getByText } = render(
      <LocalWarningsDetails warnings={[]} clockType={24} locale="en" />
    );

    expect(getByText('No warnings')).toBeTruthy();
  });

  it('renders warning items with formatted timespan accessibility', () => {
    const warning = {
      identifier: 'id-1',
      info: {
        event: 'Wind',
        severity: 'Severe',
        effective: '2025-01-01T10:00:00Z',
        expires: '2025-01-01T12:00:00Z',
        area: { areaDesc: 'Helsinki' },
      },
    } as any;

    const { getByLabelText } = render(
      <LocalWarningsDetails warnings={[warning]} clockType={24} locale="en" />
    );

    expect(getByLabelText(/Wind, Severe/)).toBeTruthy();
  });
});
