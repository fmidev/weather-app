import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { chartTickValues, chartXDomain, chartYDomain } from '@utils/chart';

import { Config } from '@config';
import { converter } from '@utils/units';
import { State } from '@store/types';
import { selectClockType } from '@store/settings/selectors';
import { connect, ConnectedProps } from 'react-redux';
import { ChartData, ChartType, ChartValues, ChartMinMax } from './types';
import ChartLegend from './Legend';
import chartSettings from './settings';
import ChartDataRenderer from './ChartDataRenderer';
import ChartYAxis from './ChartYAxis';

const mapStateToProps = (state: State) => ({
  clockType: selectClockType(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type ChartProps = PropsFromRedux & {
  data: ChartData;
  daily?: boolean;
  chartType: ChartType;
  observation?: boolean;
  activeDayIndex?: number;
  setActiveDayIndex?: (i: number) => void;
  currentDayOffset?: number;
};

const Chart: React.FC<ChartProps> = ({
  clockType,
  data,
  daily,
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
  const { t, i18n } = useTranslation('weather');
  moment.locale(i18n.language);

  const units = useMemo(() => Config.get('settings').units, []);
  const { timePeriod } = Config.get('weather').observation;

  const tickInterval = observation && timePeriod && timePeriod > 24 ? 1 : 3;
  const dailyObservationTickInterval = 24;

  const stepLength = tickInterval === 1 ? 20 : 8;
  const dailyObservationStepLength = 24;

  const chartDimensions = useMemo(
    () => ({
      y: 300,
      x:
        observation && timePeriod
          ? timePeriod * (daily ? dailyObservationStepLength : stepLength)
          : data.length * (daily ? dailyObservationStepLength : stepLength),
    }),
    [observation, daily, data, stepLength, timePeriod]
  );

  const calculateDayIndex = useCallback(
    (index: number) =>
      Math.ceil(
        (index / (daily ? dailyObservationStepLength : stepLength) -
          (currentDayOffset || 0) +
          1) /
          24
      ),
    [currentDayOffset, daily, stepLength]
  );

  useEffect(() => {
    if (currentDayOffset && activeDayIndex !== undefined) {
      const dayIndex = calculateDayIndex(scrollIndex);
      if (activeDayIndex === 0 && dayIndex !== activeDayIndex) {
        scrollRef.current.scrollTo({ x: 0, animated: true });
        setScrollIndex(0);
      }
      if (activeDayIndex > 0 && dayIndex !== activeDayIndex) {
        const off =
          currentDayOffset * (daily ? dailyObservationStepLength : stepLength);
        const offsetX =
          off +
          (activeDayIndex - 1) *
            24 *
            (daily ? dailyObservationStepLength : stepLength);
        scrollRef.current.scrollTo({ x: offsetX, animated: true });
        setScrollIndex(offsetX);
      }
    }
  }, [
    activeDayIndex,
    daily,
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
          const y = converter(units[chartType], step[param]);
          if (param !== 'windDirection' && param !== 'pop') {
            minMax.push(y);
          }
          return { x, y };
        }) || []
      ).filter(({ y }) => y !== undefined);
    });

    return { chartValues: values, chartMinMax: minMax };
  }, [data, params, units, chartType]);

  const tickValues = useMemo(
    () =>
      chartTickValues(
        data,
        daily ? dailyObservationTickInterval : tickInterval,
        observation ?? false,
        daily ? 720 : timePeriod ?? 24
      ),
    [data, daily, tickInterval, observation, timePeriod]
  );

  const chartDomain = useMemo(
    () => ({
      ...chartYDomain(chartMinMax, chartType),
      ...chartXDomain(tickValues),
    }),
    [chartType, chartMinMax, tickValues]
  );

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

  if (chartDomain.x?.[0] === undefined) {
    return null;
  }

  return (
    <View
      accessible
      accessibilityLabel={
        observation
          ? t('charts.observationAccessibilityLabel', {
              parameter: t(`charts.${chartType}`),
            })
          : t('charts.forecastAccessibilityLabel', {
              parameter: t(`charts.${chartType}`),
            })
      }
      accessibilityHint={
        observation
          ? t('charts.observationAccessibilityHint')
          : t('charts.forecastAccessibilityHint')
      }>
      <View style={styles.chartRowContainer}>
        <ChartYAxis
          chartDimensions={chartDimensions}
          chartType={chartType}
          chartDomain={chartDomain}
          chartMinMax={chartMinMax}
          observation={observation ?? false}
        />
        <ScrollView
          ref={scrollRef}
          onLayout={onLayout}
          onMomentumScrollEnd={onMomentumScrollEnd}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chartContainer}>
          <ChartDataRenderer
            chartDimensions={chartDimensions}
            tickValues={tickValues}
            chartDomain={chartDomain}
            chartType={chartType}
            Component={Component}
            chartValues={chartValues}
            locale={i18n.language}
            clockType={clockType}
            daily={daily}
          />
        </ScrollView>
        <ChartYAxis
          chartDimensions={chartDimensions}
          chartType={chartType}
          chartDomain={chartDomain}
          chartMinMax={chartMinMax}
          observation={observation ?? false}
          right
        />
      </View>
      <ChartLegend chartType={chartType} observation={observation} />
    </View>
  );
};

const styles = StyleSheet.create({
  chartRowContainer: {
    flexDirection: 'row',
  },
  chartContainer: {
    paddingStart: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
  },
});

export default connector(Chart);
