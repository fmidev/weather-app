import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { View, ScrollView, StyleSheet } from 'react-native';
import { VictoryChart, VictoryAxis, VictoryLabel } from 'victory-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { CustomTheme } from '@utils/colors';
import {
  chartTickValues,
  chartXDomain,
  chartYDomain,
  chartYLabelText,
} from '@utils/chart';

import { Config } from '@config';
import { ChartData, ChartType, ChartValues, ChartMinMax } from './types';
import ChartLegend from './Legend';
import chartSettings from './settings';
import ChartDataRenderer from './ChartDataRenderer';

type ChartProps = {
  data: ChartData;
  chartType: ChartType;
  observation?: boolean;
  activeDayIndex?: number;
  setActiveDayIndex?: (i: number) => void;
  currentDayOffset?: number;
};

const Chart: React.FC<ChartProps> = ({
  data,
  chartType,
  observation,
  activeDayIndex,
  setActiveDayIndex,
  currentDayOffset,
}) => {
  const scrollRef = useRef() as React.MutableRefObject<ScrollView>;
  const [scrollIndex, setScrollIndex] = useState<number>(
    observation ? 24 * 20 : 0
  );
  const { colors } = useTheme() as CustomTheme;
  const { t, i18n } = useTranslation('weather');
  moment.locale(i18n.language);

  const { timePeriod, parameters: obsParameters } =
    Config.get('weather').observation;

  const tickInterval = observation && timePeriod && timePeriod > 24 ? 1 : 3;
  const stepLength = tickInterval === 1 ? 20 : 8;

  const chartWidth =
    observation && timePeriod
      ? timePeriod * stepLength
      : data.length * stepLength;

  const calculateDayIndex = useCallback(
    (index: number) =>
      Math.ceil((index / stepLength - (currentDayOffset || 0) + 1) / 24),
    [currentDayOffset, stepLength]
  );

  useEffect(() => {
    if (currentDayOffset && activeDayIndex !== undefined) {
      const dayIndex = calculateDayIndex(scrollIndex);
      if (activeDayIndex === 0 && dayIndex !== activeDayIndex) {
        scrollRef.current.scrollTo({ x: 0, animated: true });
      }
      if (activeDayIndex > 0 && dayIndex !== activeDayIndex) {
        const off = currentDayOffset * stepLength;
        const offsetX = off + (activeDayIndex - 1) * 24 * stepLength;
        scrollRef.current.scrollTo({ x: offsetX, animated: true });
      }
    }
  }, [
    activeDayIndex,
    stepLength,
    currentDayOffset,
    scrollIndex,
    calculateDayIndex,
  ]);

  const { Component, params } = useMemo(
    () => chartSettings(chartType, observation),
    [chartType, observation]
  );

  const { chartValues, chartMinMax } = useMemo(() => {
    const minMax: ChartMinMax = [];
    const values: ChartValues = {};

    params.forEach((param) => {
      values[param] = (
        data?.map((step) => {
          const x = step.epochtime * 1000;
          // @ts-ignore
          const y = step[param];
          if (param !== 'windDirection') {
            minMax.push(y);
          }
          return { x, y };
        }) || []
      ).filter(({ y }) => y !== undefined);
    });

    return { chartValues: values, chartMinMax: minMax };
  }, [data, params]);

  const tickValues = useMemo(
    () => chartTickValues(data, tickInterval),
    [data, tickInterval]
  );

  const chartDomain = useMemo(
    () => ({
      y: chartYDomain(chartMinMax, chartType),
      x: chartXDomain(tickValues),
    }),
    [chartType, chartMinMax, tickValues]
  );

  const yLabelText = chartYLabelText(chartType);

  const onMomentumScrollEnd = ({ nativeEvent }: any) => {
    const { contentOffset } = nativeEvent;
    setScrollIndex(contentOffset.x);
    if (currentDayOffset && setActiveDayIndex) {
      let dayIndex = calculateDayIndex(contentOffset.x);
      dayIndex = dayIndex >= 0 ? dayIndex : 0;

      if (dayIndex !== activeDayIndex) {
        setActiveDayIndex(dayIndex);
      }
    }
  };

  const onLayout = () => {
    if (observation) {
      scrollRef.current.scrollToEnd();
    }
  };

  return (
    <View
      style={styles.container}
      accessible
      accessibilityLabel={t('charts.accessibilityLabel')}
      accessibilityHint={t('charts.accessibilityHint')}>
      <View style={styles.chartRowContainer}>
        <View style={styles.yAxisContainer}>
          <VictoryChart height={300} width={45}>
            <VictoryAxis
              dependentAxis
              crossAxis={false}
              tickFormat={(tick) => (tick >= 10000 ? tick / 1000 : tick)}
              domain={chartDomain.y}
              style={{
                tickLabels: {
                  fill: colors.hourListText,
                },
              }}
            />
            <VictoryLabel
              text={yLabelText}
              x={40}
              y={20}
              textAnchor="end"
              style={{ fill: colors.hourListText }}
            />
          </VictoryChart>
        </View>
        <ScrollView
          ref={scrollRef}
          onLayout={onLayout}
          onMomentumScrollEnd={onMomentumScrollEnd}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chartContainer}>
          <ChartDataRenderer
            chartWidth={chartWidth}
            tickValues={tickValues}
            chartDomain={chartDomain}
            chartType={chartType}
            Component={Component}
            chartValues={chartValues}
          />
        </ScrollView>
        {chartType === 'visCloud' &&
          obsParameters?.includes('totalCloudCover') && (
            <View style={styles.yAxisContainer}>
              <VictoryChart height={300} width={45}>
                <VictoryAxis
                  dependentAxis
                  crossAxis={false}
                  orientation="right"
                  tickCount={4}
                  tickFormat={(tick) => `${(tick / 60000) * 8}/8`}
                  tickValues={[15000, 30000, 45000, 60000]}
                  domain={chartDomain.y}
                  style={{
                    tickLabels: {
                      fill: colors.hourListText,
                    },
                  }}
                />
              </VictoryChart>
            </View>
          )}
      </View>
      <ChartLegend chartType={chartType} observation={observation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  chartRowContainer: {
    flexDirection: 'row',
  },
  yAxisContainer: {},
  chartContainer: {
    paddingStart: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
  },
});

export default Chart;
