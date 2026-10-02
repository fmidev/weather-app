import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useTheme } from '@react-navigation/native';
import moment from '@utils/moment';
import {
  Bar,
  CartesianChart,
  Line,
  Scatter,
  PointsArray,
  AxisLabelRenderer,
} from 'victory-native';
import {
  DashPathEffect,
  Path,
  Rect,
  Skia,
  Text as SkiaText,
  useFont,
} from '@shopify/react-native-skia';

import { CustomTheme } from '@assets/colors';
import { MAC_CONTENT_SIZE_MULTIPLIER } from '@assets/constants';
import { useIsRunningOnMac } from '@components/common/MacContentSizeContext';
import { ClockType, UnitMap } from '@store/settings/types';
import { getPrecipitationLevel, getWindDirection } from '@utils/helpers';
import { tickFormat } from '@utils/chart';
import { Config } from '@config';
import { ChartDomain, ChartKey, ChartPoint, ChartType } from './types';
import { getChartYTicks } from './ticks';
import { CHART_HEIGHT, CHART_TOP_PADDING } from './layout';

type Props = {
  data: ChartPoint[];
  chartType: ChartType;
  domain: ChartDomain;
  tickValues: number[];
  width: number;
  height?: number;
  topPadding?: number;
  locale: string;
  clockType: ClockType;
  isDaily: boolean;
  observation: boolean;
  units?: UnitMap;
  precipitationValues: Array<number | null>;
  onYScaleChange?: (domain: [number, number], range: [number, number]) => void;
};

const seriesForType: Record<ChartType, ChartKey[]> = {
  temperature: ['temperature', 'feelsLike', 'dewPoint'],
  weather: ['temperature', 'feelsLike', 'dewPoint', 'precipitation1h'],
  precipitation: ['precipitation1h', 'pop'],
  wind: ['windSpeedMS', 'windGust', 'hourlymaximumgust'],
  humidity: ['humidity', 'relativeHumidity'],
  pressure: ['pressure'],
  visCloud: ['visibility', 'totalCloudCover'],
  cloud: ['cloudHeight'],
  snowDepth: ['snowDepth', 'snowDepth06'],
  uv: ['uvCumulated'],
  daily: ['rrday', 'maximumTemperature', 'minimumTemperature', 'minimumGroundTemperature06'],
};

const arrowPath = (x: number, y: number, degrees: number) => {
  const builder = Skia.PathBuilder.Make();
  const radians = (degrees * Math.PI) / 180;
  const transform = (dx: number, dy: number) => ({
    x: x + dx * Math.cos(radians) - dy * Math.sin(radians),
    y: y + dx * Math.sin(radians) + dy * Math.cos(radians),
  });
  const start = transform(0, 6);
  const tip = transform(0, -6);
  const left = transform(-4, -2);
  const right = transform(4, -2);
  builder.moveTo(start.x, start.y);
  builder.lineTo(tip.x, tip.y);
  builder.lineTo(left.x, left.y);
  builder.moveTo(tip.x, tip.y);
  builder.lineTo(right.x, right.y);
  return builder.build();
};

const windAreaPath = (speed: PointsArray, gust: PointsArray) => {
  const builder = Skia.PathBuilder.Make();
  let segment: Array<{ speed: PointsArray[number]; gust: PointsArray[number] }> = [];

  const closeSegment = () => {
    if (segment.length === 0) return;
    builder.moveTo(segment[0].speed.x, segment[0].speed.y as number);
    segment.forEach(({ speed: point }) => builder.lineTo(point.x, point.y as number));
    [...segment].reverse().forEach(({ gust: point }) => builder.lineTo(point.x, point.y as number));
    builder.close();
    segment = [];
  };

  speed.forEach((point, index) => {
    const gustPoint = gust[index];
    if (point?.y == null || gustPoint?.y == null) {
      closeSegment();
      return;
    }
    segment.push({ speed: point, gust: gustPoint });
  });
  closeSegment();
  return builder.build();
};

const labelWidth = (label: string, font: ReturnType<typeof useFont>) =>
  font?.getGlyphWidths(font.getGlyphIDs(label)).reduce((width, glyph) => width + glyph, 0) ?? 0;

