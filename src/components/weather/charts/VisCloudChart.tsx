import React from 'react';
import {
  VictoryLine,
  VictoryBar,
  VictoryLabel,
  VictoryGroup,
} from 'victory-native';
import { CustomTheme } from '@utils/colors';
import { useTheme } from '@react-navigation/native';
import { ChartDataProps } from './types';

const VisCloudChart: React.FC<ChartDataProps> = ({
  chartValues,
  domain,
  animate,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { totalcloudcover, visibility } = chartValues;
  const max = 60000;

  const normalizedCloudCover = totalcloudcover.map(({ x, y }) => ({
    x,
    y: y ? (y / 8) * max : 0,
  }));

  return (
    <VictoryGroup>
      {normalizedCloudCover && normalizedCloudCover.length > 0 && (
        <VictoryBar
          data={normalizedCloudCover}
          key="secondary"
          domain={domain}
          animate={animate}
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
          animate={animate}
          style={{ data: { stroke: colors.primaryText } }}
          interpolation="natural"
        />
      )}

      <VictoryLabel
        text="km"
        x={30}
        y={20}
        style={{ fill: colors.primaryText }}
      />
    </VictoryGroup>
  );
};
export default VisCloudChart;
