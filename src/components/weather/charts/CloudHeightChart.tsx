import React from 'react';
import { VictoryLine, VictoryGroup } from 'victory-native';
import { CustomTheme } from '@utils/colors';
import { useTheme } from '@react-navigation/native';
import chartTheme from '@utils/chartTheme';
import { ChartDataProps } from './types';

const CloudHeightChart: React.FC<ChartDataProps> = ({
  chartValues,
  chartDomain,
  chartWidth,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { cloudHeight } = chartValues;

  return (
    <VictoryGroup theme={chartTheme} width={chartWidth}>
      {cloudHeight && cloudHeight.length > 0 && (
        <VictoryLine
          data={cloudHeight}
          domain={chartDomain}
          style={{ data: { stroke: colors.primaryText } }}
          interpolation="basis"
        />
      )}
    </VictoryGroup>
  );
};
export default CloudHeightChart;
