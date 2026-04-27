import React from 'react';
import { render } from '@testing-library/react-native';

import Latest from '../../src/components/weather/observation/Latest';

const mockConfigGet = jest.fn();
const mockLatestObservation = jest.fn();

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      hourListText: '#111111',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
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

jest.mock('../../src/components/weather/InfoMessage', () => ({
  __esModule: true,
  default: ({ translationKey }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`info-${translationKey}`}>{translationKey}</Text>;
  },
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('@utils/chart', () => ({
  capitalize: (value: string) => value.charAt(0).toUpperCase() + value.slice(1),
}));

jest.mock('@utils/helpers', () => ({
  getLatestObservationAvoidingMissingValues: (...args: any[]) =>
    mockLatestObservation(...args),
  formatAccessibleDateTime: () => 'accessible observation time',
  getParameterUnit: (parameter: string) => {
    const units: Record<string, string> = {
      humidity: '%',
      precipitationIntensity: 'mm',
      pressure: 'hPa',
      temperature: '°C',
      totalCloudCover: '/8',
      visibility: 'km',
      windDirection: '°',
    };
    return units[parameter] || '';
  },
  getObservationCellValue: (
    timeStep: any,
    parameter: string,
    _unit: string,
    decimals: number | undefined,
    divider: number | undefined,
    _daily: boolean,
    decimalSeparator?: string
  ) => {
    const precision = decimals ?? 1;
    const divisor = divider ?? 1;
    const separator = decimalSeparator ?? '.';
    const value = timeStep[parameter];
    if (value === null || value === undefined) return '-';
    if (typeof value !== 'number') return value;
    return (value / divisor).toFixed(precision).replace('.', separator);
  },
}));

describe('Observation Latest', () => {
  beforeEach(() => {
    mockConfigGet.mockReset();
    mockLatestObservation.mockReset();
    jest.spyOn(Date, 'now').mockReturnValue(2000005200 * 1000);

    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'weather') {
        return {
          observation: {
            parameters: [
              'temperature',
              'windDirection',
              'totalCloudCover',
              'ri_10min',
            ],
          },
        };
      }
      return {};
    });
    mockLatestObservation.mockImplementation((data: any[]) => data[0]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders latest observation time and available measurements', () => {
    const data = [
      {
        epochtime: 2000000000,
        temperature: 5.55,
        windDirection: 180,
        windCompass8: 'S',
        totalCloudCover: 5,
        ri_10min: 0.24,
      },
    ];

    const view = render(
      <Latest
        clockType={24 as any}
        data={data as any}
        dailyData={[]}
        units={{
          precipitation: { unitPrecision: 1 },
          pressure: { unitPrecision: 0 },
        } as any}
      />
    );

    expect(view.getByText('latestObservation')).toBeTruthy();
    expect(view.getByA11yLabel('accessible observation time')).toBeTruthy();
    expect(view.getByText('measurements.temperature')).toBeTruthy();
    expect(view.getByText('5.5 °C')).toBeTruthy();
    expect(view.getByText(/windDirection.S/)).toBeTruthy();
    expect(view.getByText(/cloudcover.5/)).toBeTruthy();
    expect(view.getByText('0.2 mm')).toBeTruthy();
  });

  it('renders info messages for old observations and daily-only observations', () => {
    mockLatestObservation.mockReturnValue({
      epochtime: 1999980000,
      temperature: 4,
    });

    const oldObservation = render(
      <Latest
        clockType={24 as any}
        data={[{ epochtime: 1999980000, temperature: 4 }] as any}
        dailyData={[]}
        units={{
          precipitation: { unitPrecision: 1 },
          pressure: { unitPrecision: 0 },
        } as any}
      />
    );

    expect(oldObservation.getByTestId('info-tooOld')).toBeTruthy();
    expect(oldObservation.queryByText('latestObservation')).toBeNull();

    mockLatestObservation.mockReturnValue({
      epochtime: 2000000000,
      temperature: 4,
    });

    const dailyOnly = render(
      <Latest
        clockType={24 as any}
        data={[{ epochtime: 2000000000, temperature: 4 }] as any}
        dailyData={[{ epochtime: 2000000000, rrday: 1 }] as any}
        units={{
          precipitation: { unitPrecision: 1 },
          pressure: { unitPrecision: 0 },
        } as any}
      />
    );

    expect(dailyOnly.getByTestId('info-onlyDailyValues')).toBeTruthy();
  });

  it('returns null when no usable latest observation is available', () => {
    mockLatestObservation.mockReturnValue(undefined);

    const view = render(
      <Latest
        clockType={24 as any}
        data={[]}
        dailyData={[]}
        units={{
          precipitation: { unitPrecision: 1 },
          pressure: { unitPrecision: 0 },
        } as any}
      />
    );

    expect(view.toJSON()).toBeNull();
  });
});
