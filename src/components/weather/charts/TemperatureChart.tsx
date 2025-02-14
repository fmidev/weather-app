import React from 'react';
import { VictoryLine, VictoryGroup } from 'victory-native';
import { CustomTheme } from '@assets/colors';
import { useTheme } from '@react-navigation/native';
import chartTheme from '@assets/chartTheme';
import { ChartDataProps } from './types';

const TemperatureChart: React.FC<ChartDataProps> = ({
  chartValues,
  chartDomain,
  chartWidth,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { temperature, feelsLike, dewPoint } = chartValues;

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
    </VictoryGroup>
  );
};
export default TemperatureChart;
