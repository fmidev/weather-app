import React from 'react';
import { ScrollView } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

import Chart from '@components/weather/charts/Chart';
import ChartYAxis from '@components/weather/charts/ChartYAxis';
import ChartDataRenderer from '@components/weather/charts/ChartDataRenderer';

jest.mock('react-redux', () => ({
  connect: () => (Component: React.ComponentType) => Component,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { parameter?: string }) =>
      options?.parameter ? `${key}:${options.parameter}` : key,
    i18n: { language: 'en' },
  }),
}));

jest.mock('@config', () => ({
  Config: { get: () => ({ observation: { timePeriod: 48 } }) },
}));

jest.mock('@utils/chart', () => ({
  chartTickValues: (data: unknown[]) => data.length ? [1000, 2000] : [],
  dailyChartTickValues: () => [1000, 2000],
}));

jest.mock('@components/weather/charts/data', () => ({
  limitUvForecast: (data: unknown[]) => data,
  prepareChartData: () => ({
    points: [{ x: 1000, temperature: 2 }],
    domain: { y: [0, 10] },
    precipitationMaximum: 0,
    precipitationValues: [null],
  }),
}));

jest.mock('@components/weather/charts/ChartDataRenderer', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: () => <View testID="chart-data-renderer" /> };
});

jest.mock('@components/weather/charts/ChartYAxis', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: () => <View /> };
});

jest.mock('@components/weather/charts/Legend', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: () => <View /> };
});

const baseProps = {
  clockType: 24 as const,
  preferredDailyParameters: [],
  units: undefined,
  data: [{ epochtime: 1, temperature: 2 }] as any,
  chartType: 'temperature' as const,
};

afterEach(() => jest.restoreAllMocks());

test('shares the larger axis title space and preserves the chart drawing height', () => {
  const view = render(<Chart {...baseProps} />);
  const axes = view.UNSAFE_getAllByType(ChartYAxis);
  const initial = view.UNSAFE_getByType(ChartDataRenderer).props;

  act(() => {
    axes[0].props.onTopPaddingChange(40);
    axes[1].props.onTopPaddingChange(80);
  });

  const renderer = view.UNSAFE_getByType(ChartDataRenderer).props;
  expect(renderer.topPadding).toBe(80);
  expect(renderer.height - renderer.topPadding).toBe(initial.height - initial.topPadding);
  view.UNSAFE_getAllByType(ChartYAxis).forEach((axis) => {
    expect(axis.props.height).toBe(renderer.height);
  });

  act(() => axes[1].props.onTopPaddingChange(0));
  expect(view.UNSAFE_getByType(ChartDataRenderer).props.topPadding).toBe(40);
});

test('updates the active day after momentum scrolling and skips unchanged days', () => {
  const setActiveDayIndex = jest.fn();
  const view = render(
    <Chart
      {...baseProps}
      activeDayIndex={0}
      setActiveDayIndex={setActiveDayIndex}
      currentDayOffset={1}
    />
  );
  const scrollView = view.UNSAFE_getByType(ScrollView);

  fireEvent(scrollView, 'momentumScrollEnd', { nativeEvent: { contentOffset: { x: 0 } } });
  expect(setActiveDayIndex).not.toHaveBeenCalled();

  fireEvent(scrollView, 'momentumScrollEnd', { nativeEvent: { contentOffset: { x: 200 } } });
  expect(setActiveDayIndex).toHaveBeenCalledTimes(1);
  expect(setActiveDayIndex).toHaveBeenCalledWith(2);
});

test('scrolls to the selected day when the active day changes', () => {
  const scrollTo = jest.spyOn(ScrollView.prototype, 'scrollTo').mockImplementation(() => {});
  const view = render(
    <Chart {...baseProps} activeDayIndex={0} currentDayOffset={1} />
  );

  view.rerender(<Chart {...baseProps} activeDayIndex={2} currentDayOffset={1} />);

  expect(scrollTo).toHaveBeenCalledWith({ x: 200, animated: true });

  view.rerender(<Chart {...baseProps} activeDayIndex={0} currentDayOffset={1} />);
  expect(scrollTo).toHaveBeenLastCalledWith({ x: 0, animated: true });
});

test('scrolls observations to the latest value on layout', () => {
  const scrollToEnd = jest.spyOn(ScrollView.prototype, 'scrollToEnd').mockImplementation(() => {});
  const observation = render(<Chart {...baseProps} observation />);

  fireEvent(observation.UNSAFE_getByType(ScrollView), 'layout');
  expect(scrollToEnd).toHaveBeenCalledWith({ animated: false });

  scrollToEnd.mockClear();
  const forecast = render(<Chart {...baseProps} />);
  fireEvent(forecast.UNSAFE_getByType(ScrollView), 'layout');
  expect(scrollToEnd).not.toHaveBeenCalled();
});

test('provides forecast and observation accessibility text', () => {
  const forecast = render(<Chart {...baseProps} />);
  const forecastChart = forecast.getByTestId('chart_temperature');
  expect(forecastChart.props.accessibilityLabel).toBe(
    'charts.forecastAccessibilityLabel:charts.temperature'
  );
  expect(forecastChart.props.accessibilityHint).toBe('charts.forecastAccessibilityHint');

  const observation = render(<Chart {...baseProps} observation />);
  const observationChart = observation.getByTestId('chart_temperature');
  expect(observationChart.props.accessibilityLabel).toBe(
    'charts.observationAccessibilityLabel:charts.temperature'
  );
  expect(observationChart.props.accessibilityHint).toBe('charts.observationAccessibilityHint');
});

test('does not render a chart without time ticks', () => {
  const view = render(<Chart {...baseProps} data={[]} />);

  expect(view.toJSON()).toBeNull();
});
