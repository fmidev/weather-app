import React from 'react';
import { render } from '@testing-library/react-native';

import ChartDataRenderer from '../../src/components/weather/charts/ChartDataRenderer';
import ChartYAxis from '../../src/components/weather/charts/ChartYAxis';
import ChartLegend from '../../src/components/weather/charts/Legend';

const mockConfigGet = jest.fn();
const mockVictoryChart = jest.fn();
const mockVictoryAxis = jest.fn();
const mockVictoryLabel = jest.fn();
const mockTickFormat = jest.fn();
const mockChartYLabelText = jest.fn();
const mockCalculateTemperatureTickCount = jest.fn();
const mockUseSelector = jest.fn();

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      chartGridDay: '#111111',
      chartGrid: '#222222',
      hourListText: '#333333',
      secondaryBorder: '#444444',
      chartPrimaryLine: '#0055aa',
      chartSecondaryLine: '#ff6600',
      primaryText: '#111111',
      rain: {
        1: '#1111ff',
        2: '#2222ff',
        3: '#3333ff',
        4: '#4444ff',
        5: '#5555ff',
        6: '#6666ff',
        7: '#7777ff',
        8: '#8888ff',
      },
    },
  }),
}));

jest.mock('react-redux', () => ({
  useSelector: (...args: any[]) => mockUseSelector(...args),
}));

jest.mock('@utils/chart', () => ({
  tickFormat: (...args: any[]) => mockTickFormat(...args),
  chartYLabelText: (...args: any[]) => mockChartYLabelText(...args),
  calculateTemperatureTickCount: (...args: any[]) =>
    mockCalculateTemperatureTickCount(...args),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) =>
      options?.unit ? `${key}:${options.unit}` : key,
  }),
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: ({ name }: any) => {
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

jest.mock('victory-native', () => {
  const { View, Text } = require('react-native');

  return {
    VictoryChart: (props: any) => {
      mockVictoryChart(props);
      return <View testID="victory-chart">{props.children}</View>;
    },
    VictoryAxis: (props: any) => {
      mockVictoryAxis(props);
      return <Text testID={`victory-axis-${props.orientation || 'dependent'}`}>axis</Text>;
    },
    VictoryLabel: (props: any) => {
      mockVictoryLabel(props);
      return <Text testID="victory-label">label</Text>;
    },
  };
});

describe('weather chart infrastructure components', () => {
  beforeEach(() => {
    mockConfigGet.mockReset();
    mockVictoryChart.mockClear();
    mockVictoryAxis.mockClear();
    mockVictoryLabel.mockClear();
    mockTickFormat.mockReset();
    mockChartYLabelText.mockReset();
    mockCalculateTemperatureTickCount.mockReset();
    mockUseSelector.mockReset();

    mockConfigGet.mockImplementation((key: string) => {
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
      if (key === 'weather') {
        return {
          observation: {
            parameters: ['temperature', 'dewPoint', 'visibility', 'totalCloudCover', 'windSpeedMS', 'windGust', 'windDirection'],
          },
          forecast: {
            data: [
              {
                parameters: ['temperature', 'feelsLike', 'dewPoint', 'pop', 'windSpeedMS', 'hourlymaximumgust', 'windDirection'],
              },
            ],
          },
        };
      }
      return {};
    });
    mockTickFormat.mockImplementation((value: number) => `tick-${value}`);
    mockChartYLabelText.mockReturnValue(['weather:charts:temperature', 'weather:charts:precipitation']);
    mockCalculateTemperatureTickCount.mockReturnValue(7);
    mockUseSelector.mockReturnValue(['rrday', 'minimumGroundTemperature06']);
  });

  it('renders chart data renderer with hidden daily edge labels and precipitation axis ticks', () => {
    const Component = jest.fn(() => null);

    render(
      <ChartDataRenderer
        chartDimensions={{ x: 320, y: 240 }}
        tickValues={[1, 2, 3]}
        chartDomain={{ x: [1, 3], y: [0, 10] }}
        chartType="precipitation"
        chartValues={{ precipitation1h: [{ x: 1, y: 2 }] } as any}
        Component={Component}
        locale="en"
        clockType={24 as any}
        isDaily
      />
    );

    expect(mockVictoryChart).toHaveBeenCalled();
    expect(mockVictoryAxis.mock.calls[0][0].tickFormat).toEqual(['', 'tick-2', '']);
    expect(mockVictoryAxis.mock.calls[1][0].tickValues).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
    expect(Component).toHaveBeenCalled();
    expect(Component.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        chartWidth: 320,
      })
    );
  });

  it('returns null for right y-axis when secondary axis should not be shown', () => {
    const view = render(
      <ChartYAxis
        chartType="temperature"
        chartDimensions={{ x: 320, y: 240 }}
        chartDomain={{ x: [1, 2], y: [0, 10] }}
        observation={false}
        right
      />
    );

    expect(view.toJSON()).toBeNull();
  });

  it('configures y-axis label and precipitation tick formatting', () => {
    render(
      <ChartYAxis
        chartType="precipitation"
        chartDimensions={{ x: 320, y: 240 }}
        chartDomain={{ x: [1, 2], y: [0, 10] }}
        chartMinMax={[1, 3, 4]}
        observation={false}
        right
        units={{ precipitation: { unitAbb: 'in' } } as any}
      />
    );

    const axisProps = mockVictoryAxis.mock.calls[0][0];
    expect(axisProps.tickValues).toEqual([0, 0.05, 0.1, 0.15, 0.2, 0.25]);
    expect(axisProps.tickFormat(0.05)).toBe(20);
  });

  it('uses weather tick count calculation for left weather axis', () => {
    render(
      <ChartYAxis
        chartType="weather"
        chartDimensions={{ x: 320, y: 240 }}
        chartDomain={{ x: [1, 2], y: [-5, 10] }}
        observation={false}
      />
    );

    expect(mockCalculateTemperatureTickCount).toHaveBeenCalledWith({
      x: [1, 2],
      y: [-5, 10],
    });
    expect(mockVictoryAxis.mock.calls[0][0].tickCount).toBe(7);
  });

  it('renders temperature and daily legend content from available parameters', () => {
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

  it('renders precipitation and wind legends with optional secondary parameter', () => {
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
