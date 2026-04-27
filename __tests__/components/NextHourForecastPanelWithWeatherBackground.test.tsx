import React from 'react';
import { ImageBackground } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import NextHourForecastPanelWithWeatherBackground from '../../src/components/weather/NextHourForecastPanelWithWeatherBackground';

const mockConfigGet = jest.fn();
const mockConverter = jest.fn();
const mockFormatAccessibleTemperature = jest.fn();
const mockGetForecastParameterUnitTranslationKey = jest.fn();
const mockGetGeolocation = jest.fn();
const mockNavigate = jest.fn();
const mockNextHourForecastBar = jest.fn();
const mockNextHoursForecast = jest.fn();
const mockSetCurrentLocation = jest.fn();
const mockToPrecision = jest.fn();
const mockTrackMatomoEvent = jest.fn();
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
  selectLoading: jest.fn(),
  selectNextHourForecast: jest.fn(),
  selectIsAuroraBorealisLikely: jest.fn(),
}));

jest.mock('@store/location/selector', () => ({
  selectTimeZone: jest.fn(),
  selectCurrent: jest.fn(),
}));

jest.mock('@store/settings/selectors', () => ({
  selectUnits: jest.fn(),
}));

jest.mock('@store/location/actions', () => ({
  setCurrentLocation: jest.fn((value: any) => ({
    type: 'SET_CURRENT_LOCATION',
    payload: value,
  })),
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, style }: any) => {
    const { View } = require('react-native');
    return <View testID="safe-area" style={style}>{children}</View>;
  },
  useSafeAreaInsets: () => ({
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  }),
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

jest.mock('react-native-linear-gradient', () => ({
  __esModule: true,
  default: ({ children, colors }: any) => {
    const { View } = require('react-native');
    return <View testID="linear-gradient" data-colors={colors}>{children}</View>;
  },
}));

jest.mock('@assets/images/backgrounds', () => ({
  weatherBackgroundGetter: (symbol: string, wide: boolean) => ({
    testBackground: `${symbol}-${wide ? 'wide' : 'narrow'}`,
  }),
}));

jest.mock('@utils/helpers', () => ({
  formatAccessibleTemperature: (...args: any[]) =>
    mockFormatAccessibleTemperature(...args),
  getGeolocation: (...args: any[]) => mockGetGeolocation(...args),
}));

jest.mock('@utils/units', () => ({
  converter: (...args: any[]) => mockConverter(...args),
  toPrecision: (...args: any[]) => mockToPrecision(...args),
  getForecastParameterUnitTranslationKey: (...args: any[]) =>
    mockGetForecastParameterUnitTranslationKey(...args),
}));

jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: (...args: any[]) => mockTrackMatomoEvent(...args),
}));

jest.mock('@components/common/AppText', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{children}</Text>;
  },
}));

jest.mock('@components/common/IconButton', () => ({
  __esModule: true,
  default: ({ testID, icon, onPress, accessibilityLabel }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}>
        <Text>{icon}</Text>
      </Pressable>
    );
  },
}));

jest.mock('@components/common/AccessibleTouchableOpacity', () => ({
  __esModule: true,
  default: ({ children, onPress, ...props }: any) => {
    const { Pressable } = require('react-native');
    return <Pressable onPress={onPress} {...props}>{children}</Pressable>;
  },
}));

jest.mock('../../src/components/weather/forecast/NextHourForecastBar', () => ({
  __esModule: true,
  default: (props: any) => {
    mockNextHourForecastBar(props);
    const { Text } = require('react-native');
    return <Text testID="next-hour-bar">{props.wide ? 'wide' : 'narrow'}</Text>;
  },
}));

jest.mock('../../src/components/weather/NextHoursForecast', () => ({
  __esModule: true,
  default: (props: any) => {
    mockNextHoursForecast(props);
    const { Text } = require('react-native');
    return <Text testID="next-hours">{props.currentHour}</Text>;
  },
}));

const forecast = {
  epochtime: 2000000000,
  smartSymbol: 101,
  temperature: 5,
  sunrise: '2033-05-18T03:00:00',
  sunset: '2033-05-18T21:00:00',
  sunsetToday: 1,
  totalCloudCover: 40,
};

