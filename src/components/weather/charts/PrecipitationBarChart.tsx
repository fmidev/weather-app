import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {
  VictoryChart,
  VictoryAxis,
  VictoryBar,
  VictoryLabel,
} from 'victory-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { CustomTheme } from '@utils/colors';
import chartTheme from '@utils/chartTheme';
import { TimestepData } from '@store/forecast/types';

type PrecipitationBarChartProps = {
  data: TimestepData[];
};

const PrecipitationBarChart: React.FC<PrecipitationBarChartProps> = ({
  data,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation();

  const hourGetter = (datum: any): string => {
    const date = new Date(datum.x * 1000);
    return `${date.getHours()}`;
  };

  const precipitationData = data.map((hour) => ({
    x: hour.epochtime,
    y: hour.precipitation1h,
  }));

  // const hasPrecipitation = precipitationData.some((datum) => datum.y > 0);

  // TODO: use hasPrecipitation somehow to indicate no rain

  const max = Math.max(...precipitationData.map((d) => d.y));

  return (
    <View style={styles.container}>
      <VictoryChart
        height={300}
        padding={{ top: 50, right: 50, left: 50, bottom: 35 }}
        theme={chartTheme}>
        <VictoryAxis
          fixLabelOverlap
          style={{
            tickLabels: {
              fill: ({ index }: { index: string | number }) =>
                Number(index) === 0 ? 'none' : colors.primaryText,
            },
          }}
        />

        <VictoryAxis
          dependentAxis
          domain={[0, max + 0.1]}
          style={{
            tickLabels: {
              fill: colors.primaryText,
            },
          }}
        />
        <VictoryBar
          data={precipitationData}
          animate={{ duration: 500, onLoad: { duration: 250 } }}
          style={{ data: { fill: colors.primaryText } }}
          x={hourGetter}
        />
        <VictoryLabel
          text="mm"
          x={30}
          y={20}
          style={{ fill: colors.primaryText }}
        />
      </VictoryChart>
      <View style={styles.legendContainer}>
        <View style={styles.legendRow}>
          <View
            style={[
              styles.legendBlock,
              {
                backgroundColor: colors.primaryText,
              },
            ]}
          />
          <Text style={[styles.legendText, { color: colors.primaryText }]}>
            {t('forecast:charts:precipitation')} (mm)
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    flex: 1,
    alignSelf: 'flex-start',
    marginLeft: 16,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBlock: {
    width: 12,
    height: 12,
  },
  legendText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    marginLeft: 16,
  },
});

export default PrecipitationBarChart;
