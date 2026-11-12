import React from 'react';
import { render } from '@testing-library/react-native';

import ChartLegend from '@components/weather/charts/Legend';

jest.mock('@config', () => ({
  Config: {
    get: (key: string) => {
      if (key === 'settings') {
        return {
          units: {
            precipitation: 'mm',
            temperature: 'c',
            wind: 'ms',
            pressure: 'hpa',
          },
        };
      }
      return {
        observation: {
          parameters: [
            'temperature', 'dewPoint', 'visibility', 'totalCloudCover',
            'windSpeedMS', 'windGust', 'windDirection',
          ],
        },
        forecast: {
          data: [{
            parameters: [
              'temperature', 'feelsLike', 'dewPoint', 'pop',
              'windSpeedMS', 'hourlymaximumgust', 'windDirection',
            ],
          }],
        },
      };
    },
  },
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      chartPrimaryLine: '#0055aa',
      chartSecondaryLine: '#ff6600',
      hourListText: '#333333',
      primaryText: '#111111',
      secondaryBorder: '#444444',
      rain: {
        1: '#1111ff', 2: '#2222ff', 3: '#3333ff', 4: '#4444ff',
        5: '#5555ff', 6: '#6666ff', 7: '#7777ff', 8: '#8888ff',
      },
    },
  }),
}));

jest.mock('react-redux', () => ({
  useSelector: () => ['rrday', 'minimumGroundTemperature06'],
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { unit?: string }) =>
      options?.unit ? `${key}:${options.unit}` : key,
  }),
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: ({ name }: { name: string }) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

jest.mock('@components/common/AppText', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{children}</Text>;
  },
}));

describe('WeatherCharts Legend', () => {
  it('renders temperature and daily entries from available parameters', () => {
    const { getByText } = render(
      <>
        <ChartLegend chartType="temperature" observation={false} />
        <ChartLegend chartType="daily" observation={false} />
      </>
    );

    expect(getByText(/weather:charts:temperature/i)).toBeTruthy();
    expect(getByText(/weather:charts:feelslike/i)).toBeTruthy();
    expect(getByText(/weather:charts:dewpoint/i)).toBeTruthy();
    expect(getByText(/weather:charts:zeroline/i)).toBeTruthy();
    expect(getByText('weather:charts:rrday')).toBeTruthy();
    expect(getByText('weather:charts:minimumGroundTemperature06')).toBeTruthy();
  });

  it('shows precipitation and wind entries when their parameters are available', () => {
    const { getByText } = render(
      <>
        <ChartLegend chartType="precipitation" observation={false} />
        <ChartLegend chartType="wind" observation={false} />
      </>
    );

    expect(getByText(/weather:charts:precipitationlight/i)).toBeTruthy();
    expect(getByText(/weather:charts:pop/i)).toBeTruthy();
    expect(getByText(/weather:charts:windspeed/i)).toBeTruthy();
    expect(getByText(/weather:charts:windgust/i)).toBeTruthy();
    expect(getByText(/weather:charts:winddirection/i)).toBeTruthy();

    const missingSecondary = render(
      <ChartLegend
        chartType="precipitation"
        observation={false}
        secondaryParameterMissing
      />
    );

    expect(missingSecondary.queryByText(/weather:charts:pop/i)).toBeNull();
  });
});
