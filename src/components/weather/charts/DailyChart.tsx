import React from 'react';
import { VictoryBar, VictoryGroup, VictoryScatter } from 'victory-native';
import chartTheme from '@utils/chartTheme';
import { ChartDataProps } from './types';

const DailyChart: React.FC<ChartDataProps> = ({
  chartValues,
  chartDomain,
  chartWidth,
}) => {
  const {
    rrday,
    maximumTemperature,
    minimumTemperature,
    minimumGroundTemperature06,
  } = chartValues;

  return (
    <VictoryGroup theme={chartTheme} width={chartWidth}>
      {rrday && rrday.length > 0 && (
        <VictoryBar
          data={rrday.filter((dataItem) => dataItem?.y && dataItem.y >= 0)}
          domain={chartDomain}
          key="secondary"
          alignment="middle"
          barWidth={8}
          style={{
            data: {
              fill: 'rgb(30, 110, 214)',
              margin: 100,
            },
          }}
          y0={() =>
            Math.min(
              (chartDomain.y && chartDomain.y[0]) ?? 0,
              (chartDomain.y && chartDomain.y[1]) ?? 0
            )
          }
          y={(datum) =>
            Math.min(
              (chartDomain.y && chartDomain.y[0]) ?? 0,
              (chartDomain.y && chartDomain.y[1]) ?? 0
            ) + datum.y
          }
        />
      )}
      {maximumTemperature?.length > 0 && minimumTemperature?.length > 0 && (
        <VictoryBar
          alignment="middle"
          barWidth={8}
          domain={chartDomain}
          data={maximumTemperature.map((maxT, index) => ({
            x: maxT?.x ?? null,
            y: maxT?.y ?? null,
            y0: minimumTemperature[index]?.y ?? null,
          }))}
          style={{
            data: {
              fill: 'rgb(145, 0, 0)',
            },
          }}
        />
      )}
      {minimumGroundTemperature06 && minimumGroundTemperature06.length > 0 && (
        <VictoryScatter
          data={minimumGroundTemperature06}
          domain={chartDomain}
          size={4}
          style={{
            data: { fill: 'rgb(176, 176, 0)' },
          }}
        />
      )}
    </VictoryGroup>
  );
};

export default DailyChart;
