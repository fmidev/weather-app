import React from 'react';
import { VictoryLine, VictoryGroup } from 'victory-native';
import { CustomTheme } from '@assets/colors';
import { useTheme } from '@react-navigation/native';
import chartTheme from '@assets/chartTheme';
import { ChartDataProps } from './types';

const HumidityChart: React.FC<ChartDataProps> = ({
  chartValues,
  chartDomain,
  chartWidth,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { humidity, relativeHumidity } = chartValues;
  const humidityData = humidity?.length > 0 ? humidity : relativeHumidity;

  return (
    <VictoryGroup theme={chartTheme} width={chartWidth}>
      {humidityData && humidityData.length > 0 && (
        <VictoryLine
          data={humidityData}
          domain={chartDomain}
          style={{ data: { stroke: colors.primaryText } }}
          interpolation="basis"
        />
      )}
    </VictoryGroup>
  );
};
export default HumidityChart;
