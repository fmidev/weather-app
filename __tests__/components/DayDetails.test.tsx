import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import DayDetails from '../../src/components/warnings/DayDetails';

const mockTrackMatomoEvent = jest.fn();

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/settings/selectors', () => ({
  selectClockType: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      hourListText: '#2b2b2b',
      border: '#cfcfcf',
      text: '#111111',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'warnings:noWarningsText') return 'No warnings';
      if (key === 'lessAccessibilityHint') return 'Show less';
      if (key === 'moreAccessibilityHint') return 'Show more';
      if (key === 'valid') return 'Valid';
      if (key === 'types.wind') return 'Wind warning';
      if (key === 'types.rain') return 'Rain warning';
      return key;
    },
    i18n: { language: 'en' },
  }),
}));

jest.mock('@components/common/AppText', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{children}</Text>;
  },
}));

jest.mock('../../src/components/warnings/WarningIcon', () => ({
  __esModule: true,
  default: ({ type, severityDescription }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`warning-icon-${type}-${severityDescription}`}>icon</Text>;
  },
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: ({ name }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: (...args: any[]) => mockTrackMatomoEvent(...args),
}));

describe('DayDetails', () => {
  const warning = {
    description: 'Strong wind in coastal areas.',
    type: 'wind',
    severity: 'moderate',
    physical: false,
    duration: {
      startTime: '2035-03-03T10:00:00+02:00',
      endTime: '2035-03-03T20:00:00+02:00',
    },
  };

  beforeEach(() => {
    mockTrackMatomoEvent.mockClear();
  });

  it('renders no-warnings message when warnings list is empty', () => {
    const { getByText } = render(
      <DayDetails clockType={24 as any} warnings={[]} />
    );

    expect(getByText('No warnings')).toBeTruthy();
  });

  it('renders warning rows and toggles description open and closed', () => {
    const { getAllByText, getByHintText, getByTestId, getByText, queryByText } = render(
      <DayDetails clockType={24 as any} warnings={[warning] as any} />
    );

    expect(getByTestId('warning-icon-wind-moderate')).toBeTruthy();
    expect(getByTestId('icon-arrow-down')).toBeTruthy();
    expect(getAllByText(/Wind warning/).length).toBeGreaterThan(0);
    expect(queryByText('Strong wind in coastal areas.')).toBeNull();

    fireEvent.press(getByHintText('Show more'));
    expect(getByText('Strong wind in coastal areas.')).toBeTruthy();
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Warnings',
      'Open warning details'
    );

    fireEvent.press(getByHintText('Show less'));
    expect(queryByText('Strong wind in coastal areas.')).toBeNull();
    expect(mockTrackMatomoEvent).toHaveBeenCalledTimes(1);
  });

  it('resets opened rows when warnings prop changes', () => {
    const { getByHintText, getByText, queryByText, rerender } = render(
      <DayDetails clockType={24 as any} warnings={[warning] as any} />
    );

    fireEvent.press(getByHintText('Show more'));
    expect(getByText('Strong wind in coastal areas.')).toBeTruthy();

    rerender(
      <DayDetails
        clockType={24 as any}
        warnings={[
          warning,
          {
            ...warning,
            type: 'rain',
            description: 'Heavy rain later in evening.',
            duration: {
              startTime: '2035-03-04T10:00:00+02:00',
              endTime: '2035-03-04T20:00:00+02:00',
            },
          },
        ] as any}
      />
    );

    expect(queryByText('Strong wind in coastal areas.')).toBeNull();
    expect(queryByText('Heavy rain later in evening.')).toBeNull();
  });
});
