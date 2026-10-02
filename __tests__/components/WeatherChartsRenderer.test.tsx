import React from 'react';
import { render } from '@testing-library/react-native';
import moment from 'moment';

import ChartDataRenderer from '@components/weather/charts/ChartDataRenderer';
import { prepareChartData } from '@components/weather/charts/data';
import { ChartData, ChartKey, ChartPoint, ChartType } from '@components/weather/charts/types';

const mockCartesianChart = jest.fn();
const mockLine = jest.fn();
const mockPath = jest.fn();
const mockRect = jest.fn();
let mockUseCardinalsForWindDirection = false;

jest.mock('../../src/assets/fonts/Roboto-Regular.ttf', () => 1);
jest.mock('../../src/assets/fonts/Roboto-Bold.ttf', () => 2);

jest.mock('@config', () => ({
  Config: { get: () => ({
    units: { temperature: 'C', precipitation: 'mm', wind: 'm/s', pressure: 'hPa' },
    useCardinalsForWindDirection: mockUseCardinalsForWindDirection,
  }) },
}));

beforeEach(() => {
  mockUseCardinalsForWindDirection = false;
});

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      chartGrid: '#ddd',
      chartGridDay: '#bbb',
      hourListText: '#111',
      chartPrimaryLine: '#00f',
      chartSecondaryLine: '#f00',
      secondaryBorder: '#999',
      primaryText: '#111',
      rain: Array.from({ length: 9 }, (_, level) => `rain-${level}`),
    },
  }),
}));

jest.mock('@components/common/MacContentSizeContext', () => ({
  useIsRunningOnMac: () => false,
}));

jest.mock('@shopify/react-native-skia', () => {
  const { View } = require('react-native');
  const shape = () => <View />;
  return {
    useFont: (asset: number) => ({
      asset,
      getSize: () => 14,
      getGlyphIDs: (label: string) => Array.from(label),
      getGlyphWidths: (glyphs: string[]) => glyphs.map(() => 7),
    }),
    DashPathEffect: shape,
    Path: (props: any) => {
      mockPath(props);
      return <View />;
    },
    Rect: (props: any) => {
      mockRect(props);
      return <View />;
    },
    Text: shape,
    Skia: {
      PathBuilder: {
        Make: () => {
          const commands: Array<{ type: string; x?: number; y?: number }> = [];
          return {
            moveTo: (x: number, y: number) => { commands.push({ type: 'moveTo', x, y }); },
            lineTo: (x: number, y: number) => { commands.push({ type: 'lineTo', x, y }); },
            close: () => { commands.push({ type: 'close' }); },
            build: () => ({ commands }),
          };
        },
      },
    },
  };
});

jest.mock('victory-native', () => {
  const { View } = require('react-native');
  return {
    CartesianChart: (props: any) => {
      mockCartesianChart(props);
      const sortedData = [...props.data].sort((a: any, b: any) => a.x - b.x);
      const points = Object.fromEntries(props.yKeys.map((key: string) => [
        key,
        sortedData.map((item: any, index: number) => ({
          x: index * 10, xValue: item.x, y: item[key] == null ? null : 90 - item[key],
          yValue: item[key],
        })),
      ]));
      const chartArgs = {
        points,
        chartBounds: { left: 0, right: 200, top: 20, bottom: 100 },
        yScale: (value: number) => 90 - value,
        xScale: (value: number) => value / 100,
      };
      return (
        <View testID="xl-chart">
          {props.children(chartArgs)}
          {props.renderOutside?.(chartArgs)}
        </View>
      );
    },
    Line: (props: any) => {
      mockLine(props);
      return <View testID="xl-line">{props.children}</View>;
    },
    Bar: () => <View />,
    Scatter: () => <View />,
  };
});

test('renders temperature data through CartesianChart and Line', () => {
  const { getByTestId } = render(
    <ChartDataRenderer
      data={[{ x: 1000, temperature: 4, dewPoint: null }]}
      chartType="temperature"
      domain={{ x: [1000, 2000], y: [0, 10] }}
      tickValues={[1000, 2000]}
      width={300}
      topPadding={80}
      height={360}
      locale="en"
      clockType={24}
      isDaily={false}
      observation={false}
      precipitationValues={[null]}
    />
  );

  expect(getByTestId('xl-chart')).toBeTruthy();
  expect(mockCartesianChart.mock.calls[0][0]).toEqual(expect.objectContaining({
    xKey: 'x',
    yKeys: ['temperature', 'feelsLike', 'dewPoint'],
    padding: expect.objectContaining({ top: 80 }),
  }));
  expect(mockLine).toHaveBeenCalledTimes(1);
});

