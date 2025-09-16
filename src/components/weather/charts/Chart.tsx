import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { View, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import {
  chartTickValues,
  dailyChartTickValues,
  chartXDomain,
  chartYDomain,
} from '@utils/chart';

import { Config } from '@config';
import { converter, resolveUnitParameterName } from '@utils/units';
import { State } from '@store/types';
import { selectClockType } from '@store/settings/selectors';
import { selectUnits } from '@store/settings/selectors';
import { connect, ConnectedProps } from 'react-redux';
import { ChartData, ChartType, ChartValues, ChartMinMax } from './types';
import ChartLegend from './Legend';
import chartSettings from './settings';
import { selectPreferredDailyParameters } from '@store/observation/selector';
import ForecastChart from './ForecastChart';
import ObservationChart from './ObservationChart';
import DailyObservationChart from './DailyObservationChart';

const mapStateToProps = (state: State) => ({
  clockType: selectClockType(state),
  preferredDailyParameters: selectPreferredDailyParameters(state),
  units: selectUnits(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type ChartProps = PropsFromRedux & {
  data: ChartData;
  chartType: ChartType;
  observation?: boolean;
  activeDayIndex?: number;
  setActiveDayIndex?: (i: number) => void;
  currentDayOffset?: number;
};

const Chart: React.FC<ChartProps> = ({
  clockType,
  data,
  chartType,
  observation,
  activeDayIndex,
  currentDayOffset,
  preferredDailyParameters,
  units,
}) => {
  const isDaily =
    chartType === 'daily' || preferredDailyParameters.includes(chartType);

  const scrollRef = useRef() as React.MutableRefObject<ScrollView>;
  const [scrollIndex, setScrollIndex] = useState<number>(
    observation ? 24 * 20 : 0
  );
  const { t, i18n } = useTranslation('weather');
  moment.locale(i18n.language);

  const defaultUnits = useMemo(() => Config.get('settings').units, []);
  const { timePeriod } = Config.get('weather').observation;

  const tickInterval = observation && timePeriod && timePeriod > 24 ? 1 : 3;
  const stepLength = tickInterval === 1 ? 20 : 8;
  const dailyObservationStepLength = 24;

  const chartDimensions = useMemo(
    () => ({
      y: 300,
      x:
        observation && timePeriod
          ? timePeriod * (isDaily ? dailyObservationStepLength : stepLength)
          : data.length * (isDaily ? dailyObservationStepLength : stepLength),
    }),
    [
      observation,
      data,
      stepLength,
      timePeriod,
      isDaily,
      dailyObservationStepLength,
    ]
  );

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
        setScrollIndex(0);
      }
      if (activeDayIndex > 0 && dayIndex !== activeDayIndex) {
        const off = currentDayOffset * stepLength;
        const offsetX = off + (activeDayIndex - 1) * 24 * stepLength;
        scrollRef.current.scrollTo({ x: offsetX, animated: true });
        setScrollIndex(offsetX);
      }
    }
  }, [
    activeDayIndex,
    stepLength,
    currentDayOffset,
    scrollIndex,
    calculateDayIndex,
  ]);

  const { params } = useMemo(
    () => chartSettings(chartType, observation),
    [chartType, observation]
  );

  const { chartValues, chartMinMax } = useMemo(() => {
    const minMax: ChartMinMax = [];
    const values: ChartValues = {};

    params.forEach((param) => {
      const unitParameterName = resolveUnitParameterName(param.toString());
      let unit: string | undefined;

      if (unitParameterName) {
        if (units && units[unitParameterName])
          unit = units[unitParameterName].unitAbb;
        else if (Object.keys(defaultUnits).includes(unitParameterName))
          // @ts-ignore
          unit = defaultUnits[unitParameterName].unitAbb;
      }

      values[param] = (
        data?.map((step) => {
          const x = step.epochtime * 1000;
          // @ts-ignore
          const y = converter(unit, step[param]);
          if (param !== 'windDirection' && param !== 'pop') {
            minMax.push(y);
          }
          return { x, y };
        }) || []
      ).filter(({ y }) => y !== undefined);
    });

    return { chartValues: values, chartMinMax: minMax };
  }, [data, params, units, defaultUnits]);

  const tickValues = useMemo(
    () =>
      isDaily
        ? dailyChartTickValues(30)
        : chartTickValues(
            data,
            tickInterval,
            observation ?? false,
            timePeriod ?? 24
          ),
    [data, tickInterval, observation, timePeriod, isDaily]
  );

  const chartDomain = useMemo(
    () => ({
      ...chartYDomain(chartMinMax, chartType, units),
      ...chartXDomain(tickValues),
    }),
    [chartType, chartMinMax, tickValues, units]
  );

  const secondaryParameterMissing = useMemo(
    () =>
      chartType === 'precipitation'
        ? chartValues.pop.every((p) => p.y === null)
        : false,
    [chartType, chartValues.pop]
  );

  /*
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
  */

  if (chartDomain.x?.[0] === undefined) {
    return null;
  }

  return (
    <View
      testID={`chart_${chartType}`}
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
      <ScrollView horizontal>
        { observation && !isDaily && (
          <ObservationChart
            chartDimensions={chartDimensions}
            tickValues={tickValues}
            chartDomain={chartDomain}
            chartType={chartType}
            chartValues={data}
            locale={i18n.language}
            clockType={clockType}
            isDaily={isDaily}
            units={units}
        />
        )}
        { observation && isDaily && (
          <DailyObservationChart
            chartDimensions={chartDimensions}
            tickValues={tickValues}
            chartDomain={chartDomain}
            chartType={chartType}
            chartValues={data}
            locale={i18n.language}
            clockType={clockType}
            isDaily={isDaily}
            units={units}
        />
        )}
        { !observation && (
          <ForecastChart
            chartDimensions={chartDimensions}
            tickValues={tickValues}
            chartDomain={chartDomain}
            chartType={chartType}
            chartValues={data}
            locale={i18n.language}
            clockType={clockType}
            isDaily={isDaily}
            units={units}
          />
        )}
      </ScrollView>
      <ChartLegend
        chartType={chartType}
        observation={observation}
        units={units}
        secondaryParameterMissing={secondaryParameterMissing}
      />
    </View>
  );
};

export default connector(Chart);
