import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CartesianChart, Line, AreaRange, Bar, useChartTransformState, getTransformComponents } from 'victory-native';
import { DashPathEffect, Text, useFont } from '@shopify/react-native-skia';
import { getWindArrow, tickFormat } from '@utils/chart';
import moment from 'moment';

import RobotoRegular from '@assets/fonts/Roboto-Regular.ttf';
import NotoSansBold from '@assets/fonts/NotoSansSymbols-Bold.ttf';

import type { TimeStepData as ForecastTimeStepData } from '@store/forecast/types';
import { ChartDomain, ChartType } from './types';
import { ClockType, UnitMap } from '@store/settings/types';
import AxisLabels from './AxisLabels';
import { useTheme } from '@react-navigation/native';
import type { CustomTheme } from '@assets/colors';
import { LINE_WIDTH, SCALE_X } from './constants';

type ChartProps = {
  chartDimensions: { x: number; y: number };
  tickValues: number[];
  chartDomain: ChartDomain;
  chartType: ChartType;
  chartValues: Array<ForecastTimeStepData>;
  locale: string;
  clockType: ClockType;
  isDaily: boolean;
  units?: UnitMap;
};
const ForecastChart: React.FC<ChartProps> = ({
  chartDimensions,
  chartDomain,
  chartType,
  chartValues,
  locale,
  clockType,
  isDaily,
  units,
  tickValues
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { state } = useChartTransformState({ scaleX: SCALE_X });
  const { scaleX } = getTransformComponents(state.matrix.get())
  const font = useFont(RobotoRegular, 12);
  const symbolFont = useFont(NotoSansBold, 12);

  if (!font || !symbolFont) {
    return null;
  }

  const chartPadding = 16;
  const data = chartValues.map((item) => ({
    ...item,
    epochtime: item.epochtime ? item.epochtime * 1000 : undefined
  }));

  const yAxis = [{
    font,
    domain: chartDomain.y,
    yKeys:
      ['temperature', 'dewPoint', 'feelsLike', 'windSpeedMS', 'hourlymaximumgust',
        'windDirection', 'precipitation1h', 'relativeHumidity', 'pressure', 'uvCumulated'],
    axisSide: 'left',
  }];
  if (chartType === 'precipitation' || chartType === 'weather') {
    yAxis.push({
      font,
      domain: chartType === 'weather' ? [0, 20 ] : [0, 100],
      yKeys: ['pop'],
      axisSide: 'right',
      //@ts-ignore
      formatYLabel: (value) => Math.round(value).toString()
    });
  }

  let label = '';
  if (chartType === 'humidity') {
    label = '%';
  } else {
    label = units?.[chartType]?.unitAbb || '';
  }
  const firstLabel = { x: 20, y: 16, label: label };
  const secondLabel = { x: chartDimensions.x - 30, y: 16, label: '%' };
  const strokeWidth = LINE_WIDTH / scaleX;

  return (
    <View style={[styles.container, { height: chartDimensions.y }]}>
      <CartesianChart
        data={data}
        // @ts-ignore
        xKey="epochtime"
        yKeys={
          ['temperature', 'dewPoint', 'feelsLike', 'windSpeedMS', 'hourlymaximumgust',
            'windDirection', 'precipitation1h', 'pop', 'relativeHumidity', 'pressure',
            'uvCumulated']
        }
        axisOptions={{ font }}
        padding={{ left: chartPadding, right: chartPadding, top: chartPadding+10, bottom: chartPadding }}
        xAxis={{
          font,
          tickCount: tickValues.length,
          tickValues,
          formatXLabel: (value) => tickFormat(value, locale, clockType, isDaily, true)
        }}
        //@ts-ignore
        yAxis={yAxis}
        renderOutside={() => <AxisLabels first={firstLabel} second={secondLabel} />}
        transformState={state}
        transformConfig={{
          pan: {
            dimensions: 'x'
          },
          pinch: { dimensions: 'x', enabled: false},
			  }}
      >
        {({ points, chartBounds }) => (
          <>
            { (chartType === 'temperature' || chartType === 'weather') && (
              <>
                <Line points={points.temperature} color={colors.chartPrimaryLine} strokeWidth={strokeWidth} />
                <Line points={points.feelsLike} color={colors.chartSecondaryLine} strokeWidth={strokeWidth}>
                  <DashPathEffect intervals={[2, 1]} />
                </Line>
                <Line points={points.dewPoint} color={colors.chartPrimaryLine} strokeWidth={strokeWidth}>
                  <DashPathEffect intervals={[1, 1]} />
                </Line>
              </>
            )}
            { chartType === 'wind' && (
              <>
                <AreaRange
                  upperPoints={points.hourlymaximumgust}
                  lowerPoints={points.windSpeedMS}
                  color="lightgray"
                />
                <Line points={points.windSpeedMS} color="black" strokeWidth={strokeWidth} />
                <Line points={points.hourlymaximumgust} color="blue" strokeWidth={strokeWidth}>
                  <DashPathEffect intervals={[4, 2]} />
                </Line>
                {points.windDirection.map((item) => {
                  const windMoment = moment(item.xValue);
                  return windMoment.hour() % 3 === 0 ? (
                    <React.Fragment key={`windDirection-${item.x}-${item.y}`}>
                      <Text
                        x={item.x}
                        y={40}
                        text={ item.yValue ? getWindArrow(item.yValue) : ''}
                        font={symbolFont}
                      />
                    </React.Fragment>
                  ) : null;
                })}
              </>
            )}
            { chartType === 'precipitation' && (
              <>
                <Bar
                  points={points.precipitation1h}
                  chartBounds={chartBounds}
                  color="blue"
                />
                <Line points={points.pop} color="black"  strokeWidth={strokeWidth}>
                  <DashPathEffect intervals={[1, 2]} />
                </Line>
              </>
            )}
            { chartType === 'humidity' && (
              <Line points={points.relativeHumidity} color="black"  strokeWidth={strokeWidth} />
            )}
            { chartType === 'pressure' && (
              <Line points={points.pressure} color="black"  strokeWidth={strokeWidth} />
            )}
            { chartType === 'uv' && (
              <Line points={points.uvCumulated} color="black"  strokeWidth={strokeWidth} />
            )}
          </>
        )}
      </CartesianChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
  },
});

export default ForecastChart;