test('uses zero-aligned temperature ticks for the grid', () => {
  mockCartesianChart.mockClear();
  render(
    <ChartDataRenderer
      data={[{ x: 1000, temperature: 4 }]}
      chartType="temperature"
      domain={{ x: [1000, 2000], y: [-5, 15] }}
      tickValues={[1000, 2000]}
      width={300}
      locale="fi"
      clockType={24}
      isDaily={false}
      observation={false}
      precipitationValues={[null]}
    />
  );

  const { tickValues, tickCount } = mockCartesianChart.mock.calls[0][0].yAxis[0];
  expect(tickValues).toEqual([-5, 0, 5, 10, 15]);
  expect(tickCount).toBe(tickValues.length);
});

test('uses five-hPa ticks in pressure observation charts', () => {
  mockCartesianChart.mockClear();
  mockLine.mockClear();
  const { getAllByTestId } = render(
    <ChartDataRenderer
      data={[{ x: 1000, pressure: 1010 }]}
      chartType="pressure"
      domain={{ x: [1000, 2000], y: [1005, 1015] }}
      tickValues={[1000, 2000]}
      width={300}
      locale="fi"
      clockType={24}
      isDaily={false}
      observation
      precipitationValues={[null]}
    />
  );

  expect(mockCartesianChart.mock.calls[0][0].yAxis[0].tickValues).toEqual([1005, 1010, 1015]);
  expect(getAllByTestId('xl-line')).toHaveLength(1);
  expect(mockLine).toHaveBeenCalledTimes(1);
  expect(mockLine.mock.calls[0][0]).toEqual(expect.objectContaining({
    color: '#00f',
    points: [expect.objectContaining({ xValue: 1000, yValue: 1010, y: expect.any(Number) })],
  }));
});

test.each<{
  name: string;
  chartType: ChartType;
  parameter: ChartKey;
  values: Array<number | null>;
  otherValues?: Partial<ChartPoint>;
  domain: [number, number];
  observation: boolean;
  color: string;
}>([
  {
    name: 'observation humidity in preference to relative humidity',
    chartType: 'humidity', parameter: 'humidity', values: [80, null, 0],
    otherValues: { relativeHumidity: 95 }, domain: [0, 100], observation: true, color: '#00f',
  },
  {
    name: 'forecast relative humidity when humidity is missing',
    chartType: 'humidity', parameter: 'relativeHumidity', values: [70, null, 0],
    otherValues: { humidity: null }, domain: [0, 100], observation: false, color: '#00f',
  },
  {
    name: 'observation cloud height',
    chartType: 'cloud', parameter: 'cloudHeight', values: [1500, null, 0],
    domain: [0, 2000], observation: true, color: '#111',
  },
  {
    name: 'forecast UV index',
    chartType: 'uv', parameter: 'uvCumulated', values: [3, null, 0],
    domain: [0, 10], observation: false, color: '#00f',
  },
  {
    name: 'forecast pressure',
    chartType: 'pressure', parameter: 'pressure', values: [1010, null, 1005],
    domain: [1000, 1020], observation: false, color: '#00f',
  },
])('renders $name as a line with the correct values and missing-data gaps', ({
  chartType, parameter, values, otherValues, domain, observation, color,
}) => {
  mockLine.mockClear();
  const ticks = [1000, 2000, 3000];
  const { getAllByTestId } = render(
    <ChartDataRenderer
      data={values.map((value, index) => ({
        x: ticks[index], ...otherValues, [parameter]: value,
      }))}
      chartType={chartType}
      domain={{ x: [ticks[0], ticks[2]], y: domain }}
      tickValues={ticks}
      width={300}
      locale="fi"
      clockType={24}
      isDaily={false}
      observation={observation}
      precipitationValues={values.map(() => null)}
    />
  );

  expect(getAllByTestId('xl-line')).toHaveLength(1);
  expect(mockLine).toHaveBeenCalledTimes(1);
  const lineProps = mockLine.mock.calls[0][0];
  expect(lineProps.color).toBe(color);
  expect(lineProps.points.map(({ xValue }: { xValue: number }) => xValue)).toEqual(ticks);
  expect(lineProps.points.map(({ yValue }: { yValue: number | null }) => yValue)).toEqual(values);
  expect(lineProps.points[0].y).toEqual(expect.any(Number));
  expect(lineProps.points[1].y).toBeNull();
  expect(lineProps.points[2].y).toEqual(expect.any(Number));
});

