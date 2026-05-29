import React from 'react';
import { render } from '@testing-library/react-native';

import NextHourForecastPanel from '../../src/components/weather/NextHourForecastPanel';

const mockConfigGet = jest.fn();
const mockConverter = jest.fn();
const mockToPrecision = jest.fn();
const mockGetForecastParameterUnitTranslationKey = jest.fn();

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/forecast/selectors', () => ({
  selectLoading: jest.fn(),
  selectNextHourForecast: jest.fn(),
}));

jest.mock('@store/location/selector', () => ({
  selectTimeZone: jest.fn(),
}));

jest.mock('@store/settings/selectors', () => ({
  selectClockType: jest.fn(),
  selectUnits: jest.fn(),
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      hourListText: '#333333',
      primaryText: '#111111',
    },
    dark: false,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) =>
      options?.value ? `${key}:${options.value}` : key,
    i18n: { language: 'en' },
  }),
}));

jest.mock('@assets/images', () => ({
  weatherSymbolGetter: (symbol: string) => {
    const { Text } = require('react-native');
    return ({ width, height }: any) => (
      <Text testID={`weather-symbol-${symbol}`}>{`${width}-${height}`}</Text>
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

jest.mock('@utils/helpers', () => ({
  getFeelsLikeIconName: () => 'feels-like-cold',
  getWindDirection: () => 180,
}));

jest.mock('@utils/units', () => ({
  converter: (...args: any[]) => mockConverter(...args),
  toPrecision: (...args: any[]) => mockToPrecision(...args),
  getForecastParameterUnitTranslationKey: (...args: any[]) =>
    mockGetForecastParameterUnitTranslationKey(...args),
}));

const forecast = {
  epochtime: 2000000000,
  smartSymbol: 2,
  temperature: 5,
  feelsLike: 3,
  windSpeedMS: 4,
  windDirection: 90,
  windCompass8: 'N',
  precipitation1h: 1.25,
  uvCumulated: 3,
};

describe('NextHourForecastPanel', () => {
  beforeEach(() => {
    mockConfigGet.mockReset();
    mockConverter.mockReset();
    mockToPrecision.mockReset();
    mockGetForecastParameterUnitTranslationKey.mockReset();

    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'weather') {
        return {
          forecast: {
            data: [
              {
                parameters: [
                  'temperature',
                  'feelsLike',
                  'windSpeedMS',
                  'windDirection',
                  'precipitation1h',
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
          temperature: 'C',
          wind: 'm/s',
        },
      };
    });
    mockConverter.mockImplementation((_unit: string, value: number) => value);
    mockToPrecision.mockImplementation(
      (_type: string, _unit: string, value: number) => `${value}`
    );
    mockGetForecastParameterUnitTranslationKey.mockImplementation(
      (unit: string) => unit
    );
  });

  it('renders loading indicator when forecast is missing', () => {
    const view = render(
      <NextHourForecastPanel
        loading
        nextHourForecast={undefined as any}
        timezone="Europe/Helsinki"
        clockType={24 as any}
        units={{} as any}
        currentHour={12}
      />
    );

    expect(view.getByA11yLabel('weather:loading')).toBeTruthy();
  });

  it('renders next hour forecast values and accessibility labels', () => {
    const view = render(
      <NextHourForecastPanel
        loading={false}
        nextHourForecast={forecast as any}
        timezone="Europe/Helsinki"
        clockType={24 as any}
        units={{
          precipitation: { unitAbb: 'mm' },
          temperature: { unitAbb: 'C' },
          wind: { unitAbb: 'm/s' },
        } as any}
        currentHour={12}
      />
    );

    expect(view.getByText('nextHourForecast')).toBeTruthy();
    expect(view.getByTestId('weather-symbol-2')).toBeTruthy();
    expect(view.getByText('5')).toBeTruthy();
    expect(view.getAllByText(/unitAbbreviations:C/).length).toBeGreaterThan(0);
    expect(view.getByA11yLabel(/feelsLike 3/)).toBeTruthy();
    expect(view.getAllByText('3').length).toBeGreaterThan(0);
    expect(view.getByText('4')).toBeTruthy();
    expect(view.getByText(/1.25/)).toBeTruthy();
    expect(view.getByText(/UV/)).toBeTruthy();
    expect(view.getByTestId('icon-feels-like-cold')).toBeTruthy();
    expect(view.getByTestId('icon-wind-next-hour')).toBeTruthy();
    expect(
      view.getByA11yLabel(/observation:windDirection:N 4 forecast:m\/s/)
    ).toBeTruthy();
  });
});
