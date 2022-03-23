import React, { memo } from 'react';
import chartTheme from '@utils/chartTheme';
import { VictoryAxis, VictoryChart } from 'victory-native';
import moment from 'moment';
import { useTheme } from '@react-navigation/native';
import { CustomTheme } from '@utils/colors';
import { tickFormat } from '@utils/chart';
import { ChartDataProps, ChartDomain, ChartType, ChartValues } from './types';

type ChartDataRendererProps = {
  chartDimensions: { x: number; y: number };
  tickValues: number[];
  chartDomain: ChartDomain;
  chartType: ChartType;
  chartValues: ChartValues;
  Component: React.FC<ChartDataProps>;
};
const ChartDataRenderer: React.FC<ChartDataRendererProps> = ({
  chartDimensions,
  tickValues,
  chartDomain,
  chartType,
  chartValues,
  Component,
}) => {
  const { colors } = useTheme() as CustomTheme;

  let yTickValues;
  if (chartType === 'precipitation') {
    yTickValues = [0, 0.2, 0.4, 0.6, 0.8, 1];
  }
  if (chartType === 'visCloud') {
    yTickValues = [0, 0.25, 0.5, 0.75, 1];
  }

  return (
    <VictoryChart
      height={chartDimensions.y}
      width={chartDimensions.x}
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
        domain={chartDomain}
        tickValues={yTickValues}
        style={{
          axis: {
            stroke: colors.chartGrid,
          },
          grid: {
            stroke: ({ tick }) =>
              chartType === 'temperature' && tick === 0
                ? colors.secondaryBorder
                : colors.chartGrid,
          },
        }}
      />
      {Component !== null && (
        <Component
          chartValues={chartValues}
          chartWidth={chartDimensions.x}
          chartDomain={chartDomain}
        />
      )}
    </VictoryChart>
  );
};

export default memo(ChartDataRenderer);