test('draws smaller wind arrows above the plot and uses five-unit wind ticks', () => {
  mockCartesianChart.mockClear();
  mockPath.mockClear();
  const time = moment('2026-10-01 12:00').valueOf();
  render(
    <ChartDataRenderer
      data={[{ x: time, windSpeedMS: 4, windGust: 7, windDirection: 0 }]}
      chartType="wind"
      domain={{ x: [time, time + 3600000], y: [0, 20] }}
      tickValues={[time, time + 3600000]}
      width={300}
      locale="fi"
      clockType={24}
      isDaily={false}
      observation={false}
      precipitationValues={[null]}
    />
  );

  const chartProps = mockCartesianChart.mock.calls[0][0];
  expect(chartProps.yAxis[0].tickValues).toEqual([0, 5, 10, 15, 20]);
  expect(chartProps.viewport).toEqual({ y: [0, 20] });
  expect(chartProps.padding.left).toBeGreaterThanOrEqual(10);
  expect(chartProps.padding.right).toBeGreaterThanOrEqual(10);
  const arrows = mockPath.mock.calls.map(([props]) => props).filter((props) => props.strokeWidth === 1.5);
  expect(arrows).toHaveLength(1);
  const arrow = arrows[0];
  expect(arrow.strokeWidth).toBe(1.5);
  expect(arrow.path.commands.every(({ y }: { y: number }) => y < 20)).toBe(true);
  const area = mockPath.mock.calls
    .map(([props]) => props)
    .find((props) => props.color === '#d8d8d8');
  expect(area.path.commands.at(-1).type).toBe('close');
});

test('caps the visible wind scale at 15 when its domain ends there', () => {
  mockCartesianChart.mockClear();
  render(
    <ChartDataRenderer
      data={[{ x: 1000, windSpeedMS: 4 }]}
      chartType="wind"
      domain={{ x: [1000, 2000], y: [0, 15] }}
      tickValues={[1000, 2000]}
      width={300}
      locale="fi"
      clockType={24}
      isDaily={false}
      observation={false}
      precipitationValues={[null]}
    />
  );

  const chartProps = mockCartesianChart.mock.calls[0][0];
  expect(chartProps.yAxis[0].tickValues).toEqual([0, 5, 10, 15]);
  expect(chartProps.viewport).toEqual({ y: [0, 15] });
});

test.each([
  [false, false],
  [false, true],
  [true, false],
  [true, true],
])('points wind arrows downwind with cardinals=%s and observations=%s', (cardinals, observation) => {
  mockUseCardinalsForWindDirection = cardinals;
  mockPath.mockClear();
  const start = moment('2026-10-02 00:00');
  const data = [0, 90, 180, 270, 30].map((windDirection, hour) => ({
    x: start.clone().add(hour, 'hours').valueOf(),
    windSpeedMS: 4,
    windDirection,
  }));

  render(
    <ChartDataRenderer
      data={data}
      chartType="wind"
      domain={{ x: [data[0].x, data[4].x], y: [0, 20] }}
      tickValues={data.map(({ x }) => x)}
      width={300}
      locale="fi"
      clockType={24}
      isDaily={false}
      observation={observation}
      precipitationValues={data.map(() => null)}
    />
  );

  const arrows = mockPath.mock.calls
    .map(([props]) => props)
    .filter((props) => props.strokeWidth === 1.5);
  const expectedVectors = [
    [0, 12], // Wind from north points south.
    [-12, 0],
    [0, -12],
    [12, 0],
    cardinals ? [-6 * Math.sqrt(2), 6 * Math.sqrt(2)] : [-6, 6 * Math.sqrt(3)],
  ];
  expect(arrows).toHaveLength(expectedVectors.length);
  arrows.forEach(({ path }, index) => {
    const [tail, tip] = path.commands;
    expect(tip.x - tail.x).toBeCloseTo(expectedVectors[index][0]);
    expect(tip.y - tail.y).toBeCloseTo(expectedVectors[index][1]);
  });
});

