import React from 'react';
import { ScrollView } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import Chart from '../../src/components/weather/charts/Chart';

const mockConfigGet = jest.fn();
const mockChartSettings = jest.fn();
const mockChartTickValues = jest.fn();
const mockDailyChartTickValues = jest.fn();
const mockChartXDomain = jest.fn();
const mockChartYDomain = jest.fn();
const mockSecondaryYDomainForWeatherChart = jest.fn();
const mockConverter = jest.fn();
const mockResolveUnitParameterName = jest.fn();

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) =>
      options?.parameter ? `${key}:${options.parameter}` : key,
    i18n: { language: 'en' },
  }),
}));

jest.mock('moment', () => {
  const actualMoment = jest.requireActual('moment');
  const wrappedMoment = (...args: any[]) => actualMoment(...args);
  Object.assign(wrappedMoment, actualMoment);
  wrappedMoment.locale = jest.fn();
  return wrappedMoment;
});

jest.mock('@utils/chart', () => ({
  chartTickValues: (...args: any[]) => mockChartTickValues(...args),
  dailyChartTickValues: (...args: any[]) => mockDailyChartTickValues(...args),
  chartXDomain: (...args: any[]) => mockChartXDomain(...args),
  chartYDomain: (...args: any[]) => mockChartYDomain(...args),
  secondaryYDomainForWeatherChart: (...args: any[]) =>
    mockSecondaryYDomainForWeatherChart(...args),
}));

jest.mock('@utils/units', () => ({
  converter: (...args: any[]) => mockConverter(...args),
  resolveUnitParameterName: (...args: any[]) => mockResolveUnitParameterName(...args),
}));

jest.mock('../../src/components/weather/charts/settings', () => ({
  __esModule: true,
  default: (...args: any[]) => mockChartSettings(...args),
}));

jest.mock('../../src/components/weather/charts/Legend', () => ({
  __esModule: true,
  default: (props: any) => {
    const { Text } = require('react-native');
    return <Text testID="chart-legend">{props.chartType}</Text>;
  },
}));

jest.mock('../../src/components/weather/charts/ChartDataRenderer', () => ({
  __esModule: true,
  default: (props: any) => {
    const { Text } = require('react-native');
    return <Text testID="chart-data-renderer">{props.chartType}</Text>;
  },
}));

jest.mock('../../src/components/weather/charts/ChartYAxis', () => ({
  __esModule: true,
  default: ({ right }: any) => {
    const { Text } = require('react-native');
    return <Text testID={right ? 'chart-y-axis-right' : 'chart-y-axis-left'}>{right ? 'right' : 'left'}</Text>;
  },
}));

describe('Chart container', () => {
  beforeEach(() => {
    mockConfigGet.mockReset();
    mockChartSettings.mockReset();
    mockChartTickValues.mockReset();
    mockDailyChartTickValues.mockReset();
    mockChartXDomain.mockReset();
    mockChartYDomain.mockReset();
    mockSecondaryYDomainForWeatherChart.mockReset();
    mockConverter.mockReset();
    mockResolveUnitParameterName.mockReset();

    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'settings') {
        return {
          units: {
            temperature: { unitAbb: 'c' },
            precipitation: { unitAbb: 'mm' },
          },
        };
      }
      if (key === 'weather') {
        return {
          observation: {
            timePeriod: 48,
          },
        };
      }
      return {};
    });
    mockChartSettings.mockReturnValue({
      Component: () => null,
      params: ['temperature', 'pop'],
    });
    mockChartTickValues.mockReturnValue([1, 2, 3]);
    mockDailyChartTickValues.mockReturnValue([10, 20, 30]);
    mockChartXDomain.mockReturnValue({ x: [1, 3] });
    mockChartYDomain.mockReturnValue({ y: [0, 10] });
    mockSecondaryYDomainForWeatherChart.mockReturnValue({ y: [0, 5] });
    mockConverter.mockImplementation((_unit: string, value: any) => value);
    mockResolveUnitParameterName.mockImplementation((param: string) => {
      if (param === 'temperature') return 'temperature';
      if (param === 'precipitation1h') return 'precipitation';
      return undefined;
    });
  });

  it('returns null when chart x-domain cannot be built', () => {
    mockChartXDomain.mockReturnValue({ x: [undefined, undefined] });

    const view = render(
      <Chart
        clockType={24 as any}
        preferredDailyParameters={[]}
        units={undefined as any}
        data={[] as any}
        chartType="temperature"
      />
    );

    expect(view.toJSON()).toBeNull();
  });

  it('renders chart container and child components with forecast accessibility text', () => {
    const data = [
      { epochtime: 1, temperature: 2, pop: null, precipitation1h: 1 },
      { epochtime: 2, temperature: 3, pop: null, precipitation1h: 2 },
    ];

    const { getByLabelText, getByTestId } = render(
      <Chart
        clockType={24 as any}
        preferredDailyParameters={[]}
        units={{ precipitation: { unitAbb: 'mm' } } as any}
        data={data as any}
        chartType="weather"
        observation={false}
      />
    );

    expect(getByTestId('chart_weather')).toBeTruthy();
    expect(getByLabelText('charts.forecastAccessibilityLabel:charts.weather')).toBeTruthy();
    expect(getByTestId('chart-y-axis-left')).toBeTruthy();
    expect(getByTestId('chart-y-axis-right')).toBeTruthy();
    expect(getByTestId('chart-data-renderer')).toBeTruthy();
    expect(getByTestId('chart-legend')).toBeTruthy();
  });

  it('updates active day index from momentum scroll', () => {
    const setActiveDayIndex = jest.fn();
    const data = Array.from({ length: 50 }, (_, index) => ({
      epochtime: index + 1,
      temperature: index,
      pop: null,
      precipitation1h: 0,
    }));

    const view = render(
      <Chart
        clockType={24 as any}
        preferredDailyParameters={[]}
        units={{ precipitation: { unitAbb: 'mm' } } as any}
        data={data as any}
        chartType="temperature"
        observation
        activeDayIndex={0}
        setActiveDayIndex={setActiveDayIndex}
        currentDayOffset={1}
      />
    );

    fireEvent(view.UNSAFE_getByType(ScrollView), 'momentumScrollEnd', {
      nativeEvent: {
        contentOffset: { x: 480 },
      },
    });

    expect(setActiveDayIndex).toHaveBeenCalled();
  });
});
