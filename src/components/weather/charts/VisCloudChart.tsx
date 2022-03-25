import React from 'react';
import { VictoryLine, VictoryBar, VictoryGroup } from 'victory-native';
import { CustomTheme } from '@utils/colors';
import { useTheme } from '@react-navigation/native';
import chartTheme from '@utils/chartTheme';
import { ChartDataProps } from './types';

const VisCloudChart: React.FC<ChartDataProps> = ({
  chartValues,
  chartDomain,
  chartWidth,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { totalCloudCover, visibility } = chartValues;

  return (
    <VictoryGroup theme={chartTheme} width={chartWidth}>
      {totalCloudCover && totalCloudCover.length > 0 && (
        <VictoryBar
          data={totalCloudCover}
          domain={chartDomain}
          key="secondary"
          alignment="middle"
          barWidth={4}
          style={{
            data: {
              fill: colors.primaryText,
            },
          }}
          y={(datum) => (datum.y > 8 ? 1 : datum.y / 8)}
        />
      )}
      {visibility && visibility.length > 0 && (
        <VictoryLine
          data={visibility}
          domain={chartDomain}
          style={{
            data: { stroke: colors.chartSecondaryLine, strokeDasharray: '4' },
          }}
          interpolation="basis"
          y={(datum) => (datum.y !== null ? datum.y / 60000 : null)}
        />
      )}
    </VictoryGroup>
  );
};
export default VisCloudChart;
