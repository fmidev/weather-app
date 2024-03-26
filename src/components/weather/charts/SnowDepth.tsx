import React from 'react';
import { VictoryBar, VictoryGroup } from 'victory-native';
import { CustomTheme } from '@utils/colors';
import { useTheme } from '@react-navigation/native';
import chartTheme from '@utils/chartTheme';
import { ChartDataProps, ChartDomain } from './types';
import { useSelector } from 'react-redux';
import {
  selectDailyData,
  selectPreferredDailyParameters,
} from '@store/observation/selector';
import { dailyChartTickValues } from '@utils/chart';

// Snowdepth chart can use instant observations or daily observations

const SnowDepthChart: React.FC<ChartDataProps> = ({
  chartValues,
  chartDomain,
  chartWidth,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { snowDepth } = chartValues;

  const preferredDailyParameters = useSelector(selectPreferredDailyParameters);
  const dailySnowDepth = useSelector(selectDailyData).flatMap((item) => {
    return !item.snowDepth06
      ? []
      : { x: item.epochtime * 1000, y: item.snowDepth06 };
  });
  const isDaily = preferredDailyParameters.includes('snowDepth');

  const dailyTickValues = isDaily ? dailyChartTickValues(30) : [];
  const dailyChartDomain = {
    ...chartDomain,
    x: [dailyTickValues[0], dailyTickValues[dailyTickValues.length - 1]],
  } as ChartDomain;

  return (
    <VictoryGroup theme={chartTheme} width={chartWidth}>
      {((snowDepth && snowDepth.length > 0) || isDaily) && (
        <VictoryBar
          data={isDaily ? dailySnowDepth : snowDepth}
          domain={isDaily ? dailyChartDomain : chartDomain}
          key="secondary"
          alignment="middle"
          barWidth={isDaily ? 10 : 2}
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