describe('NextHourForecastPanelWithWeatherBackground', () => {
  beforeEach(() => {
    mockConfigGet.mockReset();
    mockConverter.mockReset();
    mockFormatAccessibleTemperature.mockReset();
    mockGetForecastParameterUnitTranslationKey.mockReset();
    mockGetGeolocation.mockClear();
    mockNavigate.mockClear();
    mockNextHourForecastBar.mockClear();
    mockNextHoursForecast.mockClear();
    mockSetCurrentLocation.mockClear();
    mockToPrecision.mockReset();
    mockTrackMatomoEvent.mockClear();
    mockWindowDimensions = {
      width: 390,
      height: 800,
      fontScale: 1,
      scale: 1,
    };

    mockConfigGet.mockReturnValue({
      units: {
        temperature: 'C',
      },
    });
    mockConverter.mockImplementation((_unit: string, value: number) => value);
    mockToPrecision.mockImplementation(
      (_type: string, _unit: string, value: number) => `${value}`
    );
    mockGetForecastParameterUnitTranslationKey.mockImplementation(
      (unit: string) => unit
    );
    mockFormatAccessibleTemperature.mockImplementation((value: string) => value);
  });

  it('renders loading indicator when forecast is missing', () => {
    const view = render(
      <NextHourForecastPanelWithWeatherBackground
        loading
        nextHourForecast={undefined as any}
        timezone="Europe/Helsinki"
        units={{} as any}
        location={{ name: 'Helsinki', area: 'Uusimaa' } as any}
        setCurrentLocation={mockSetCurrentLocation as any}
        isAuroraBorealisLikely={false}
        currentHour={12}
      />
    );

    expect(view.getByA11yLabel('weather:loading')).toBeTruthy();
  });

  it('renders weather background panel, child forecasts and navigation actions', () => {
    const view = render(
      <NextHourForecastPanelWithWeatherBackground
        loading={false}
        nextHourForecast={forecast as any}
        timezone="Europe/Helsinki"
        units={{ temperature: { unitAbb: 'C' } } as any}
        location={{ name: 'Helsinki', area: 'Uusimaa' } as any}
        setCurrentLocation={mockSetCurrentLocation as any}
        isAuroraBorealisLikely
        currentHour={13}
      />
    );

    expect(view.getByText('Helsinki, Uusimaa')).toBeTruthy();
    expect(view.getByText('symbols:101')).toBeTruthy();
    expect(view.getByText('5')).toBeTruthy();
    expect(view.getByText('°C')).toBeTruthy();
    expect(view.getByTestId('next-hour-bar')).toBeTruthy();
    expect(view.getByTestId('next-hours')).toBeTruthy();
    expect(mockNextHourForecastBar).toHaveBeenCalledWith(
      expect.objectContaining({
        forecast,
        wide: false,
      })
    );
    expect(mockNextHoursForecast).toHaveBeenCalledWith(
      expect.objectContaining({
        currentHour: 13,
      })
    );

    const background = view.UNSAFE_getByType(ImageBackground);
    expect(background.props.source).toEqual({
      testBackground: 'aurora-narrow',
    });

    fireEvent.press(view.getByTestId('locate_button'));
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Weather',
      'Geolocation'
    );
    expect(mockGetGeolocation).toHaveBeenCalledWith(
      mockSetCurrentLocation,
      expect.any(Function)
    );

    fireEvent.press(view.getByLabelText('Helsinki, Uusimaa, navigation:search'));
    fireEvent.press(view.getByTestId('search_button'));
    expect(mockNavigate).toHaveBeenCalledWith('Search');
    expect(mockNavigate).toHaveBeenCalledTimes(2);
  });

  it('uses wide background and passes wide flag on wide displays', () => {
    mockWindowDimensions = {
      width: 700,
      height: 900,
      fontScale: 1,
      scale: 1,
    };

    const view = render(
      <NextHourForecastPanelWithWeatherBackground
        loading={false}
        nextHourForecast={{ ...forecast, smartSymbol: 2, totalCloudCover: 90 } as any}
        timezone="Europe/Helsinki"
        units={{ temperature: { unitAbb: 'C' } } as any}
        location={{ name: 'Tampere', area: 'Tampere' } as any}
        setCurrentLocation={mockSetCurrentLocation as any}
        isAuroraBorealisLikely={false}
        currentHour={14}
      />
    );

    expect(view.getByText('Tampere')).toBeTruthy();
    expect(mockNextHourForecastBar).toHaveBeenCalledWith(
      expect.objectContaining({
        wide: true,
      })
    );
    expect(view.UNSAFE_getByType(ImageBackground).props.source).toEqual({
      testBackground: '2-wide',
    });
  });
});
