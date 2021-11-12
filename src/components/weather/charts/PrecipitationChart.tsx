import React from 'react';
import { VictoryBar, VictoryGroup } from 'victory-native';
import { getPrecipitationColorOrTransparent } from '@utils/helpers';
import chartTheme from '@utils/chartTheme';
import { ChartDataProps } from './types';

const PrecipitationChart: React.FC<ChartDataProps> = ({
  chartValues,
  domain,
  width,
}) => {
  const { precipitation1h } = chartValues;

  return (
    <VictoryGroup theme={chartTheme} width={width}>
      {precipitation1h && precipitation1h.length > 0 && (
        <VictoryBar
          data={precipitation1h}
          domain={domain}
          alignment="middle"
          barWidth={6}
          style={{
            data: {
              fill: ({ datum }) => getPrecipitationColorOrTransparent(datum.y),
            },
          }}
        />
      )}
    </VictoryGroup>
  );
};

export default PrecipitationChart;
