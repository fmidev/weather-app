import React from 'react';
import { render } from '@testing-library/react-native';

import NextHourForecastBar from '../../src/components/weather/forecast/NextHourForecastBar';

const mockConfigGet = jest.fn();
const mockConverter = jest.fn();
const mockToPrecision = jest.fn();
const mockGetForecastParameterUnitTranslationKey = jest.fn();

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
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

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (key === 'forecast:precipitationMissing') return 'Missing precipitation';
      if (options?.value) return `${key}:${options.value}`;
      return key;
    },
    i18n: { language: 'en' },
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    dark: false,
  }),
}));

jest.mock('@utils/helpers', () => ({
  getFeelsLikeIconName: () => 'feels-like',
  getWindDirection: () => 180,
}));

jest.mock('@utils/units', () => ({
  converter: (...args: any[]) => mockConverter(...args),
  toPrecision: (...args: any[]) => mockToPrecision(...args),
  getForecastParameterUnitTranslationKey: (...args: any[]) =>
    mockGetForecastParameterUnitTranslationKey(...args),
}));

jest.mock('@components/common/ScalableIcon', () => ({
  __esModule: true,
  default: ({ name }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

describe('NextHourForecastBar', () => {
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
                  'windSpeedMS',
                  'windDirection',
                  'precipitation1h',
                  'uvCumulated',
                  'feelsLike',
                ],
              },
            ],
          },
        };
      }
      if (key === 'settings') {
        return {
          units: {
            temperature: 'C',
            wind: 'm/s',
            precipitation: 'mm',
          },
        };
      }
      return {};
    });

    mockConverter.mockImplementation((_unit: string, value: any) => value);
    mockToPrecision.mockImplementation((_type: string, _unit: string, value: any) => `${value}`);
    mockGetForecastParameterUnitTranslationKey.mockImplementation((value: string) => value);
  });

  it('renders next hour values', () => {
    const forecast = {
      epochtime: 2000000000,
      windCompass8: 'n',
      windDirection: 90,
      windSpeedMS: 4,
      precipitation1h: 1.2,
      uvCumulated: 3,
      feelsLike: 2,
    };

    const { getByA11yLabel, getByTestId, getByText } = render(
      <NextHourForecastBar
        forecast={forecast as any}
        wide
        units={{
          temperature: { unitAbb: 'C' },
          wind: { unitAbb: 'm/s' },
          precipitation: { unitAbb: 'mm' },
        } as any}
        location={{} as any}
        setCurrentLocation={jest.fn()}
      />
    );

    expect(getByText('4')).toBeTruthy();
    expect(getByA11yLabel(/forecast:precipitation/)).toBeTruthy();
    expect(getByText(/UV/)).toBeTruthy();
    expect(getByTestId('icon-feels-like')).toBeTruthy();
  });
});
