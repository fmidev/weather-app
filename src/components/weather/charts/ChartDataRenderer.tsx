import React, { memo } from 'react';
import chartTheme from '@utils/chartTheme';
import { VictoryAxis, VictoryChart } from 'victory-native';
import moment from 'moment';
import { useTheme } from '@react-navigation/native';
import { CustomTheme } from '@utils/colors';
import { tickFormat } from '@utils/chart';
import { ChartDataProps, ChartDomain, ChartType, ChartValues } from './types';

type ChartDataRendererProps = {
  chartWidth: number;
  tickValues: number[];
  chartDomain: {
    y: ChartDomain;
    x: ChartDomain;
  };
  chartType: ChartType;
  chartValues: ChartValues;
  Component: React.FC<ChartDataProps>;
};
const ChartDataRenderer: React.FC<ChartDataRendererProps> = ({
  chartWidth,
  tickValues,
  chartDomain,
  chartType,
  chartValues,
  Component,
}) => {
  const { colors } = useTheme() as CustomTheme;

  return (
    <VictoryChart
      height={300}
      width={chartWidth}
      theme={chartTheme}
      scale={{ x: 'linear' }}>
      <VictoryAxis
        scale={{ x: 'linear' }}
        tickFormat={tickFormat}
        tickValues={tickValues}
        orientation="bottom"
        style={{
          grid: {
            stroke: ({ tick }) =>
              moment(tick).hour() === 0
                ? colors.chartGridDay
                : colors.chartGrid,
            strokeDasharray: ({ tick }) => (moment(tick).hour() === 0 ? 3 : 0),
          },
          tickLabels: {
            fill: colors.hourListText,
            fontWeight: ({ tick }) =>
              moment(tick).hour() === 0 ? 'bold' : 'normal',
          },
        }}
        offsetY={50}
      />
      <VictoryAxis
        dependentAxis
        crossAxis={false}
        tickFormat={() => ''}
        domain={chartDomain.y}
        style={{
          axis: {
            stroke: colors.chartGrid,
          },
          grid: {
            stroke: colors.chartGrid,
          },
        }}
      />
      {chartType === 'visCloud' && (
        <VictoryAxis
          dependentAxis
          crossAxis={false}
          orientation="right"
          tickCount={4}
          tickFormat={() => ''}
          tickValues={[15000, 30000, 45000, 60000]}
          style={{
            axis: {
              stroke: colors.chartGrid,
            },
            grid: {
              stroke: colors.chartGrid,
            },
          }}
        />
      )}

      {Component !== null && (
        <Component
          chartValues={chartValues}
          width={chartWidth}
          domain={chartDomain.x}
        />
      )}
    </VictoryChart>
  );
};

export default memo(ChartDataRenderer);
