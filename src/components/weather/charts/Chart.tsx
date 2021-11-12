import React, { useRef, useState } from 'react';

import { View, ScrollView, StyleSheet } from 'react-native';
import { VictoryChart, VictoryAxis, VictoryLabel } from 'victory-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { CustomTheme, GRAY_2 } from '@utils/colors';

import chartTheme from '@utils/chartTheme';
import { Config } from '@config';
import moment from 'moment';

import {
  chartTickValues,
  chartXDomain,
  chartYDomain,
  chartYLabelText,
  tickFormat,
} from '@utils/chart';

import {
  ChartData,
  ChartType,
  ChartValues,
  ChartMinMax,
  ChartSettings,
} from './types';
import ChartLegend from './Legend';
import TimeSelector from './TimeSelector';
import TemperatureChart from './TemperatureChart';
import PrecipitationChart from './PrecipitationChart';
import WindChart from './WindChart';
import HumidityChart from './HumidityChart';
import PressureChart from './PressureChart';
import VisCloudChart from './VisCloudChart';
import CloudHeightChart from './CloudHeightChart';

type ChartProps = {
  data: ChartData | false;
  chartType: ChartType;
  observation?: boolean;
};

const Chart: React.FC<ChartProps> = ({ data, chartType, observation }) => {
  const scrollRef = useRef() as React.MutableRefObject<ScrollView>;
  const [scrollIndex, setScrollIndex] = useState<number>(
    observation ? 24 * 20 : 0
  );
  const [initialized, setInitialized] = useState<boolean>(false);
  const [timeSelectorButtons, setTimeSelectorButtons] = useState<
    [boolean, boolean]
  >([false, true]);
  const { colors } = useTheme() as CustomTheme;
  const { i18n } = useTranslation();
  const config = Config.get('weather');
  moment.locale(i18n.language);

  if (!data || data.length === 0) {
    return null;
  }

  const stepLength = 20;

  const chartWidth =
    observation && config.observation.timePeriod
      ? config.observation.timePeriod * stepLength
      : data.length * stepLength;

  const tickInterval = 3;

  const chartSettings: ChartSettings = {
    precipitation: {
      params: ['precipitation1h'],
      component: PrecipitationChart,
    },
    pressure: {
      params: ['pressure'],
      component: PressureChart,
    },
    humidity: {
      params: ['humidity'],
      component: HumidityChart,
    },
    visCloud: {
      params: ['visibility', 'totalcloudcover'],
      component: VisCloudChart,
    },
    cloud: {
      params: ['cloudheight'],
      component: CloudHeightChart,
    },
    temperature: {
      params: ['temperature'],
      component: TemperatureChart,
    },
    temperatureFeels: {
      params: ['temperature', 'feelsLike'],
      component: TemperatureChart,
    },
    wind: {
      params: [
        'windspeedms',
        observation ? 'windgust' : 'hourlymaximumgust',
        'winddirection',
      ],
      component: WindChart,
    },
  };
  const ChartComponent = chartSettings[chartType].component;

  const minMax: ChartMinMax = [];

  const chartValues: ChartValues = {};
  chartSettings[chartType].params.forEach((param) => {
    chartValues[param] = data
      .map((step) => {
        const x = step.epochtime * 1000;
        // @ts-ignore
        const y = step[param];
        if (param !== 'winddirection') {
          minMax.push(y);
        }
        return { x, y };
      })
      .filter(({ y }) => y !== undefined);
  });

  const tickValues = chartTickValues(data, observation, tickInterval);
  const xDomain = chartXDomain(tickValues);
  const yDomain = chartYDomain(minMax, chartType);
  const yLabelText = chartYLabelText(chartType);

  const onMomentumScrollEnd = ({ nativeEvent }: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
    if (contentOffset.x === 0) {
      setTimeSelectorButtons([true, false]);
    } else if (
      contentSize.width - (contentOffset.x + layoutMeasurement.width) ===
      0
    ) {
      setTimeSelectorButtons([false, true]);
    } else {
      setTimeSelectorButtons([false, false]);
    }
    setScrollIndex(contentOffset.x);
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartRowContainer}>
        <View style={styles.yAxisContainer}>
          <VictoryChart height={300} width={50}>
            <VictoryAxis
              dependentAxis
              crossAxis={false}
              tickFormat={(t) => (t >= 10000 ? t / 1000 : t)}
              domain={yDomain}
              style={{
                tickLabels: {
                  fill: colors.primaryText,
                },
              }}
            />
            <VictoryLabel
              text={yLabelText}
              x={30}
              y={20}
              style={{ fill: colors.primaryText }}
            />
          </VictoryChart>
        </View>
        <ScrollView
          ref={scrollRef}
          onLayout={() => {
            if (!initialized) {
              if (observation) {
                scrollRef.current.scrollToEnd();
              }
              setInitialized(true);
            }
          }}
          onMomentumScrollEnd={onMomentumScrollEnd}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chartContainer}>
          <VictoryChart
            height={300}
            width={chartWidth}
            theme={chartTheme}
            scale={{ x: 'linear' }}>
            <VictoryAxis
              scale={{ x: 'linear' }}
              tickFormat={tickFormat}
              tickValues={tickValues}
              style={{
                grid: {
                  stroke: ({ tick }) =>
                    moment(tick).hour() === 0 ? GRAY_2 : '#E6E6E6',
                  strokeWidth: ({ tick }) =>
                    moment(tick).hour() === 0
                      ? chartTheme.axis.style.axis.strokeWidth + 1
                      : chartTheme.axis.style.axis.strokeWidth,
                  strokeDasharray: ({ tick }) =>
                    moment(tick).hour() === 0 ? 3 : 0,
                },
                tickLabels: { fill: colors.primaryText },
              }}
              offsetY={50}
            />
            <VictoryAxis
              dependentAxis
              crossAxis={false}
              tickFormat={() => ''}
              domain={yDomain}
            />
            {chartType === 'visCloud' && (
              <VictoryAxis
                dependentAxis
                crossAxis={false}
                orientation="right"
                tickCount={4}
                tickFormat={() => ''}
                tickValues={[15000, 30000, 45000, 60000]}
                style={{
                  tickLabels: {
                    fill: colors.primaryText,
                  },
                }}
              />
            )}

            <ChartComponent
              chartValues={chartValues}
              width={chartWidth}
              domain={xDomain}
            />
          </VictoryChart>
        </ScrollView>
        {chartType === 'visCloud' && (
          <View style={styles.yAxisContainer}>
            <VictoryChart height={300} width={50}>
              <VictoryAxis
                dependentAxis
                crossAxis={false}
                orientation="right"
                tickCount={4}
                tickFormat={(t) => `${(t / 60000) * 8}/8`}
                tickValues={[15000, 30000, 45000, 60000]}
                domain={yDomain}
                style={{
                  tickLabels: {
                    fill: colors.primaryText,
                  },
                }}
              />
            </VictoryChart>
          </View>
        )}
      </View>
      <ChartLegend chartType={chartType} />
      {!observation && (
        <TimeSelector
          scrollRef={scrollRef}
          scrollIndex={scrollIndex}
          setScrollIndex={setScrollIndex}
          buttonStatus={timeSelectorButtons}
          stepLength={stepLength}
        />
      )}
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
