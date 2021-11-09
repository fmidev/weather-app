import React from 'react';
import { VictoryLine, VictoryLabel, VictoryGroup } from 'victory-native';
import { CustomTheme } from '@utils/colors';
import { useTheme } from '@react-navigation/native';
import { ChartDataProps } from './types';

const HumidityChart: React.FC<ChartDataProps> = ({
  chartValues,
  domain,
  animate,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { humidity } = chartValues;
  return (
    <VictoryGroup>
      {humidity && humidity.length > 0 && (
        <VictoryLine
          data={humidity}
          domain={domain}
          animate={animate}
          style={{ data: { stroke: colors.primaryText } }}
          interpolation="natural"
        />
      )}
      <VictoryLabel
        text="%"
        x={30}
        y={20}
        style={{ fill: colors.primaryText }}
      />
    </VictoryGroup>
  );
};
export default HumidityChart;
