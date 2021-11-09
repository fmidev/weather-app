import React from 'react';
import { VictoryLine, VictoryLabel, VictoryGroup } from 'victory-native';
import { CustomTheme } from '@utils/colors';
import { useTheme } from '@react-navigation/native';
import { ChartDataProps } from './types';

const TemperatureChart: React.FC<ChartDataProps> = ({
  chartValues,
  domain,
  animate,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { temperature, feelsLike } = chartValues;
  return (
    <VictoryGroup>
      {temperature && temperature.length > 0 && (
        <VictoryLine
          data={temperature}
          domain={domain}
          animate={animate}
          style={{ data: { stroke: colors.primaryText } }}
          interpolation="natural"
        />
      )}
      {feelsLike && temperature.length > 0 && (
        <VictoryLine
          data={feelsLike}
          domain={domain}
          animate={animate}
          style={{
            data: { stroke: colors.chartSecondaryLine, strokeDasharray: '4' },
          }}
          interpolation="natural"
        />
      )}
      <VictoryLabel
        text="°C"
        x={30}
        y={20}
        style={{ fill: colors.primaryText }}
      />
    </VictoryGroup>
  );
};
export default TemperatureChart;
