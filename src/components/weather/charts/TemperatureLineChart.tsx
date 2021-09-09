import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryLabel,
} from 'victory-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { CustomTheme } from '@utils/colors';
import { TimestepData } from '@store/forecast/types';
import chartTheme from '@utils/chartTheme';

type TemperatureLineChartProps = {
  data: TimestepData[];
};

const TemperatureLineChart: React.FC<TemperatureLineChartProps> = ({
  data,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation();

  const temperatureData = data.map((hour) => ({
    x: hour.epochtime,
    y: hour.temperature,
  }));

  const feelsLikeData = data.map((hour) => ({
    x: hour.epochtime,
    y: hour.feelsLike,
  }));

  const hourGetter = (datum: any): string => {
    const date = new Date(datum.x * 1000);
    return `${date.getHours()}`;
  };

  const max = Math.max(
    ...temperatureData.concat(feelsLikeData).map((d) => d.y)
  );
  const min = Math.min(
    ...temperatureData.concat(feelsLikeData).map((d) => d.y)
  );

  // TODO: refine logic
  const domainMax = max >= 25 ? max + 5 : 25;
  const domainMin = min <= -5 ? min - 5 : -5;

  return (
    <View style={styles.container}>
      <VictoryChart height={300} theme={chartTheme}>
        <VictoryAxis
          fixLabelOverlap
          style={{
            tickLabels: {
              fill: ({ index }: { index: string | number }) =>
                Number(index) === 0 ? 'none' : colors.primaryText,
            },
          }}
          offsetY={50}
        />
        <VictoryAxis
          dependentAxis
          crossAxis={false}
          domain={[domainMin, domainMax]}
          style={{
            tickLabels: {
              fill: colors.primaryText,
            },
          }}
        />
        <VictoryLine
          data={temperatureData}
          domain={{ y: [0, 25] }}
          animate={{ duration: 500, onLoad: { duration: 250 } }}
          style={{ data: { stroke: colors.primaryText } }}
          x={hourGetter}
          interpolation="natural"
        />

        <VictoryLine
          data={feelsLikeData}
          domain={{ y: [0, 25] }}
          animate={{ duration: 500, onLoad: { duration: 250 } }}
          style={{
            data: { stroke: colors.chartSecondaryLine, strokeDasharray: '4' },
          }}
          x={hourGetter}
          interpolation="natural"
        />
        <VictoryLabel
          text="°C"
          x={30}
          y={20}
          style={{ fill: colors.primaryText }}
        />
      </VictoryChart>
      <View style={styles.legendContainer}>
        <View style={styles.legendRow}>
          <View
            style={[
              styles.legendLine,
              {
                backgroundColor: colors.primaryText,
              },
            ]}
          />
          <Text style={[styles.legendText, { color: colors.primaryText }]}>
            {t('forecast:charts:temperature')} (°C)
          </Text>
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendRow}>
            <View
              style={[
                styles.legendLineBlock,
                styles.withMarginRight,
                { backgroundColor: colors.chartSecondaryLine },
              ]}
            />
            <View
              style={[
                styles.legendLineBlock,
                styles.withMarginRight,
                { backgroundColor: colors.chartSecondaryLine },
              ]}
            />
            <View
              style={[
                styles.legendLineBlock,
                { backgroundColor: colors.chartSecondaryLine },
              ]}
            />
          </View>
          <Text style={[styles.legendText, { color: colors.primaryText }]}>
            {t('forecast:charts:feelsLike')} (°C)
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  legendLine: {
    width: 16,
    height: 3,
  },
  legendText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    marginLeft: 16,
  },
  legendLineBlock: {
    width: 4,
    height: 3,
  },
  withMarginRight: {
    marginRight: 2,
  },
});

export default TemperatureLineChart;
