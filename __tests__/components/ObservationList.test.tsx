import React from 'react';
import { render } from '@testing-library/react-native';

import ObservationList from '../../src/components/weather/observation/List';

const mockConfigGet = jest.fn();
const mockDailyObservationRow = jest.fn();

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      border: '#cccccc',
      hourListText: '#111111',
      timeStepBackground: '#eeeeee',
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

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: ({ name, accessibilityLabel }: any) => {
    const { Text } = require('react-native');
    return (
      <Text testID={`icon-${name}`} accessibilityLabel={accessibilityLabel}>
        {name}
      </Text>
    );
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

jest.mock('@utils/units', () => ({
  getForecastParameterUnitTranslationKey: (unit: string) => unit,
}));

jest.mock('@utils/helpers', () => ({
  getWindDirection: (value: number) => value,
  getParameterUnit: (parameter: string) => {
    const units: Record<string, string> = {
      dewPoint: '°C',
      maximumTemperature: '°C',
      minimumGroundTemperature06: '°C',
      minimumTemperature: '°C',
      precipitation1h: 'mm',
      pressure: 'hPa',
      rrday: 'mm',
      temperature: '°C',
      totalCloudCover: '/8',
      windGust: 'm/s',
      windSpeedMS: 'm/s',
    };
    return units[parameter] || '';
  },
  getObservationCellValue: (
    timeStep: any,
    parameter: string,
    _unit: string,
    precision: number | undefined,
    divider: number | undefined,
    _daily: boolean,
    decimalSeparator?: string
  ) => {
    const decimals = precision ?? 1;
    const value = timeStep[parameter];
    if (value === null || value === undefined) return '-';
    if (typeof value !== 'number') return value;
    const divisor = divider || 1;
    return (value / divisor)
      .toFixed(decimals)
      .replace('.', decimalSeparator ?? '.');
  },
}));

jest.mock('../../src/components/weather/observation/DailyObservationRow', () => ({
  __esModule: true,
  default: (props: any) => {
    mockDailyObservationRow(props);
    const { Text } = require('react-native');
    return (
      <Text testID={`daily-row-${props.epochtime}`}>
        {`${props.parameter}-${props.data.length}`}
      </Text>
    );
  },
}));

describe('Observation List', () => {
  beforeEach(() => {
    mockConfigGet.mockReset();
    mockDailyObservationRow.mockClear();

    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'weather') {
        return {
          observation: {
            parameters: [
              'temperature',
              'dewPoint',
              'windSpeedMS',
              'windGust',
              'windDirection',
              'totalCloudCover',
            ],
            dailyParameters: [
              'rrday',
              'maximumTemperature',
              'minimumTemperature',
              'minimumGroundTemperature06',
              'snowDepth06',
            ],
          },
        };
      }
      if (key === 'settings') {
        return {
          units: {
            wind: 'm/s',
          },
        };
      }
      return {};
    });
  });

  it('renders temperature headers, current day and hourly rows', () => {
    const view = render(
      <ObservationList
        clockType={24 as any}
        parameter="temperature"
        preferredDailyParameters={[]}
        units={{} as any}
        data={[
          {
            epochtime: 2000001600,
            temperature: 5.2,
            dewPoint: 1.1,
          },
          {
            epochtime: 2000005200,
            temperature: 6.8,
            dewPoint: 2.3,
          },
        ] as any}
      />
    );

    expect(view.getByTestId('observation_list_header_temperature')).toBeTruthy();
    expect(view.getByText('time')).toBeTruthy();
    expect(view.getByText('measurements.temperature °C')).toBeTruthy();
    expect(view.getByText('measurements.dewPoint °C')).toBeTruthy();
    expect(view.getByText('5.2')).toBeTruthy();
    expect(view.getByText('1.1')).toBeTruthy();
    expect(view.getAllByA11yLabel(/forecast:at/)).toHaveLength(2);
  });

  it('renders wind values, gust and direction icon', () => {
    const view = render(
      <ObservationList
        clockType={24 as any}
        parameter="wind"
        preferredDailyParameters={[]}
        units={{} as any}
        data={[
          {
            epochtime: 2000001600,
            windSpeedMS: 4,
            windGust: 9,
            windDirection: 180,
            windCompass8: 'S',
          },
        ] as any}
      />
    );

    expect(view.getByText('measurements.windSpeedMS m/s')).toBeTruthy();
    expect(view.getByText('measurements.windGust m/s')).toBeTruthy();
    expect(view.getByText('4.0')).toBeTruthy();
    expect(view.getByText('9.0')).toBeTruthy();
    expect(view.getByTestId('icon-wind-arrow')).toBeTruthy();
    expect(view.getByA11yLabel('windDirection.S.')).toBeTruthy();
  });

  it('renders daily rows once per day for daily parameters', () => {
    const view = render(
      <ObservationList
        clockType={24 as any}
        parameter="daily"
        preferredDailyParameters={['daily']}
        units={{} as any}
        data={[
          { epochtime: 2000001600, rrday: 1 },
          { epochtime: 2000005200, rrday: 2 },
          { epochtime: 2000088000, rrday: 3 },
        ] as any}
      />
    );

    expect(view.getByTestId('observation_list_header_daily')).toBeTruthy();
    expect(view.queryByText('time')).toBeNull();
    expect(view.getAllByText('daily-3')).toHaveLength(2);
    expect(mockDailyObservationRow).toHaveBeenCalledTimes(2);
  });
});
