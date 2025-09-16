import React, { memo } from 'react';
import { View } from 'react-native';
import { CartesianChart, Bar } from 'victory-native';

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
  console.log(chartValues);

  const chartPadding = 16;
  const data = chartValues.map((item) => ({
    ...item,
    epochtime: item.epochtime ? item.epochtime * 1000 : undefined
  }));

  const yAxis = [{
    font,
    domain: chartType === 'visCloud' ? [0, 40000 ] : chartDomain.y,
    yKeys: ['minimumTemperature', 'maximumTemperature', 'snowDepth06'],
    axisSide: 'left',
  }];
  if (chartType === 'daily') {
    yAxis.push({
      font,
      domain: [0, 100],
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
        yKeys={['minimumTemperature', 'maximumTemperature', 'snowDepth06', 'rrday']}
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
            { (chartType === 'snowDepth') && (
              <Bar
                points={points.snowDepth06}
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

export default memo(DailyObservationChart);
