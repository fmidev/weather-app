import React from 'react';
import { VictoryLine, VictoryLabel, VictoryGroup } from 'victory-native';
import { CustomTheme } from '@utils/colors';
import { useTheme } from '@react-navigation/native';
import { ChartDataProps } from './types';

const CloudHeightChart: React.FC<ChartDataProps> = ({
  chartValues,
  domain,
  animate,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { cloudheight } = chartValues;

  return (
    <VictoryGroup>
      {cloudheight && cloudheight.length > 0 && (
        <VictoryLine
          data={cloudheight}
          domain={domain}
          animate={animate}
          style={{ data: { stroke: colors.primaryText } }}
          interpolation="natural"
        />
      )}
      <VictoryLabel
        text="m"
        x={30}
        y={20}
        style={{ fill: colors.primaryText }}
      />
    </VictoryGroup>
  );
};
export default CloudHeightChart;
