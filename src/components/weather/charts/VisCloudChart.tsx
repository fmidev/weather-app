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
  const { totalcloudcover, visibility } = chartValues;
  const max = 60000;

  const normalizedCloudCover = totalcloudcover.map(({ x, y }) => ({
    x,
    y: y ? (y / 8) * max : 0,
  }));

  return (
    <VictoryGroup theme={chartTheme} width={width}>
      {normalizedCloudCover && normalizedCloudCover.length > 0 && (
        <VictoryBar
          data={normalizedCloudCover}
          domain={domain}
          key="secondary"
          alignment="middle"
          barWidth={3}
          style={{
            data: {
              fill: colors.secondaryText,
            },
          }}
        />
      )}
      {visibility && visibility.length > 0 && (
        <VictoryLine
          data={visibility}
          domain={domain}
          style={{ data: { stroke: colors.primaryText } }}
          interpolation="natural"
        />
      )}
    </VictoryGroup>
  );
};
export default VisCloudChart;
