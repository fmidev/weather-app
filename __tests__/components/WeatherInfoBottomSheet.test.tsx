import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import WeatherInfoBottomSheet from '../../src/components/weather/sheets/WeatherInfoBottomSheet';

const mockConfigGet = jest.fn();

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/forecast/selectors', () => ({
  selectUniqueSmartSymbols: jest.fn(),
}));

jest.mock('@store/settings/selectors', () => ({
  selectUnits: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      border: '#cccccc',
      hourListText: '#111111',
      primaryText: '#222222',
      rain: {
        1: '#cceeff',
        2: '#99ddff',
        3: '#66ccff',
        4: '#33bbff',
        5: '#00aaff',
        6: '#0088dd',
        7: '#0066bb',
        8: '#004499',
      },
    },
    dark: false,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) =>
      options?.unit ? `${key}:${options.unit}` : key,
  }),
}));

jest.mock('@components/common/AppText', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{children}</Text>;
  },
}));

jest.mock('@components/common/CloseButton', () => ({
  __esModule: true,
  default: ({ onPress, testID, accessibilityLabel }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}>
        <Text>close</Text>
      </Pressable>
    );
  },
}));

jest.mock('@components/common/AccessibleTouchableOpacity', () => ({
  __esModule: true,
  default: ({ children, onPress, ...props }: any) => {
    const { Pressable } = require('react-native');
    return (
      <Pressable onPress={onPress} {...props}>
        {children}
      </Pressable>
    );
  },
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: ({ name }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

jest.mock('@assets/images', () => {
  const ReactActual = require('react');
  const { Text } = require('react-native');
  const Symbol = ({ id }: any) => <Text testID={`symbol-${id}`}>{id}</Text>;
  const makeSymbol = (id: string) => ({
    day: (props: any) => ReactActual.createElement(Symbol, { ...props, id: `${id}-day` }),
    night: (props: any) =>
      ReactActual.createElement(Symbol, { ...props, id: `${id}-night` }),
  });

  return {
    symbolsLight: {
      1: makeSymbol('1'),
      2: makeSymbol('2'),
      3: makeSymbol('3'),
    },
    symbolsDark: {
      1: makeSymbol('1-dark'),
    },
    weatherSymbolKeyParser: (value: string) => value,
  };
});

jest.mock('@utils/hooks', () => ({
  useOrientation: () => false,
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

describe('WeatherInfoBottomSheet', () => {
  beforeEach(() => {
    mockConfigGet.mockReset();
    jest
      .spyOn(require('react-native'), 'useWindowDimensions')
      .mockReturnValue({ width: 390, height: 800, fontScale: 1, scale: 1 });

    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'weather') {
        return {
          forecast: {
            infoBottomSheet: { showAllSymbols: false },
            excludeDayLength: false,
            excludeDayDuration: false,
            excludePolarNightAndMidnightSun: false,
            data: [
              {
                parameters: [
                  'temperature',
                  'feelsLike',
                  'windSpeedMS',
                  'windDirection',
                  'precipitation1h',
                  'pop',
                  'dewPoint',
                  'humidity',
                  'pressure',
                  'uvCumulated',
                ],
              },
            ],
          },
        };
      }
      return {
        units: {
          precipitation: 'mm',
          pressure: 'hPa',
          temperature: 'C',
          wind: 'm/s',
        },
      };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders active forecast info sections and closes from close button', () => {
    const onClose = jest.fn();
    const view = render(
      <WeatherInfoBottomSheet
        uniqueSmartSymbols={[1]}
        units={{
          precipitation: { unitAbb: 'mm' },
          pressure: { unitAbb: 'hPa' },
          temperature: { unitAbb: 'C' },
          wind: { unitAbb: 'm/s' },
        } as any}
        onClose={onClose}
      />
    );

    expect(view.getByTestId('weather_info_bottom_sheet')).toBeTruthy();
    expect(
      view.getByText('weatherInfoBottomSheet.precipitationStripTitle')
    ).toBeTruthy();
    expect(
      view.getByText('weatherInfoBottomSheet.hourlyForecastInfoTitle')
    ).toBeTruthy();
    expect(
      view.getByText('weatherInfoBottomSheet.hourlyForecastedTemperature:unitAbbreviations:C')
    ).toBeTruthy();
    expect(
      view.getByText('weatherInfoBottomSheet.windSpeedAndDirection:unitAbbreviations:m/s')
    ).toBeTruthy();
    expect(view.getByText('weatherInfoBottomSheet.sunriseAndSunset')).toBeTruthy();
    expect(view.getByText('weatherInfoBottomSheet.timezone')).toBeTruthy();
    expect(view.getByText('symbols:1')).toBeTruthy();
    expect(view.queryByText('symbols:2')).toBeNull();

    fireEvent.press(view.getByTestId('weather_info_bottom_sheet_close_button'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('toggles symbol list between current and all symbols', () => {
    const view = render(
      <WeatherInfoBottomSheet
        uniqueSmartSymbols={[1]}
        units={{
          precipitation: { unitAbb: 'mm' },
          pressure: { unitAbb: 'hPa' },
          temperature: { unitAbb: 'C' },
          wind: { unitAbb: 'm/s' },
        } as any}
        onClose={jest.fn()}
      />
    );

    expect(view.queryByText('symbols:2')).toBeNull();

    fireEvent.press(view.getByText('weatherInfoBottomSheet.showRest (2)'));

    expect(view.getByText('symbols:2')).toBeTruthy();
    expect(view.getByText('symbols:3')).toBeTruthy();

    fireEvent.press(view.getByText('weatherInfoBottomSheet.showLess'));

    expect(view.queryByText('symbols:2')).toBeNull();
  });
});
