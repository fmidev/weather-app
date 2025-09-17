import React, { memo } from 'react';
import { View } from 'react-native';
import { CartesianChart, Bar, Scatter } from 'victory-native';
import { useFont, Rect } from '@shopify/react-native-skia';

import type { TimeStepData as ObservationTimeStepData } from '@store/observation/types';
import { ChartDomain, ChartType } from './types';
import { ClockType, UnitMap } from '@store/settings/types';
import AxisLabels from './AxisLabels';
import { tickFormat } from '@utils/chart';

import RobotoRegular from '@assets/fonts/Roboto-Regular.ttf';
import NotoSansBold from '@assets/fonts/NotoSansSymbols-Bold.ttf';


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

const DailyObservationChart: React.FC<ChartProps> = ({
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
  const font = useFont(RobotoRegular, 12);
  const symbolFont = useFont(NotoSansBold, 16);

  if (!font || !symbolFont) {
    return null;
  }

  console.log('daily chart render', chartType);

  const chartPadding = 16;
  const data = chartValues.map((item) => ({
    ...item,
    epochtime: item.epochtime ? item.epochtime * 1000 : undefined,
    rrday: item.rrday && item.rrday < 0 ? null : item.rrday,
  }));

  const yAxis = [{
    font,
    domain: chartType === 'visCloud' ? [0, 40000 ] : chartDomain.y,
    yKeys: ['minimumTemperature', 'maximumTemperature', 'minimumGroundTemperature06', 'snowDepth06'],
    axisSide: 'left',
  }];
  if (chartType === 'daily') {
    yAxis.push({
      font,
      domain: [0, 30],
      yKeys: ['rrday'],
      axisSide: 'right',
    });
  }

  const firstLabel = { x: 20, y: 16, label: chartType === 'snowDepth' ? 'cm' : units?.temperature?.unitAbb || '' };
  const secondLabel = { x: chartDimensions.x - 30, y: 16, label: chartType === 'snowDepth' ? '' : units?.precipitation?.unitAbb || ''  };

  return (
    <View style={{ width: chartDimensions.x, height: chartDimensions.y }}>
      <CartesianChart
        data={data}
        // @ts-ignore
        xKey="epochtime"
        yKeys={['minimumTemperature', 'maximumTemperature', 'minimumGroundTemperature06', 'snowDepth06', 'rrday']}
        yKeyConfig={{
          minimumTemperature: { axisIndex: 0 },
          maximumTemperature: { axisIndex: 0 },
          minimumGroundTemperature06: { axisIndex: 0 },
          snowDepth06: { axisIndex: 0 },
          rrday: { axisIndex: 1 },
        }}
        axisOptions={{ font }}
        padding={{ left: chartPadding, right: chartPadding, top: chartPadding + 10, bottom: chartPadding }}
        xAxis={{
          font,
          tickCount: chartValues.length,
          tickValues,
          formatXLabel: (value) => tickFormat(value, locale, clockType, isDaily, true)
        }}
        //@ts-ignore
        yAxis={yAxis}
        renderOutside={() => <AxisLabels first={firstLabel} second={secondLabel} />}
      >
        {({ points, chartBounds }) => (
          <>
            { (chartType === 'snowDepth') && (
              <Bar
                points={points.snowDepth06}
                chartBounds={chartBounds}
                color="black"
              />
            )}
            { (chartType === 'daily') && (
              <>
                {
                  // Bar is not working correctly with two y-axes, so we draw the bars manually
                  points.rrday.map((point) => {
                    if (!point.x || !point.y || !point.yValue) return null;

                    return (
                      <Rect
                        key={`rrday-${point.xValue}`}
                        x={point.x}
                        y={chartBounds.bottom}
                        width={10}
                        height={point.yValue * ((chartBounds.top - chartBounds.bottom)/30)}
                        color="rgb(30, 110, 214)"
                      />
                    );
                  })
                }
                {
                  /*
                  <Bar
                    points={points.rrday}
                    chartBounds={chartBounds}
                    barWidth={10}
                    color="rgb(30, 110, 214)"
                  />
                  */
                }
                <Scatter
                  points={points.minimumGroundTemperature06}
                  radius={5}
                  color="rgb(176, 176, 0)"
                />
                { points.minimumTemperature.map((minTemp, index) => {
                    const maxTemp = points.maximumTemperature[index];
                    console.log(points.rrday);
                    if (minTemp.y && maxTemp.y) {
                      return (
                        <Rect
                          key={`minMaxTemperature-${minTemp.xValue}}`}
                          x={minTemp.x - 5}
                          y={minTemp.y}
                          width={10}
                          height={maxTemp.y - minTemp.y}
                          color="rgb(145, 0, 0)"
                        />
                      );
                    } else {
                      return null;
                    }
                  }
                )}
              </>
            )}
          </>
        )}
      </CartesianChart>
    </View>
  );
}

export default memo(DailyObservationChart);
