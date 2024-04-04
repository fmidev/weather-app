import React from 'react';
import { VictoryLine, VictoryBar, VictoryGroup } from 'victory-native';
import { CustomTheme } from '@utils/colors';
import { useTheme } from '@react-navigation/native';
import chartTheme from '@utils/chartTheme';
import { getPrecipitationLevel } from '@utils/helpers';
import { ChartDataProps } from './types';

const WeatherChart: React.FC<ChartDataProps> = ({
  chartValues,
  chartDomain,
  chartWidth,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { temperature, feelsLike, dewPoint, precipitation1h } = chartValues;

  const precipitationValues = precipitation1h
    .flatMap(({ y }) => y)
    .filter((v): v is number => v !== undefined && v !== null);
  const maxTick = Math.ceil((Math.max(...precipitationValues) + 1) / 5) * 5;

  return (
    <VictoryGroup theme={chartTheme} width={chartWidth}>
      {temperature && temperature.length > 0 && (
        <VictoryLine
          data={temperature}
          domain={chartDomain}
          style={{ data: { stroke: colors.chartPrimaryLine } }}
          interpolation="basis"
        />
      )}
      {feelsLike && feelsLike.length > 0 && (
        <VictoryLine
          data={feelsLike}
          domain={chartDomain}
          style={{
            data: { stroke: colors.chartSecondaryLine, strokeDasharray: '4' },
          }}
          interpolation="basis"
        />
      )}
      {dewPoint && dewPoint.length > 0 && (
        <VictoryLine
          data={dewPoint}
          domain={chartDomain}
          style={{
            data: { stroke: colors.chartPrimaryLine, strokeDasharray: '2' },
          }}
          interpolation="basis"
        />
      )}
      {precipitation1h && precipitation1h.length > 0 && (
        <VictoryBar
          data={precipitation1h}
          domain={chartDomain}
          alignment="middle"
          barWidth={6}
          style={{
            data: {
              fill: ({ datum }) => colors.rain[getPrecipitationLevel(datum.y)],
            },
          }}
          y={(datum) => datum.y / maxTick}
        />
      )}
    </VictoryGroup>
  );
};
export default WeatherChart;