test('draws wind observation arrows every full hour', () => {
  const start = moment('2026-10-02 00:00');
  const hours = Array.from({ length: 4 }, (_, index) => start.clone().add(index, 'hours').valueOf());
  const halfHour = start.clone().add(3, 'hours').add(30, 'minutes').valueOf();
  const data = [...hours, halfHour].map((x) => ({ x, windSpeedMS: 4, windDirection: 90 }));

  for (const [observation, expectedArrowCount] of [[true, 4], [false, 2]] as const) {
    mockPath.mockClear();
    render(
      <ChartDataRenderer
        data={data}
        chartType="wind"
        domain={{ x: [hours[0], halfHour], y: [0, 20] }}
        tickValues={hours}
        width={50}
        locale="fi"
        clockType={24}
        isDaily={false}
        observation={observation}
        precipitationValues={data.map(() => null)}
      />
    );

    const arrows = mockPath.mock.calls
      .map(([props]) => props)
      .filter((props) => props.strokeWidth === 1.5);
    expect(arrows).toHaveLength(expectedArrowCount);
  }
});

test('shows 12-hour forecast labels every six hours and configured dates at midnight', () => {
  mockCartesianChart.mockClear();
  const start = moment('2026-10-01 01:00');
  const ticks = Array.from({ length: 49 }, (_, hour) =>
    start.clone().add(hour, 'hours').valueOf()
  );

  render(
    <ChartDataRenderer
      data={[{ x: ticks[0], temperature: 4 }]}
      chartType="temperature"
      domain={{ x: [ticks[0], ticks[ticks.length - 1]], y: [0, 10] }}
      tickValues={ticks}
      width={300}
      locale="fi"
      clockType={12}
      isDaily={false}
      observation={false}
      precipitationValues={[null]}
    />
  );

  const { tickValues, tickCount, formatXLabel, labelRenderer } = mockCartesianChart.mock.calls[0][0].xAxis;
  expect(tickValues).toHaveLength(8);
  expect(tickCount).toBe(tickValues.length);
  expect(tickValues.map(formatXLabel)).toEqual([
    '6 am', '12 pm', '6 pm', 'Pe\n2.10.',
    '6 am', '12 pm', '6 pm', 'La\n3.10.',
  ]);

  const dayText = formatXLabel(tickValues[3]);
  const dayLayout = labelRenderer.measure({ text: dayText });
  const dayLabels = labelRenderer.render({
    text: dayText, value: tickValues[3], x: 0, y: 0,
    width: dayLayout.width, color: '#111',
    chartBounds: { left: 0, right: 300 },
  }) as React.ReactElement<{ font: { asset: number } }>[];
  expect(dayLabels.map((label) => label.props.font.asset)).toEqual([2, 2]);

  const hourText = formatXLabel(tickValues[0]);
  const hourLayout = labelRenderer.measure({ text: hourText });
  const hourLabels = labelRenderer.render({
    text: hourText, value: tickValues[0], x: 0, y: 0,
    width: hourLayout.width, color: '#111',
    chartBounds: { left: 0, right: 300 },
  }) as React.ReactElement<{ font: { asset: number } }>[];
  expect(hourLabels.map((label) => label.props.font.asset)).toEqual([1]);
});

test('shows the configured English date and three-hour labels with a 24-hour clock', () => {
  mockCartesianChart.mockClear();
  const start = moment('2026-10-01 21:00');
  const ticks = Array.from({ length: 7 }, (_, hour) => start.clone().add(hour, 'hours').valueOf());

  render(
    <ChartDataRenderer
      data={[{ x: ticks[0], temperature: 4 }]}
      chartType="temperature"
      domain={{ x: [ticks[0], ticks[6]], y: [0, 10] }}
      tickValues={ticks}
      width={300}
      locale="en"
      clockType={24}
      isDaily={false}
      observation={false}
      precipitationValues={[null]}
    />
  );

  const { tickValues, formatXLabel } = mockCartesianChart.mock.calls[0][0].xAxis;
  expect(tickValues.map(formatXLabel)).toEqual(['21', 'Fri\n2 Oct', '03']);
});

