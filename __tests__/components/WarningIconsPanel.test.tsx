import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';
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
  selectUpdated: jest.fn(),
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

jest.mock('@components/common/Skeleton', () => ({
  __esModule: true,
  default: () => {
    const { Text } = require('react-native');
    return <Text testID="warnings-skeleton">loading</Text>;
  },
}));

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
  const cachedDays = [{
    severity: 2,
    type: 'wind',
    date: '2035-03-03T12:00:00+02:00',
    count: 1,
    warnings: [{ description: 'Strong wind in coastal areas.' }],
  }];

  beforeEach(() => {
    mockNavigate.mockClear();
    mockTrackMatomoEvent.mockClear();
    mockMomentLocale.mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it('renders loading skeleton while warnings are loading', () => {
    const { getByTestId } = render(
      <WarningIconsPanel
        dailyWarnings={cachedDays as any}
        hasData={false}
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
        hasData={false}
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
        hasData
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

  it('preserves the same accessible day and header throughout a refresh', () => {
    const props = { dailyWarnings: cachedDays as any, hasData: true, loading: false, error: false };
    const view = render(<WarningIconsPanel {...props} />);
    const day = view.getByA11yLabel(/Warnings: 1/);
    const header = view.getByText('Warnings');
    const panel = view.getByTestId('warnings_panel');

    view.rerender(<WarningIconsPanel {...props} loading />);

    expect(view.queryByTestId('warnings-skeleton')).toBeNull();
    expect(view.getByA11yLabel(/Warnings: 1/)).toBe(day);
    expect(view.getByText('Warnings')).toBe(header);
    expect(view.getByTestId('warnings_panel')).toBe(panel);
    expect(view.queryByTestId('warnings_refresh_status')).toBeNull();

    view.rerender(<WarningIconsPanel {...props} dailyWarnings={[{
      ...cachedDays[0], type: undefined, severity: 0, count: 0, warnings: [],
    }] as any} />);

    expect(view.getByA11yLabel(/Warnings: 0/)).toBe(day);
    expect(view.getByText('Warnings')).toBe(header);
    expect(view.queryByTestId('warnings_refresh_status')).toBeNull();
  });

  it('keeps the wrapper out of the tab order and exposes a header followed by five day buttons', () => {
    const dailyWarnings = Array.from({ length: 5 }, (_, index) => ({
      ...cachedDays[0], date: Date.UTC(2035, 2, 3 + index),
    }));
    const view = render(<WarningIconsPanel
      dailyWarnings={dailyWarnings as any}
      hasData
      loading={false}
      error={false}
    />);
    const wrapper = view.container.findAllByType(TouchableOpacity)
      .find(node => node.props.accessible === false)!;
    expect(wrapper.props.accessible).toBe(false);
    expect(wrapper.props.focusable).toBe(false);
    expect(wrapper.props.importantForAccessibility).toBe('no');

    const header = view.getByA11yLabel('Warnings, Strong wind in coastal areas.');
    expect(header.props.accessibilityRole).toBe('header');
    fireEvent.press(header);
    expect(mockNavigate).toHaveBeenCalledTimes(1);

    const days = view.getAllByA11yLabel(/Warnings: 1/);
    expect(days).toHaveLength(5);
    days.forEach(day => {
      expect(day.props.accessibilityRole).toBe('button');
      expect(day.props.accessibilityHint).toBe('navigateToWarningsPage');
      fireEvent.press(day);
    });
    expect(mockNavigate).toHaveBeenCalledTimes(6);
    expect(mockTrackMatomoEvent).toHaveBeenCalledTimes(6);
    expect(mockNavigate).toHaveBeenLastCalledWith('Warnings');

    view.container.findAllByProps({ accessibilityElementsHidden: true }).forEach(node => {
      expect(node.props.importantForAccessibility).toBe('no-hide-descendants');
    });
  });

  it('keeps cached warnings and their accessible targets when refreshing fails', () => {
    const props = { dailyWarnings: cachedDays as any, hasData: true, loading: false, error: false };
    const view = render(<WarningIconsPanel {...props} />);
    const day = view.getByA11yLabel(/Warnings: 1/);
    const content = JSON.stringify(view.toJSON());

    view.rerender(<WarningIconsPanel {...props} error />);

    expect(view.getByA11yLabel(/Warnings: 1/)).toBe(day);
    expect(view.getByText('Strong wind in coastal areas.')).toBeTruthy();
    expect(JSON.stringify(view.toJSON())).toBe(content);
    expect(view.queryByText('Loading error')).toBeNull();

    view.rerender(<WarningIconsPanel {...props} loading />);
    expect(view.getByA11yLabel(/Warnings: 1/)).toBe(day);
    expect(view.queryByTestId('warnings_refresh_status')).toBeNull();
  });

  it('links Android Tab navigation from the header through all days and updates remounted targets', () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    jest.spyOn(require('react-native'), 'findNodeHandle')
      .mockImplementation((target: any) => target.tag);
    const dailyWarnings = Array.from({ length: 5 }, (_, index) => ({
      ...cachedDays[0], date: Date.UTC(2035, 2, 3 + index),
    }));
    const props = { dailyWarnings: dailyWarnings as any, hasData: true, loading: false, error: false };
    const view = render(<WarningIconsPanel {...props} />);
    const days = view.getAllByA11yLabel(/Warnings: 1/);
    days.forEach((day, index) => {
      fireEvent(day, 'layout', { currentTarget: { tag: 100 + index } });
    });

    const header = view.getByA11yLabel('Warnings, Strong wind in coastal areas.');
    expect(header.props.nextFocusForward).toBe(100);
    days.forEach((day, index) => {
      expect(day.props.nextFocusForward).toBe(index < 4 ? 101 + index : undefined);
    });

    fireEvent(days[1], 'layout', { currentTarget: { tag: 201 } });
    expect(days[0].props.nextFocusForward).toBe(201);
    view.rerender(<WarningIconsPanel {...props} loading />);
    expect(days[0].props.nextFocusForward).toBe(201);
    expect(days[4].props.nextFocusForward).toBeUndefined();
  });

  it('treats a previously loaded response without warnings as cached content', () => {
    const view = render(<WarningIconsPanel
      dailyWarnings={[{ ...cachedDays[0], type: undefined, severity: 0, count: 0, warnings: [] }] as any}
      hasData
      loading
      error={false}
    />);

    expect(view.getByA11yLabel(/Warnings: 0/)).toBeTruthy();
    expect(view.queryByTestId('warnings-skeleton')).toBeNull();
  });
});
