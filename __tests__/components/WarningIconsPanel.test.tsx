import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import WarningIconsPanel from '../../src/components/warnings/WarningIconsPanel';

const mockNavigate = jest.fn();
const mockTrackMatomoEvent = jest.fn();
const mockMomentLocale = jest.fn();

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/warnings/selectors', () => ({
  selectDailyWarningData: jest.fn(),
  selectError: jest.fn(),
  selectLoading: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      warningCard: '#eef3ff',
      warningCardBorder: '#b9c6e5',
      primaryText: '#111111',
      background: '#ffffff',
    },
    dark: false,
  }),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'panelTitleSlim') return 'Warnings';
      if (key === 'loadingError') return 'Loading error';
      if (key === 'hasWarnings') return 'Warnings';
      return key;
    },
    i18n: { language: 'en' },
  }),
}));

jest.mock('moment', () => {
  const actualMoment = jest.requireActual('moment');
  const wrappedMoment = (...args: any[]) => actualMoment(...args);
  Object.assign(wrappedMoment, actualMoment);
  wrappedMoment.locale = (...args: any[]) => mockMomentLocale(...args);
  return wrappedMoment;
});

jest.mock('moti', () => ({
  MotiView: ({ children }: any) => children,
}));

jest.mock('moti/skeleton', () => ({
  Skeleton: () => {
    const { Text } = require('react-native');
    return <Text testID="warnings-skeleton">loading</Text>;
  },
}), { virtual: true });

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
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
  default: ({ type, severity, physical }: any) => {
    const { Text } = require('react-native');
    return (
      <Text testID={`warning-icon-${type}-${severity}-${physical ? 'physical' : 'normal'}`}>
        {type}
      </Text>
    );
  },
}));

jest.mock('../../src/components/warnings/DayDetailsDescription', () => ({
  __esModule: true,
  default: ({ warnings }: any) => {
    const { Text } = require('react-native');
    return <Text testID="day-details-description">{warnings[0]?.description ?? 'no-description'}</Text>;
  },
}));

jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: (...args: any[]) => mockTrackMatomoEvent(...args),
}));

describe('WarningIconsPanel', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockTrackMatomoEvent.mockClear();
    mockMomentLocale.mockClear();
  });

  it('renders loading skeleton while warnings are loading', () => {
    const { getByTestId } = render(
      <WarningIconsPanel
        dailyWarnings={[]}
        loading
        error={false}
      />
    );

    expect(getByTestId('warnings-skeleton')).toBeTruthy();
  });

  it('renders error card when warning fetch has failed', () => {
    const { getByTestId, getByText } = render(
      <WarningIconsPanel
        dailyWarnings={[]}
        loading={false}
        error
      />
    );

    expect(getByTestId('warnings_panel')).toBeTruthy();
    expect(getByText('Loading error')).toBeTruthy();
  });

  it('renders warning summary and navigates to warnings page on press', () => {
    const dailyWarnings = [
      {
        severity: 2,
        type: 'wind',
        date: '2035-03-03T12:00:00+02:00',
        count: 2,
        warnings: [
          {
            description: 'Strong wind in coastal areas.',
            physical: {
              windIntensity: 21,
              windDirection: 225,
            },
          },
        ],
      },
      {
        severity: 1,
        type: 'rain',
        date: '2035-03-04T12:00:00+02:00',
        count: 0,
        warnings: [
          {
            description: 'Heavy rain later in evening.',
          },
        ],
      },
    ];

    const { getByTestId, getByText, getByA11yLabel } = render(
      <WarningIconsPanel
        dailyWarnings={dailyWarnings as any}
        loading={false}
        error={false}
      />
    );

    expect(getByTestId('warnings_panel')).toBeTruthy();
    expect(getByText('Warnings')).toBeTruthy();
    expect(getByTestId('day-details-description')).toBeTruthy();
    expect(getByText('Strong wind in coastal areas.')).toBeTruthy();
    expect(getByTestId('warning-icon-wind-2-physical')).toBeTruthy();
    expect(getByTestId('warning-icon-rain-1-normal')).toBeTruthy();
    expect(
      getByA11yLabel(/Warnings: 2, Strong wind in coastal areas\./)
    ).toBeTruthy();

    const panelParent = getByTestId('warnings_panel').parent;
    expect(panelParent).toBeTruthy();
    fireEvent.press(panelParent!);

    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Weather',
      'Open warnings -page'
    );
    expect(mockNavigate).toHaveBeenCalledWith('Warnings');
    expect(mockMomentLocale).toHaveBeenCalledWith('en');
  });
});