test('keeps a time label when a short forecast has no aligned ticks', () => {
  mockCartesianChart.mockClear();
  const start = moment('2026-10-01 10:30').valueOf();
  const end = moment('2026-10-01 11:30').valueOf();

  render(
    <ChartDataRenderer
      data={[{ x: start, temperature: 4 }]}
      chartType="temperature"
      domain={{ x: [start, end], y: [0, 10] }}
      tickValues={[start, end]}
      width={300}
      locale="en"
      clockType={12}
      isDaily={false}
      observation={false}
      precipitationValues={[null]}
    />
  );

  const { tickValues, formatXLabel } = mockCartesianChart.mock.calls[0][0].xAxis;
  expect(tickValues).toEqual([start]);
  expect(tickValues.map(formatXLabel)).toEqual(['10:30 am']);
});

test('bolds both date lines in hourly observation charts but keeps hours regular', () => {
  mockCartesianChart.mockClear();
  const midnight = moment('2026-10-02 00:00').valueOf();
  const hour = moment('2026-10-02 03:00').valueOf();
  render(
    <ChartDataRenderer
      data={[{ x: midnight, temperature: 4 }]}
      chartType="temperature"
      domain={{ x: [midnight, hour], y: [0, 10] }}
      tickValues={[midnight, hour]}
      width={300}
      locale="fi"
      clockType={24}
      isDaily={false}
      observation
      precipitationValues={[null]}
    />
  );

  const { padding, xAxis } = mockCartesianChart.mock.calls[0][0];
  const dateText = xAxis.formatXLabel(midnight);
  const dateLayout = xAxis.labelRenderer.measure({ text: dateText });
  const dateLabels = xAxis.labelRenderer.render({
    text: dateText, value: midnight, x: 0, y: 0,
    width: dateLayout.width, color: '#111',
    chartBounds: { left: padding.left, right: 300 - padding.right },
  }) as React.ReactElement<{ font: { asset: number } }>[];
  expect(dateText).toContain('\n');
  expect(dateLabels.map((label) => label.props.font.asset)).toEqual([2, 2]);
  expect(padding.left).toBeGreaterThanOrEqual(dateLayout.width / 2);

  const hourText = xAxis.formatXLabel(hour);
  const hourLayout = xAxis.labelRenderer.measure({ text: hourText });
  const hourLabels = xAxis.labelRenderer.render({
    text: hourText, value: hour, x: 0, y: 0,
    width: hourLayout.width, color: '#111',
    chartBounds: { left: padding.left, right: 300 - padding.right },
  }) as React.ReactElement<{ font: { asset: number } }>[];
  expect(hourText).toBe('03');
  expect(hourLabels.map((label) => label.props.font.asset)).toEqual([1]);
});

test('bolds dates in daily observation charts', () => {
  mockCartesianChart.mockClear();
  const ticks = ['2026-10-01', '2026-10-02', '2026-10-03'].map((date) => moment(date).valueOf());
  render(
    <ChartDataRenderer
      data={[{ x: ticks[1], maximumTemperature: 4 }]}
      chartType="daily"
      domain={{ x: [ticks[0], ticks[2]], y: [0, 10] }}
      tickValues={ticks}
      width={300}
      locale="fi"
      clockType={24}
      isDaily
      observation
      precipitationValues={[null]}
    />
  );

  const { formatXLabel, labelRenderer } = mockCartesianChart.mock.calls[0][0].xAxis;
  expect(formatXLabel(ticks[0])).toBe('');
  expect(formatXLabel(ticks[2])).toBe('');
  const text = formatXLabel(ticks[1]);
  const layout = labelRenderer.measure({ text });
  const labels = labelRenderer.render({
    text, value: ticks[1], x: 0, y: 0,
    width: layout.width, color: '#111', chartBounds: { left: 0, right: 300 },
  }) as React.ReactElement<{ font: { asset: number } }>[];
  expect(labels.map((label) => label.props.font.asset)).toEqual([2, 2]);
});

