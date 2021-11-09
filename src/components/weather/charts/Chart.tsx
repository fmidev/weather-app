import React from 'react';

import { View, StyleSheet, Text } from 'react-native';
import {
  VictoryChart,
  VictoryAxis,
  VictoryZoomContainer,
} from 'victory-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { CustomTheme, GRAY_2 } from '@utils/colors';

import chartTheme from '@utils/chartTheme';
import moment from 'moment';

import {
  chartTickValues,
  chartXDomain,
  chartYDomain,
  tickFormat,
} from '@utils/chart';

import {
  ChartData,
  ChartType,
  ChartValues,
  ChartDomain,
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
  domain?: ChartDomain;
  setDomain?: any;
  observation?: boolean;
};

const Chart: React.FC<ChartProps> = ({
  data,
  chartType,
  domain = { x: [0, 0] },
  setDomain,
  observation,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { i18n } = useTranslation();
  moment.locale(i18n.language);

  if (!data || data.length === 0) {
    return null;
  }

  const tickInterval = 3;
  const allowPan = true;
  const allowZoom = true;
  const animate = false;
  // const animate = observation
  //   ? false
  //   : { duration: 500, onLoad: { duration: 250 } };

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

  const xDomain = chartXDomain(domain, observation, tickValues);
  const yDomain = chartYDomain(minMax, chartType);

  const currentDay = () =>
    !xDomain.x ? null : moment(xDomain.x[0]).format('dddd D.M');

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text
          style={[
            styles.headerTitle,
            {
              color: colors.primaryText,
            },
          ]}>
          {currentDay()}
        </Text>
      </View>

      <VictoryChart
        height={300}
        theme={chartTheme}
        scale={{ x: 'linear' }}
        containerComponent={
          <VictoryZoomContainer
            zoomDimension="x"
            allowZoom={allowZoom}
            allowPan={allowPan}
            zoomDomain={{ x: xDomain.x }}
            minimumZoom={{ x: 12 * 60 * 60 * 1000 }}
            onZoomDomainChange={(d) => {
              if (setDomain) {
                setDomain({ x: d.x });
              }
            }}
          />
        }>
        <VictoryAxis
          scale={{ x: 'linear' }}
          tickFormat={tickFormat}
          animate={animate}
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
          tickFormat={(t) => (t >= 10000 ? t / 1000 : t)}
          domain={yDomain}
          style={{
            tickLabels: {
              fill: colors.primaryText,
            },
          }}
        />
        {chartType === 'visCloud' && (
          <VictoryAxis
            dependentAxis
            crossAxis={false}
            orientation="right"
            tickCount={4}
            tickFormat={(t) => `${(t / 60000) * 8}/8`}
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
          domain={xDomain}
          animate={animate}
        />
      </VictoryChart>

      <ChartLegend chartType={chartType} />

      {!observation && (
        <TimeSelector
          domain={xDomain}
          setDomain={setDomain}
          tickValues={tickValues}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
  },
  headerContainer: {
    paddingLeft: 16,
    paddingTop: 16,
    flex: 1,
    alignSelf: 'flex-start',
  },
  headerTitle: {
    justifyContent: 'flex-start',
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    textTransform: 'capitalize',
  },
});

export default Chart;
