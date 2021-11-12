import React from 'react';
import { VictoryLine, VictoryGroup } from 'victory-native';
import { CustomTheme } from '@utils/colors';
import { useTheme } from '@react-navigation/native';
import chartTheme from '@utils/chartTheme';
import { ChartDataProps } from './types';

const TemperatureChart: React.FC<ChartDataProps> = ({
  chartValues,
  domain,
  width,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { temperature, feelsLike } = chartValues;
  return (
    <VictoryGroup theme={chartTheme} width={width}>
      {temperature && temperature.length > 0 && (
        <VictoryLine
          data={temperature}
          domain={domain}
          style={{ data: { stroke: colors.primaryText } }}
          interpolation="natural"
        />
      )}
      {feelsLike && feelsLike.length > 0 && (
        <VictoryLine
          data={feelsLike}
          domain={domain}
          style={{
            data: { stroke: colors.chartSecondaryLine, strokeDasharray: '4' },
          }}
          interpolation="natural"
        />
      )}
    </VictoryGroup>
  );
};
export default TemperatureChart;