const ChartDataRenderer: React.FC<Props> = ({
  data, chartType, domain, tickValues, width, locale, clockType,
  isDaily, observation, units, precipitationValues, onYScaleChange,
  height = CHART_HEIGHT, topPadding = CHART_TOP_PADDING,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { fontScale } = useWindowDimensions();
  const isRunningOnMac = useIsRunningOnMac();
  const fontSize = Math.min(
    fontScale * (isRunningOnMac ? MAC_CONTENT_SIZE_MULTIPLIER : 1) * 14,
    18
  );
  const font = useFont(require('../../../assets/fonts/Roboto-Regular.ttf'), fontSize);
  const boldFont = useFont(require('../../../assets/fonts/Roboto-Bold.ttf'), fontSize);
  const xDomain = domain.x ?? [tickValues[0], tickValues[tickValues.length - 1]];
  const forecastXAxis = !observation && !isDaily;
  const forecastTickInterval = clockType === 12 ? 6 : 3;
  const forecastTickValues = forecastXAxis
    ? tickValues.filter((value) => {
      const time = moment(value);
      return time.minutes() === 0 && time.seconds() === 0 &&
        time.hours() % forecastTickInterval === 0;
    })
    : [];
  let xTickValues = tickValues;
  if (forecastXAxis) {
    xTickValues = forecastTickValues.length > 0 ? forecastTickValues : tickValues.slice(0, 1);
  }
  const formatXAxisLabel = (value: number) => {
    if (forecastXAxis && forecastTickValues.length === 0) {
      return moment(value).formatDateTime('time', locale, clockType);
    }
    const index = tickValues.indexOf(value);
    if (isDaily && (index === 0 || index === tickValues.length - 1)) return '';
    return String(tickFormat(value, locale, clockType, isDaily, observation));
  };
  const xAxisEdgePadding = (value: number | undefined) => {
    if (value === undefined) return 4;
    const lines = formatXAxisLabel(value).split('\n');
    const labelFont = lines.length > 1 ? boldFont : font;
    return Math.max(4, ...lines.map((line) => Math.ceil(labelWidth(line, labelFont) / 2) + 4));
  };
  const xPadding = {
    left: xAxisEdgePadding(xTickValues[0]),
    right: xAxisEdgePadding(xTickValues[xTickValues.length - 1]),
  };
  const chartPadding = chartType === 'wind'
    ? { left: Math.max(xPadding.left, 10), right: Math.max(xPadding.right, 10) }
    : xPadding;
  const xAxisLabelRenderer: AxisLabelRenderer<number> = {
    measure: ({ text }) => {
      const lines = text.split('\n');
      const labelFont = lines.length > 1 ? boldFont : font;
      return {
        width: Math.max(0, ...lines.map((lineText) => labelWidth(lineText, labelFont))),
        height: lines.length * fontSize,
        fontSize,
        lineHeight: fontSize,
      };
    },
    render: ({ text, value, y, color, chartBounds }) => {
      const lines = text.split('\n');
      const labelFont = lines.length > 1 ? boldFont : font;
      if (!labelFont) return null;
      const [minimum, maximum] = xDomain;
      const tickX = maximum === minimum
        ? chartBounds.left
        : chartBounds.left + (value - minimum) / (maximum - minimum) *
          (chartBounds.right - chartBounds.left);
      return lines.map((lineText, index) => (
        <SkiaText
          key={`${text}-${index}`}
          text={lineText}
          x={tickX - labelWidth(lineText, labelFont) / 2}
          y={y + (index + 1) * fontSize}
          font={labelFont}
          color={color}
        />
      ));
    },
  };
  const precipitationUnit = units?.precipitation.unitAbb ?? Config.get('settings').units.precipitation;
  const yKeys = seriesForType[chartType];
  const yDomain = domain.y ?? [0, 10];
  const yTicks = getChartYTicks(
    domain,
    chartType,
    units?.pressure.unitAbb ?? Config.get('settings').units.pressure,
    observation
  );
  const gustKey = data.some((point) => point.windGust != null) ? 'windGust' : 'hourlymaximumgust';
  const windArrowInterval = observation || width / (data.length || 1) > 20 ? 1 : 3;

  const line = (
    points: PointsArray,
    color: string,
    dash?: number[]
  ) => points.some((point) => point.y != null) && (
    <Line points={points} color={color} strokeWidth={2} curveType="basis">
      {dash && <DashPathEffect intervals={dash} />}
    </Line>
  );

  return (
    <View style={{ width, height }}>
      <CartesianChart
        data={data}
        onScaleChange={(_, yScale) => onYScaleChange?.(
          yScale.domain() as [number, number],
          yScale.range() as [number, number]
        )}
        xKey="x"
        yKeys={yKeys}
        domain={{ x: xDomain, y: yDomain }}
        viewport={chartType === 'wind' ? { y: yDomain } : undefined}
        padding={{ top: topPadding, bottom: 20, ...chartPadding }}
        xAxis={{
          font,
          labelRenderer: xAxisLabelRenderer,
          tickValues: xTickValues,
          tickCount: xTickValues.length,
          lineColor: colors.chartGrid,
          labelColor: colors.hourListText,
          formatXLabel: formatXAxisLabel,
        }}
        yAxis={[{
          yKeys,
          domain: yDomain,
          tickValues: yTicks,
          tickCount: yTicks.length,
          lineColor: colors.chartGrid,
          lineWidth: 1,
          formatYLabel: () => '',
        }]}
        renderOutside={({ chartBounds, xScale }) => chartType === 'wind' && data.map((datum, index) => {
          const direction = datum.windDirection;
          if (direction == null ||
            moment(datum.x).minutes() !== 0 ||
            moment(datum.x).hours() % windArrowInterval !== 0) {
            return null;
          }
          // The path points north, so remove the legacy icon's 45-degree correction.
          const rotation = getWindDirection(direction) - 45;
          return (
            <Path
              key={`direction-${index}`}
              path={arrowPath(xScale(datum.x), chartBounds.top - 10, rotation)}
              color={colors.primaryText}
              style="stroke"
              strokeWidth={1.5}
            />
          );
        })}>
        {({ points, chartBounds, xScale, yScale }) => {
          const rain = points.precipitation1h;
          const weatherRainBaseline = yScale(0);
          const rainBars = rain?.map((point, index) => {
            if (point.y == null) return null;
            const amount = precipitationValues[index] ?? 0;
            return (
              chartType === 'weather' ? (
                <Rect
                  key={`rain-${index}`}
                  x={point.x - 3}
                  y={Math.min(point.y, weatherRainBaseline)}
                  width={6}
                  height={Math.abs(weatherRainBaseline - point.y)}
                  color={colors.rain[getPrecipitationLevel(amount, precipitationUnit)]}
                />
              ) : (
                <Bar
                  key={`rain-${index}`}
                  points={[point]}
                  chartBounds={chartBounds}
                  barWidth={6}
                  color={colors.rain[getPrecipitationLevel(amount, precipitationUnit)]}
                />
              )
            );
          });
          const gust = points[gustKey];
          return (
            <>
              {tickValues.filter((tick) => {
                const time = moment(tick);
                return time.hours() === 0 && time.minutes() === 0 && time.seconds() === 0;
              }).map((tick) => (
                <Rect
                  key={`day-grid-${tick}`}
                  x={xScale(tick)}
                  y={chartBounds.top}
                  width={1}
                  height={chartBounds.bottom - chartBounds.top}
                  color={colors.chartGridDay}
                />
              ))}
              {(chartType === 'temperature' || chartType === 'weather' || chartType === 'daily') &&
                yDomain[0] <= 0 && yDomain[1] >= 0 && (
                  <Rect
                    x={chartBounds.left}
                    y={yScale(0)}
                    width={chartBounds.right - chartBounds.left}
                    height={1}
                    color={colors.secondaryBorder}
                  />
                )}
              {(chartType === 'weather' || chartType === 'precipitation') && rainBars}
              {(chartType === 'temperature' || chartType === 'weather') && (
                <>
                  {line(points.temperature, colors.chartPrimaryLine)}
                  {line(points.feelsLike, colors.chartSecondaryLine, [4, 4])}
                  {line(points.dewPoint, colors.chartPrimaryLine, [2, 3])}
                </>
              )}
              {chartType === 'precipitation' && line(points.pop, colors.chartPrimaryLine, [2, 3])}
              {chartType === 'wind' && (
                <>
                  {points.windSpeedMS?.length > 0 && gust?.length > 0 && (
                    <Path path={windAreaPath(points.windSpeedMS, gust)} color="#d8d8d8" />
                  )}
                  {line(points.windSpeedMS, colors.chartPrimaryLine)}
                  {line(gust, colors.chartSecondaryLine, [4, 4])}
                </>
              )}
              {chartType === 'humidity' &&
                line(data.some((point) => point.humidity != null) ? points.humidity : points.relativeHumidity, colors.chartPrimaryLine)}
              {chartType === 'pressure' && line(points.pressure, colors.chartPrimaryLine)}
              {chartType === 'cloud' && line(points.cloudHeight, colors.primaryText)}
              {chartType === 'uv' && line(points.uvCumulated, colors.chartPrimaryLine)}
              {chartType === 'visCloud' && (
                <>
                  <Bar points={points.totalCloudCover} chartBounds={chartBounds} barWidth={4} color={colors.primaryText} />
                  {line(points.visibility, colors.chartSecondaryLine, [4, 4])}
                </>
              )}
              {chartType === 'snowDepth' && (
                <Bar
                  points={data.some((point) => point.snowDepth06 != null) ? points.snowDepth06 : points.snowDepth}
                  chartBounds={chartBounds}
                  barWidth={isDaily ? 10 : 2}
                  color={colors.primaryText}
                />
              )}
              {chartType === 'daily' && (
                <>
                  {points.rrday.map((point, index) => {
                    const rainTop = point.yValue;
                    if (point.y == null || rainTop == null || !Number.isFinite(rainTop) || rainTop <= yDomain[0]) {
                      return null;
                    }
                    const rainBaseline = yScale(yDomain[0]);
                    return (
                      <Rect
                        key={`daily-rain-${index}`}
                        x={point.x}
                        y={Math.min(point.y, rainBaseline)}
                        width={10}
                        height={Math.abs(rainBaseline - point.y)}
                        color="rgb(30, 110, 214)"
                      />
                    );
                  })}
                  {points.maximumTemperature.map((point, index) => {
                    const low = points.minimumTemperature[index];
                    if (point.y == null || low?.y == null) return null;
                    return (
                      <Rect
                        key={`extreme-${index}`}
                        x={point.x - 5}
                        y={Math.min(point.y, low.y)}
                        width={10}
                        height={Math.max(1, Math.abs(low.y - point.y))}
                        color="rgb(145, 0, 0)"
                      />
                    );
                  })}
                  <Scatter points={points.minimumGroundTemperature06} radius={4} color="rgb(176, 176, 0)" />
                </>
              )}
            </>
          );
        }}
      </CartesianChart>
    </View>
  );
};

export default ChartDataRenderer;
