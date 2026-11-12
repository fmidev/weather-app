import React from 'react';
import type { PointsArray } from 'victory-native';
import type { ChartKey, ChartPoint } from '@components/weather/charts/types';

// Only replace the native canvas. Application chart preparation and rendering stay real.
jest.mock('../../../src/assets/fonts/Roboto-Regular.ttf', () => 1);
jest.mock('../../../src/assets/fonts/Roboto-Bold.ttf', () => 2);

jest.mock('@shopify/react-native-skia', () => {
  const { View } = require('react-native');
  return {
    useFont: (_asset: number, size: number) => ({
      getSize: () => size,
      getGlyphIDs: (text: string) => Array.from(text),
      getGlyphWidths: (glyphs: string[]) => glyphs.map(() => size / 2),
    }),
    DashPathEffect: View,
    Path: View,
    Rect: View,
    Text: View,
    Skia: {
      PathBuilder: {
        Make: () => ({
          moveTo: jest.fn(),
          lineTo: jest.fn(),
          close: jest.fn(),
          build: () => ({}),
        }),
      },
    },
  };
});

jest.mock('victory-native', () => {
  const { View } = require('react-native');
  const createScale = (domain: [number, number], range: [number, number]) => Object.assign(
    (value: number) => range[0] + (value - domain[0]) /
      (domain[1] - domain[0] || 1) * (range[1] - range[0]),
    { domain: () => domain, range: () => range }
  );
  type MockRenderArgs = {
    points: Record<ChartKey, PointsArray>;
    chartBounds: { left: number; right: number; top: number; bottom: number };
    xScale: ReturnType<typeof createScale>;
    yScale: ReturnType<typeof createScale>;
  };
  type MockCartesianChartProps = {
    data: ChartPoint[];
    yKeys: ChartKey[];
    domain: { x: [number, number]; y: [number, number] };
    padding: { top: number; bottom: number; left: number; right: number };
    children: (args: MockRenderArgs) => React.ReactNode;
    renderOutside?: (args: MockRenderArgs) => React.ReactNode;
    onScaleChange?: (xScale: MockRenderArgs['xScale'], yScale: MockRenderArgs['yScale']) => void;
  };

  const CartesianChart = ({ data, yKeys, domain, padding, children, renderOutside, onScaleChange }: MockCartesianChartProps) => {
    const ReactActual = require('react') as typeof React;
    // Jest has no native layout; fixed canvas bounds are sufficient for render callbacks.
    const chartBounds = { left: padding.left, right: 300 - padding.right, top: padding.top, bottom: 300 - padding.bottom };
    const xScale = ReactActual.useMemo(() => createScale(domain.x, [chartBounds.left, chartBounds.right]),
      [domain.x[0], domain.x[1], chartBounds.left, chartBounds.right]);
    const yScale = ReactActual.useMemo(() => createScale(domain.y, [chartBounds.bottom, chartBounds.top]),
      [domain.y[0], domain.y[1], chartBounds.bottom, chartBounds.top]);
    ReactActual.useEffect(() => { onScaleChange?.(xScale, yScale); }, [onScaleChange, xScale, yScale]);
    const sortedData = [...data].sort((a, b) => a.x - b.x);
    const points = Object.fromEntries(yKeys.map((key) => [key, sortedData.map((point) => ({
      x: xScale(point.x),
      xValue: point.x,
      y: point[key] == null ? null : yScale(point[key]),
      yValue: point[key] ?? null,
    }))])) as MockRenderArgs['points'];
    const args = { points, chartBounds, xScale, yScale };
    return (
      <View testID="live-cartesian-chart" data={data} yKeys={yKeys}>
        {children(args)}
        {renderOutside?.(args)}
      </View>
    );
  };
  return {
    CartesianChart,
    Line: (props: { points: PointsArray; children?: React.ReactNode }) => (
      <View testID="live-chart-line" {...props} />
    ),
    Bar: View,
    Scatter: View,
  };
});
