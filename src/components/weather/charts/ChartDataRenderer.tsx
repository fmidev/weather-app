import React, { memo } from 'react';
import chartTheme from '@utils/chartTheme';
import { VictoryAxis, VictoryChart } from 'victory-native';
import moment from 'moment';
import { useTheme } from '@react-navigation/native';
import { CustomTheme } from '@utils/colors';
import { tickFormat } from '@utils/chart';
import { ClockType, UnitMap } from '@store/settings/types';
import { ChartDataProps, ChartDomain, ChartType, ChartValues } from './types';
import { Config } from '@config';

type ChartDataRendererProps = {
  chartDimensions: { x: number; y: number };
  tickValues: number[];
  chartDomain: ChartDomain;
  chartType: ChartType;
  chartValues: ChartValues;
  Component: React.FC<ChartDataProps>;
  locale: string;
  clockType: ClockType;
  isDaily: boolean;
  units?: UnitMap;
};
const ChartDataRenderer: React.FC<ChartDataRendererProps> = ({
  chartDimensions,
  tickValues,
  chartDomain,
  chartType,
  chartValues,
  Component,
  locale,
  clockType,
  isDaily,
  units,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const defaultUnits = Config.get('settings').units;

  let yTickValues;
  if (chartType === 'precipitation') {
    const precipitationUnit =
      units?.precipitation.unitAbb ?? defaultUnits.precipitation;
    yTickValues =
      precipitationUnit === 'in'
        ? [0, 0.1, 0.2, 0.3, 0.4, 0.5]
        : [0, 0.2, 0.4, 0.6, 0.8, 1];
  }
  if (chartType === 'visCloud') {
    yTickValues = [0, 0.25, 0.5, 0.75, 1];
  }

  const tickLabels = tickValues.map((value, index, arr) => {
    // Hide first and last tick label from daily chart
    if (isDaily && (index === 0 || index === arr.length - 1)) return '';
    return tickFormat(value, locale, clockType, isDaily);
  });

  return (
    <VictoryChart
      height={chartDimensions.y}
      width={chartDimensions.x}
      theme={chartTheme}
      scale={{ x: 'linear' }}>
      <VictoryAxis
        tickFormat={tickLabels}
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
              isDaily || moment(tick).hour() === 0 ? 'bold' : 'normal',
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
              (chartType === 'temperature' || isDaily) && tick === 0
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
          units={units}
        />
      )}
    </VictoryChart>
  );
};

export default memo(ChartDataRenderer);
