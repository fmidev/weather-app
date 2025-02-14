import React from 'react';
import { VictoryBar, VictoryGroup, VictoryScatter } from 'victory-native';
import chartTheme from '@assets/chartTheme';
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

  const rrdayData = rrday.filter((item) => item?.y && item.y >= 0);
  const extremeTemperaturesData = maximumTemperature.map((maxT, index) => ({
    x: maxT?.x ?? null,
    y: maxT?.y ?? null,
    y0: minimumTemperature[index]?.y ?? null,
  }));

  return (
    <VictoryGroup theme={chartTheme} width={chartWidth}>
      {rrdayData && rrdayData.length > 0 && (
        <VictoryBar
          data={rrday.filter((dataItem) => dataItem?.y && dataItem.y >= 0)}
          domain={chartDomain}
          key="secondary"
          alignment="start"
          barWidth={10}
          style={{
            data: {
              fill: 'rgb(30, 110, 214)',
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
          barWidth={10}
          domain={chartDomain}
          data={extremeTemperaturesData}
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
