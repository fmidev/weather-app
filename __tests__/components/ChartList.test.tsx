import React from 'react';
import { render } from '@testing-library/react-native';

import ChartList from '../../src/components/weather/forecast/ChartList';

const mockConfigGet = jest.fn();
const mockChart = jest.fn();
const mockParameterSelector = jest.fn();

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/forecast/actions', () => ({
  updateChartParameter: jest.fn((value: any) => ({
    type: 'UPDATE_CHART_PARAMETER',
    payload: value,
  })),
}));

jest.mock('../../src/components/weather/charts/settings', () => ({
  forecastTypeParameters: {
    temperature: ['temperature'],
    wind: ['windSpeedMS'],
    precipitation: ['precipitation1h'],
    humidity: ['relativeHumidity'],
    pressure: ['pressure'],
    uv: ['uvCumulated'],
  },
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('../../src/components/weather/charts/Chart', () => ({
  __esModule: true,
  default: (props: any) => {
    mockChart(props);
    const { Text } = require('react-native');
    return <Text testID="forecast-chart-component">{props.chartType}</Text>;
  },
}));

jest.mock('../../src/components/weather/common/ParameterSelector', () => ({
  __esModule: true,
  default: (props: any) => {
    mockParameterSelector(props);
    const { Text } = require('react-native');
    return <Text testID="parameter-selector">{props.parameter}</Text>;
  },
}));

describe('ChartList', () => {
  beforeEach(() => {
    mockConfigGet.mockReset();
    mockChart.mockClear();
    mockParameterSelector.mockClear();

    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'weather') {
        return {
          forecast: {
            data: [
              {
                parameters: [
                  'temperature',
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
      return {};
    });
  });

  it('renders filtered parameter selector and chart', () => {
    const data = [{ epochtime: 1, temperature: 2, windSpeedMS: 3 }];

    const { getByTestId } = render(
      <ChartList
        data={data as any}
        chartParameter={null as any}
        updateChartParameter={jest.fn()}
        activeDayIndex={0}
        setActiveDayIndex={jest.fn()}
        currentDayOffset={0}
      />
    );

    expect(getByTestId('forecast_chart')).toBeTruthy();
    expect(getByTestId('parameter-selector')).toBeTruthy();
    expect(getByTestId('forecast-chart-component')).toBeTruthy();
    expect(mockParameterSelector.mock.calls[0][0].chartTypes).toEqual(
      expect.arrayContaining(['temperature', 'wind', 'precipitation'])
    );
  });
});
