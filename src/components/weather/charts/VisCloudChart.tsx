import React from 'react';
import { VictoryLine, VictoryBar, VictoryGroup } from 'victory-native';
import { CustomTheme } from '@utils/colors';
import { useTheme } from '@react-navigation/native';
import chartTheme from '@utils/chartTheme';
import { ChartDataProps } from './types';

const VisCloudChart: React.FC<ChartDataProps> = ({
  chartValues,
  domain,
  width,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { totalCloudCover, visibility } = chartValues;
  const max = 60000;

  const normalizedCloudCover =
    totalCloudCover?.map(({ x, y }) => {
      let value = null;
      if (y && y <= 8) {
        value = (y / 8) * max;
      } else if (y) {
        value = max;
      }

      return {
        x,
        y: value,
      };
    }) || [];
  return (
    <VictoryGroup theme={chartTheme} width={width}>
      {normalizedCloudCover && normalizedCloudCover.length > 0 && (
        <VictoryBar
          data={normalizedCloudCover}
          domain={domain}
          key="secondary"
          alignment="middle"
          barWidth={4}
          style={{
            data: {
              fill: colors.primaryText,
            },
          }}
        />
      )}
      {visibility && visibility.length > 0 && (
        <VictoryLine
          data={visibility}
          domain={domain}
          style={{
            data: { stroke: colors.chartSecondaryLine, strokeDasharray: '4' },
          }}
          interpolation="natural"
        />
      )}
    </VictoryGroup>
  );
};
export default VisCloudChart;