test('draws daily rain on its own day from the rain zero level', () => {
  mockRect.mockClear();
  const ticks = ['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01']
    .map((date) => moment(date).valueOf());
  render(
    <ChartDataRenderer
      data={[
        { x: ticks[3], rrday: null },
        { x: ticks[2], rrday: -5 },
        { x: ticks[1], rrday: -2 },
        { x: ticks[0], rrday: -6 },
      ]}
      chartType="daily"
      domain={{ x: [ticks[0], ticks[3]], y: [-5, 20] }}
      tickValues={ticks}
      width={300}
      locale="fi"
      clockType={24}
      isDaily
      observation
      precipitationValues={[null, null, null, null]}
    />
  );

  const rainBars = mockRect.mock.calls
    .map(([props]) => props)
    .filter((props) => props.color === 'rgb(30, 110, 214)');
  expect(rainBars).toEqual([expect.objectContaining({ x: 10, y: 92, width: 10, height: 3 })]);
});

test('uses each observation timestamp’s precipitation level for its rain bar', () => {
  mockRect.mockClear();
  const data = [
    { epochtime: 500, temperature: -2, precipitation1h: null },
    { epochtime: 400, temperature: -1, precipitation1h: 0 },
    { epochtime: 300, temperature: 3, precipitation1h: 10 },
    { epochtime: 200, temperature: 2, precipitation1h: 0.2 },
    { epochtime: 100, temperature: 1, precipitation1h: 4 },
  ] as unknown as ChartData;
  const prepared = prepareChartData(data, 'weather', true);

  render(
    <ChartDataRenderer
      data={prepared.points}
      chartType="weather"
      domain={{ x: [100000, 500000], y: prepared.domain.y ?? [0, 10] }}
      tickValues={[100000, 200000, 300000, 400000, 500000]}
      width={300}
      locale="en"
      clockType={24}
      isDaily={false}
      observation
      precipitationValues={prepared.precipitationValues}
    />
  );

  const rainBars = mockRect.mock.calls
    .map(([props]) => props)
    .filter((props) => typeof props.color === 'string' && props.color.startsWith('rain-'));
  expect(rainBars.map(({ x, color }) => ({ x, color }))).toEqual([
    { x: -3, color: 'rain-6' },
    { x: 7, color: 'rain-2' },
    { x: 17, color: 'rain-8' },
    { x: 27, color: 'rain-0' },
  ]);
  // The mock scale maps temperature zero to y=90, above the chart bottom (y=100).
  rainBars.forEach(({ y, height }) => expect(y + height).toBeCloseTo(90));
  expect(rainBars[3].height).toBe(0);
});

test('centers the last forecast hour on its tick while keeping it inside the canvas', () => {
  mockCartesianChart.mockClear();
  const start = moment('2026-10-01 12:00');
  const ticks = Array.from({ length: 4 }, (_, hour) => start.clone().add(hour, 'hours').valueOf());

  render(
    <ChartDataRenderer
      data={[{ x: ticks[0], temperature: 4 }]}
      chartType="temperature"
      domain={{ x: [ticks[0], ticks[3]], y: [-5, 15] }}
      tickValues={ticks}
      width={300}
      locale="fi"
      clockType={24}
      isDaily={false}
      observation={false}
      precipitationValues={[null]}
    />
  );

  const { padding, xAxis } = mockCartesianChart.mock.calls[0][0];
  const label = xAxis.formatXLabel(ticks[3]);
  const layout = xAxis.labelRenderer.measure({ text: label });
  const chartBounds = { left: padding.left, right: 300 - padding.right };
  const rendered = xAxis.labelRenderer.render({
    text: label, value: ticks[3], x: chartBounds.right - layout.width,
    y: 0, width: layout.width, color: '#111', chartBounds,
  }) as React.ReactElement<{ x: number }>[];

  expect(rendered[0].props.x + layout.width / 2).toBeCloseTo(chartBounds.right);
  expect(rendered[0].props.x + layout.width).toBeLessThanOrEqual(300);
});
