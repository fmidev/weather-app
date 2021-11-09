import React from 'react';
import { VictoryLine, VictoryLabel, VictoryGroup } from 'victory-native';
import { CustomTheme } from '@utils/colors';
import { useTheme } from '@react-navigation/native';
import { ChartDataProps } from './types';

const PressureChart: React.FC<ChartDataProps> = ({
  chartValues,
  domain,
  animate,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { pressure } = chartValues;
  return (
    <VictoryGroup>
      {pressure && pressure.length > 0 && (
        <VictoryLine
          data={pressure}
          domain={domain}
          animate={animate}
          style={{ data: { stroke: colors.primaryText } }}
          interpolation="natural"
        />
      )}
      <VictoryLabel
        text="hPa"
        x={30}
        y={20}
        style={{ fill: colors.primaryText }}
      />
    </VictoryGroup>
  );
};
export default PressureChart;
