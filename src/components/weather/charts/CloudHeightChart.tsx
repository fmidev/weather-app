import React from 'react';
import { VictoryLine, VictoryGroup } from 'victory-native';
import { CustomTheme } from '@utils/colors';
import { useTheme } from '@react-navigation/native';
import chartTheme from '@utils/chartTheme';
import { ChartDataProps } from './types';

const CloudHeightChart: React.FC<ChartDataProps> = ({
  chartValues,
  domain,
  width,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { cloudheight } = chartValues;

  return (
    <VictoryGroup theme={chartTheme} width={width}>
      {cloudheight && cloudheight.length > 0 && (
        <VictoryLine
          data={cloudheight}
          domain={domain}
          style={{ data: { stroke: colors.primaryText } }}
          interpolation="natural"
        />
      )}
    </VictoryGroup>
  );
};
export default CloudHeightChart;
