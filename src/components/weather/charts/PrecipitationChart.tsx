import React from 'react';
import { VictoryBar, VictoryGroup, VictoryLine } from 'victory-native';
import { getPrecipitationLevel } from '@utils/helpers';
import chartTheme from '@assets/chartTheme';
import { useTheme } from '@react-navigation/native';
import { CustomTheme } from '@assets/colors';
import { ChartDataProps } from './types';
import { Config } from '@config';

const PrecipitationChart: React.FC<ChartDataProps> = ({
  chartValues,
  chartDomain,
  chartWidth,
  units,
}) => {
  const defaultUnits = Config.get('settings').units;
  const precipitationUnit =
    units?.precipitation.unitAbb ?? defaultUnits.precipitation;

  const { colors } = useTheme() as CustomTheme;
  const { precipitation1h, pop } = chartValues;

  const tickValues = precipitation1h
    .flatMap(({ y }) => y)
    .filter((v): v is number => v !== undefined && v !== null);
  let maxTick =
    precipitationUnit !== 'in'
      ? Math.ceil((Math.max(...tickValues) + 1) / 5) * 5
      : 0.25;
  let popDivider = precipitationUnit === 'in' ? 400 : 100;

  return (
    <VictoryGroup theme={chartTheme} width={chartWidth}>
      {precipitation1h && precipitation1h.length > 0 && (
        <VictoryBar
          data={precipitation1h}
          domain={chartDomain}
          alignment="middle"
          barWidth={6}
          style={{
            data: {
              fill: ({ datum }) =>
                colors.rain[getPrecipitationLevel(datum.y, precipitationUnit)],
            },
          }}
          y={(datum) => {
            return precipitationUnit === 'in' ? datum.y : datum.y / maxTick;
          }}
        />
      )}
      {pop && pop.length > 0 && (
        <VictoryLine
          data={pop}
          domain={chartDomain}
          style={{
            data: { stroke: colors.chartPrimaryLine, strokeDasharray: '2' },
          }}
          /*
          // @ts-ignore */
          y={(datum) => (datum.y !== null ? datum.y / popDivider : null)}
          interpolation="basis"
        />
      )}
    </VictoryGroup>
  );
};

export default PrecipitationChart;
