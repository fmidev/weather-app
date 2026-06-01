import React from 'react';
import { ImageBackground } from 'react-native';
import { render } from '@testing-library/react-native';

import SunAndMoonPanel from '../../src/components/weather/SunAndMoonPanel';

const mockConfigGet = jest.fn();
const mockFormatAccessibleDateTime = jest.fn();
const mockResolveMoonPhase = jest.fn();
let mockWindowDimensions = {
  width: 390,
  height: 800,
  fontScale: 1,
  scale: 1,
};

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/forecast/selectors', () => ({
  selectIsWaningMoonPhase: jest.fn(),
  selectLoading: jest.fn(),
  selectNextHourForecast: jest.fn(),
}));

jest.mock('@store/settings/selectors', () => ({
  selectClockType: jest.fn(),
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');
  return Object.create(ReactNative, {
    useWindowDimensions: {
      value: () => mockWindowDimensions,
      configurable: true,
    },
  });
});

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      background: '#ffffff',
      primaryText: '#111111',
    },
    dark: false,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('moti', () => ({
  MotiView: ({ children }: any) => {
    const { View } = require('react-native');
    return <View testID="moti-view">{children}</View>;
  },
}));

jest.mock(
  'moti/skeleton',
  () => ({
    Skeleton: (props: any) => {
      const { Text } = require('react-native');
      return <Text testID="skeleton">{JSON.stringify(props)}</Text>;
    },
  }),
  { virtual: true }
);

jest.mock('@assets/images/backgrounds', () => ({
  sunBackground: { source: 'sun-light' },
  sunBackgroundDark: { source: 'sun-dark' },
  moonPhaseImages: {
    full: { source: 'moon-full' },
    new: { source: 'moon-new' },
  },
}));

jest.mock('@utils/moon', () => ({
  resolveMoonPhase: (...args: any[]) => mockResolveMoonPhase(...args),
}));

jest.mock('@utils/helpers', () => ({
  formatAccessibleDateTime: (...args: any[]) =>
    mockFormatAccessibleDateTime(...args),
}));

jest.mock('@components/common/AppText', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{children}</Text>;
  },
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: ({ name }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

const normalForecast = {
  sunrise: '2035-06-01T03:00:00',
  sunset: '2035-06-01T21:30:00',
  dayLength: 1110,
  moonPhase: 0.5,
};

describe('SunAndMoonPanel', () => {
  beforeEach(() => {
    mockConfigGet.mockReset();
    mockFormatAccessibleDateTime.mockReset();
    mockResolveMoonPhase.mockReset();
    mockWindowDimensions = {
      width: 390,
      height: 800,
      fontScale: 1,
      scale: 1,
    };

    mockConfigGet.mockReturnValue({
      forecast: {
        excludeDayDuration: false,
        excludePolarNightAndMidnightSun: false,
      },
    });
    mockResolveMoonPhase.mockReturnValue('full');
    mockFormatAccessibleDateTime.mockReturnValue('accessible date');
  });

  it('renders loading skeletons when forecast is missing', () => {
    const view = render(
      <SunAndMoonPanel
        loading
        forecast={undefined as any}
        waningMoonPhase={false}
        clockType={24 as any}
      />
    );

    expect(view.getByTestId('moti-view')).toBeTruthy();
    expect(view.getAllByTestId('skeleton')).toHaveLength(2);
  });

  it('renders normal sunrise, sunset, day length and moon phase', () => {
    const view = render(
      <SunAndMoonPanel
        loading={false}
        forecast={normalForecast as any}
        waningMoonPhase
        clockType={24 as any}
      />
    );

    expect(view.getByText('dayLength')).toBeTruthy();
    expect(view.getByText('18 h 30 min')).toBeTruthy();
    expect(view.getByA11yLabel(/sunrise time:atSpoken/)).toBeTruthy();
    expect(view.getByA11yLabel(/sunset time:atSpoken/)).toBeTruthy();
    expect(view.getByText('moonPhase')).toBeTruthy();
    expect(view.getByText('sunAndMoon.full')).toBeTruthy();
    expect(view.getByTestId('icon-sun-arrow-up')).toBeTruthy();
    expect(view.getByTestId('icon-sun-arrow-down')).toBeTruthy();
    expect(view.getByTestId('icon-time')).toBeTruthy();
    expect(mockResolveMoonPhase).toHaveBeenCalledWith(0.5, true);

    const backgrounds = view.UNSAFE_getAllByType(ImageBackground);
    expect(backgrounds[0].props.source).toEqual({ source: 'sun-light' });
    expect(backgrounds[1].props.source).toEqual({ source: 'moon-full' });
  });

  it('renders polar night branch', () => {
    const view = render(
      <SunAndMoonPanel
        loading={false}
        forecast={{
          sunrise: '2035-12-02T10:00:00',
          sunset: '2035-12-01T12:00:00',
          dayLength: 0,
          moonPhase: 0.1,
        } as any}
        waningMoonPhase={false}
        clockType={24 as any}
      />
    );

    expect(view.getByText('weatherInfoBottomSheet.polarNight')).toBeTruthy();
    expect(view.getByTestId('icon-polar-night')).toBeTruthy();
    expect(view.getByA11yLabel('sunrise accessible date')).toBeTruthy();
  });

  it('renders midnight sun branch and 12 hour suffixes', () => {
    const view = render(
      <SunAndMoonPanel
        loading={false}
        forecast={{
          sunrise: '2035-06-01T00:00:00',
          sunset: '2035-06-03T13:00:00',
          dayLength: 1440,
          moonPhase: 0.2,
        } as any}
        waningMoonPhase={false}
        clockType={12 as any}
      />
    );

    expect(view.getByText('weatherInfoBottomSheet.nightlessNight')).toBeTruthy();
    expect(view.getByTestId('icon-midnight-sun')).toBeTruthy();
    expect(view.getByA11yLabel('sunset accessible date')).toBeTruthy();
  });

  it('hides day duration when excluded', () => {
    mockConfigGet.mockReturnValue({
      forecast: {
        excludeDayDuration: true,
        excludePolarNightAndMidnightSun: false,
      },
    });

    const view = render(
      <SunAndMoonPanel
        loading={false}
        forecast={normalForecast as any}
        waningMoonPhase={false}
        clockType={24 as any}
      />
    );

    expect(view.queryByText('18 h 30 min')).toBeNull();
    expect(view.queryByTestId('icon-time')).toBeNull();
  });
});
