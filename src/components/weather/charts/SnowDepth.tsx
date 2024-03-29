import React from 'react';
import { VictoryBar, VictoryGroup } from 'victory-native';
import { CustomTheme } from '@utils/colors';
import { useTheme } from '@react-navigation/native';
import chartTheme from '@utils/chartTheme';
import { ChartDataProps } from './types';

const SnowDepthChart: React.FC<ChartDataProps> = ({
  chartValues,
  chartDomain,
  chartWidth,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { snowDepth } = chartValues;

  return (
    <VictoryGroup theme={chartTheme} width={chartWidth}>
      {snowDepth && snowDepth.length > 0 && (
        <VictoryBar
          data={snowDepth}
          domain={chartDomain}
          key="secondary"
          alignment="middle"
          barWidth={2}
          style={{
            data: {
              fill: colors.primaryText,
            },
          }}
        />
      )}
    </VictoryGroup>
  );
};
export default SnowDepthChart;
