import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {
  VictoryChart,
  VictoryAxis,
  VictoryLine,
  VictoryArea,
  VictoryLabel,
} from 'victory-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import Icon from '@components/common/Icon';

import { CustomTheme } from '@utils/colors';
import chartTheme from '@utils/chartTheme';
import { TimestepData } from '@store/forecast/types';

type WindLineChartProps = {
  data: TimestepData[];
};

const WindLineChart: React.FC<WindLineChartProps> = ({ data }) => {
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation();

  const windData = data.map((hour) => ({
    x: hour.epochtime,
    y: hour.windspeedms,
  }));

  const gustData = data.map((hour) => ({
    x: hour.epochtime,
    y: hour.hourlymaximumgust,
  }));

  const combinedData = data.map((hour) => ({
    x: hour.epochtime,
    y0: hour.windspeedms,
    y: hour.hourlymaximumgust,
  }));

  const hourGetter = (datum: any): string => {
    const date = new Date(datum.x * 1000);
    return `${date.getHours()}`;
  };

  const max = Math.max(...windData.map((d) => d.y));

  const WindLabel = (asd: any) => {
    const index = Number(asd.index);
    const windDir = data[index]?.winddirection;
    return (
      <View style={[styles.arrowStyle, { left: asd.x - 10 }]}>
        <Icon
          name="wind-arrow"
          width={20}
          height={20}
          style={{
            color: colors.primaryText,
            transform: [
              {
                rotate: `${windDir + 45 - 180}deg`,
              },
            ],
          }}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <VictoryChart
        height={300}
        theme={chartTheme}
        padding={{ top: 50, right: 50, left: 50, bottom: 35 }}>
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
          domain={[0, max + 2]}
          style={{
            tickLabels: {
              fill: colors.primaryText,
            },
          }}
        />
        <VictoryArea
          data={combinedData}
          x={hourGetter}
          style={{ data: { fill: '#d8d8d8' } }}
          animate={{ duration: 500, onLoad: { duration: 250 } }}
        />
        <VictoryLine
          data={windData}
          labels={({ datum }) => `${datum}`}
          labelComponent={<WindLabel />}
          domain={{ y: [0, 8] }}
          animate={{ duration: 500, onLoad: { duration: 250 } }}
          style={{ data: { stroke: colors.primaryText } }}
          x={hourGetter}
          interpolation="natural"
        />
        <VictoryLine
          data={gustData}
          domain={{ y: [0, 25] }}
          animate={{ duration: 500, onLoad: { duration: 250 } }}
          style={{
            data: {
              stroke: colors.chartSecondaryLine,
              strokeDasharray: '4',
            },
          }}
          x={hourGetter}
          interpolation="natural"
        />
        <VictoryLabel
          text="m/s"
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
            {t('forecast:charts:windSpeed')} (m/s)
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
            {t('forecast:charts:windGust')} (m/s)
          </Text>
        </View>
        <View style={styles.legendRow}>
          <Icon
            name="wind-arrow"
            width={20}
            height={20}
            style={[
              styles.iconMargin,
              {
                color: colors.primaryText,
              },
            ]}
          />
          <Text style={[styles.legendText, { color: colors.primaryText }]}>
            {t('forecast:charts:windDirection')}
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
  arrowStyle: {
    position: 'absolute',
    top: 25,
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
  iconMargin: {
    marginLeft: -4,
  },
});

export default WindLineChart;
