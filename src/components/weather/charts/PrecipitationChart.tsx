import React from 'react';
import { VictoryBar, VictoryLabel, VictoryGroup } from 'victory-native';
import { CustomTheme } from '@utils/colors';
import { useTheme } from '@react-navigation/native';
import { getPrecipitationColorOrTransparent } from '@utils/helpers';
import { ChartDataProps } from './types';

const PrecipitationChart: React.FC<ChartDataProps> = ({
  chartValues,
  domain,
  animate,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { precipitation1h } = chartValues;

  return (
    <VictoryGroup>
      {precipitation1h && precipitation1h.length > 0 && (
        <VictoryBar
          data={precipitation1h}
          domain={domain}
          animate={animate}
          alignment="middle"
          barWidth={6}
          style={{
            data: {
              fill: ({ datum }) => getPrecipitationColorOrTransparent(datum.y),
            },
          }}
        />
      )}
      <VictoryLabel
        text="mm"
        x={30}
        y={20}
        style={{ fill: colors.primaryText }}
      />
    </VictoryGroup>
  );
};

export default PrecipitationChart;
