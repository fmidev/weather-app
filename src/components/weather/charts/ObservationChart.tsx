import React, { memo } from 'react';
import { View } from 'react-native';
import { CartesianChart, Line, AreaRange, Bar } from 'victory-native';
import { DashPathEffect, Text, Rect, useFont } from '@shopify/react-native-skia';
import { useTheme } from '@react-navigation/native';
import moment from 'moment';
import { getWindArrow, tickFormat } from '@utils/chart';
import { Config } from '@config';
import { getPrecipitationLevel } from '@utils/helpers';

import RobotoRegular from '@assets/fonts/Roboto-Regular.ttf';
import NotoSansBold from '@assets/fonts/NotoSansSymbols-Bold.ttf';

import type { TimeStepData as ObservationTimeStepData } from '@store/observation/types';
import { ChartDomain, ChartType } from './types';
import { ClockType, UnitMap } from '@store/settings/types';
import AxisLabels from './AxisLabels';

type ChartProps = {
  chartDimensions: { x: number; y: number };
  tickValues: number[];
  chartDomain: ChartDomain;
  chartType: ChartType;
  chartValues: Array<ObservationTimeStepData>;
  locale: string;
  clockType: ClockType;
  isDaily: boolean;
  units?: UnitMap;
};

const ObservationChart: React.FC<ChartProps> = ({
  chartDimensions,
  tickValues,
  chartDomain,
  chartType,
  chartValues,
  locale,
  clockType,
  isDaily,
  units,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const font = useFont(RobotoRegular, 12);
  const symbolFont = useFont(NotoSansBold, 16);

  if (!font || !symbolFont) {
    return null;
  }

  const defaultUnits = Config.get('settings').units;
  const precipitationUnit =
    units?.precipitation.unitAbb ?? defaultUnits.precipitation;

  console.log('observation chart render', chartType);

  const chartPadding = 16;
  const data = chartValues.map((item) => ({
    ...item,
    epochtime: item.epochtime ? item.epochtime * 1000 : undefined
  }));

  const yAxis = [{
    font,
    domain: chartType === 'visCloud' ? [0, 40000 ] : chartDomain.y,
    yKeys:
      ['temperature', 'dewPoint', 'feelsLike', 'windSpeedMS', 'windGust',
        'windDirection', 'pressure', 'humidity', 'visibility', 'snowDepth'],
    axisSide: 'left',
    formatYLabel: (value: number) => chartType === 'visCloud' ? Math.round(value/1000).toString() : value.toString()
  }];
  if (chartType === 'visCloud' || chartType === 'weather') {
    yAxis.push({
      font,
      domain: chartType === 'weather' ? [0, 20] : [0, 8],
      yKeys: ['ri_10min', 'totalCloudCover'],
      axisSide: 'right',
      formatYLabel: (value) => chartType === 'visCloud' ? `${value}/8`: value.toString()
    });
  }

  let labelText = '';
  if (chartType === 'weather') {
    labelText = units?.temperature.unitAbb || '';
  } else if (chartType === 'humidity') {
    labelText = '%';
  } else if (chartType === 'visCloud') {
    labelText = 'km';
  } else {
    labelText = units?.[chartType]?.unitAbb || '';
  }

  let secondLabelText : string | undefined;
  if (chartType === 'weather') secondLabelText = units?.precipitation?.unitAbb
  if (chartType === 'visCloud') secondLabelText = '/8';

  const firstLabel = { x: 20, y: 16, label: labelText };
  const secondLabel = {
    x: chartDimensions.x - 30,
    y: 16,
    label: secondLabelText || ''
  };

  return (
    <View style={{ width: chartDimensions.x, height: chartDimensions.y }}>
      <CartesianChart
        data={data}
        // @ts-ignore
        xKey="epochtime"
        yKeys={
          ['temperature', 'dewPoint', 'windSpeedMS', 'windGust', 'windDirection',
            'ri_10min', 'humidity', 'pressure', 'visibility', 'totalCloudCover', 'snowDepth']
        }
        axisOptions={{ font }}
        padding={{ left: chartPadding, right: chartPadding, top: chartPadding + 10, bottom: chartPadding }}
        xAxis={{
          font,
          tickCount: chartValues.length/3,
          tickValues,
          formatXLabel: (value) => tickFormat(value, locale, clockType, isDaily, true)
        }}
        //@ts-ignore
        yAxis={yAxis}
        renderOutside={() => <AxisLabels first={firstLabel} second={secondLabel} />}
      >
        {({ points, chartBounds }) => (
          <>
            { (chartType === 'temperature' || chartType === 'weather') && (
              <>
                <Line points={points.temperature} color="blue" strokeWidth={1} />
                <Line points={points.dewPoint} color="blue" strokeWidth={1}>
                  <DashPathEffect intervals={[1, 2]} />
                </Line>
                {
                  // Bar is not working correctly with two y-axes, so we draw the bars manually
                  chartType === 'weather'
                    ? points.ri_10min.map((point) => {
                        console.log(point);
                        if (!point.x || !point.yValue) return null;

                        console.log(point);

                        return (
                          <Rect
                            key={`ri10min-${point.xValue}`}
                            x={point.x}
                            y={chartBounds.bottom}
                            width={3}
                            height={point.yValue * ((chartBounds.top - chartBounds.bottom)/20)}
                            color={colors.rain[getPrecipitationLevel(point.yValue, precipitationUnit)]}
                          />
                        );
                      })
                    : null
                }
              </>
            )}
            { chartType === 'wind' && (
              <>
                <AreaRange
                  upperPoints={points.windGust}
                  lowerPoints={points.windSpeedMS}
                  color="lightgray"
                />
                <Line points={points.windSpeedMS} color="black" strokeWidth={1} />
                <Line points={points.windGust} color="blue" strokeWidth={1}>
                  <DashPathEffect intervals={[4, 4]} />
                </Line>
                {points.windDirection.map((item) => {
                  const windMoment = moment(item.xValue);
                  return (windMoment.minute() === 0) ? (
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
              <Bar
                points={points.precipitation1h}
                chartBounds={chartBounds}
                color="blue"
              />
            )}
            { chartType === 'humidity' && (
              <Line points={points.humidity} color="black"  strokeWidth={2} />
            )}
            { chartType === 'pressure' && (
              <Line points={points.pressure} color="black"  strokeWidth={2} />
            )}
            { chartType === 'visCloud' && (
              <>
                <Bar
                  points={points.totalCloudCover}
                  chartBounds={chartBounds}
                  color="black"
                />
                <Line points={points.visibility} color="blue"  strokeWidth={2}>
                  <DashPathEffect intervals={[4, 2]} />
                </Line>
              </>
            )}
            { chartType === 'snowDepth' && (
              <Bar
                points={points.snowDepth}
                chartBounds={chartBounds}
                color="black"
              />
            )}
          </>
        )}
      </CartesianChart>
    </View>
  );
}

export default memo(ObservationChart);
