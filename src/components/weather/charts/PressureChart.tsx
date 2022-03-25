import React from 'react';
import { VictoryLine, VictoryGroup } from 'victory-native';
import { CustomTheme } from '@utils/colors';
import { useTheme } from '@react-navigation/native';
import chartTheme from '@utils/chartTheme';
import { ChartDataProps } from './types';

const PressureChart: React.FC<ChartDataProps> = ({
  chartValues,
  chartDomain,
  chartWidth,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { pressure } = chartValues;
  return (
    <VictoryGroup theme={chartTheme} width={chartWidth}>
      {pressure && pressure.length > 0 && (
        <VictoryLine
          data={pressure}
          domain={chartDomain}
          style={{ data: { stroke: colors.primaryText } }}
          interpolation="basis"
        />
      )}
    </VictoryGroup>
  );
};
export default PressureChart;
