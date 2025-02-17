import React from 'react';
import { VictoryLine, VictoryGroup } from 'victory-native';
import { CustomTheme } from '@assets/colors';
import { useTheme } from '@react-navigation/native';
import chartTheme from '@assets/chartTheme';
import { ChartDataProps } from './types';

const UvChart: React.FC<ChartDataProps> = ({
  chartValues,
  chartDomain,
  chartWidth,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { uvCumulated } = chartValues;
  return (
    <VictoryGroup theme={chartTheme} width={chartWidth}>
      {uvCumulated && uvCumulated.length > 0 && (
        <VictoryLine
          data={uvCumulated}
          domain={chartDomain}
          style={{ data: { stroke: colors.primaryText } }}
          interpolation="basis"
        />
      )}
    </VictoryGroup>
  );
};
export default UvChart;
