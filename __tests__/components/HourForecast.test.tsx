import React from 'react';
import { render } from '@testing-library/react-native';

import HourForecast from '../../src/components/weather/forecast/HourForecast';

const mockConverter = jest.fn();
const mockToPrecision = jest.fn();
const mockGetForecastParameterUnitTranslationKey = jest.fn();

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@config', () => ({
  Config: {
    get: () => ({
      units: {
        temperature: 'C',
      },
    }),
  },
}));

jest.mock('@store/settings/selectors', () => ({
  selectClockType: jest.fn(),
  selectUnits: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) =>
      options?.value ? `${key}:${options.value}` : key,
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

jest.mock('@utils/units', () => ({
  converter: (...args: any[]) => mockConverter(...args),
  toPrecision: (...args: any[]) => mockToPrecision(...args),
  getForecastParameterUnitTranslationKey: (...args: any[]) =>
    mockGetForecastParameterUnitTranslationKey(...args),
}));

jest.mock('@utils/helpers', () => ({
  formatAccessibleTemperature: (value: string) => value,
}));

describe('HourForecast', () => {
  beforeEach(() => {
    mockConverter.mockReset();
    mockToPrecision.mockReset();
    mockGetForecastParameterUnitTranslationKey.mockReset();

    mockConverter.mockImplementation((_unit: string, value: any) => value);
    mockToPrecision.mockImplementation((_type: string, _unit: string, value: any) => `${value}`);
    mockGetForecastParameterUnitTranslationKey.mockImplementation((value: string) => value);
  });

  it('renders hour forecast content and accessibility label', () => {
    const timeStep = {
      epochtime: 2000000000,
      temperature: 5,
      smartSymbol: 2,
    };

    const { getByA11yLabel, getByTestId, getByText } = render(
      <HourForecast
        clockType={24 as any}
        units={{ temperature: { unitAbb: 'C' } } as any}
        timeStep={timeStep as any}
      />
    );

    expect(getByTestId('weather-symbol-2')).toBeTruthy();
    expect(getByText(/5°C/)).toBeTruthy();
    expect(getByA11yLabel(/forecast:at/)).toBeTruthy();
  });
});
