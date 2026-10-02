import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import { State } from '@store/types';
import { selectClockType, selectUnits } from '@store/settings/selectors';
import { selectPreferredDailyParameters } from '@store/observation/selector';
import { Config } from '@config';
import { chartTickValues, dailyChartTickValues } from '@utils/chart';
import { ChartData, ChartType } from './types';
import { limitUvForecast, prepareChartData } from './data';
import ChartDataRenderer from './ChartDataRenderer';
import ChartYAxis from './ChartYAxis';
import ChartLegend from './Legend';
import { CHART_HEIGHT, CHART_TOP_PADDING } from './layout';

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
  observation = false,
  activeDayIndex,
  setActiveDayIndex,
  currentDayOffset,
  preferredDailyParameters,
  units,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [scrollIndex, setScrollIndex] = useState(observation ? 480 : 0);
  const [leftTopPadding, setLeftTopPadding] = useState(CHART_TOP_PADDING);
  const [rightTopPadding, setRightTopPadding] = useState(0);
  const topPadding = Math.max(CHART_TOP_PADDING, leftTopPadding, rightTopPadding);
  const chartHeight = CHART_HEIGHT + topPadding - CHART_TOP_PADDING;
  const [yScale, setYScale] = useState<{
    domain: [number, number];
    range: [number, number];
  }>();
  const { t, i18n } = useTranslation('weather');
  const { timePeriod } = Config.get('weather').observation;
  const isDaily =
    chartType === 'daily' || preferredDailyParameters.includes(chartType);
  const tickInterval = observation && timePeriod && timePeriod > 24 ? 1 : 3;
  const stepLength = tickInterval === 1 ? 20 : 8;
  const chartData = useMemo(
    () => limitUvForecast(data, chartType, observation),
    [data, chartType, observation]
  );
  const width =
    observation && timePeriod
      ? timePeriod * (isDaily ? 24 : stepLength)
      : chartData.length * (isDaily ? 24 : stepLength);

  const calculateDayIndex = useCallback(
    (index: number) =>
      Math.ceil((index / stepLength - (currentDayOffset || 0) + 1) / 24),
    [currentDayOffset, stepLength]
  );

  useEffect(() => {
    if (currentDayOffset && activeDayIndex !== undefined) {
      const dayIndex = calculateDayIndex(scrollIndex);
      if (dayIndex !== activeDayIndex && scrollRef.current) {
        const offsetX =
          activeDayIndex === 0
            ? 0
            : currentDayOffset * stepLength +
              (activeDayIndex - 1) * 24 * stepLength;
        scrollRef.current.scrollTo({ x: offsetX, animated: true });
        setScrollIndex(offsetX);
      }
    }
  }, [
    activeDayIndex,
    calculateDayIndex,
    currentDayOffset,
    scrollIndex,
    stepLength,
  ]);

  const tickValues = useMemo(
    () =>
      isDaily
        ? dailyChartTickValues(30)
        : chartTickValues(
            chartData,
            tickInterval,
            observation,
            timePeriod ?? 24
          ),
    [chartData, isDaily, observation, tickInterval, timePeriod]
  );
  const prepared = useMemo(
    () => prepareChartData(chartData, chartType, observation, units),
    [chartData, chartType, observation, units]
  );
  const domain = useMemo(
    () => ({
      ...prepared.domain,
      x: [tickValues[0], tickValues[tickValues.length - 1]] as [number, number],
    }),
    [prepared.domain, tickValues]
  );
  const secondaryParameterMissing =
    chartType === 'precipitation' &&
    prepared.points.every((point) => point.pop == null);

  const onYScaleChange = useCallback(
    (scaleDomain: [number, number], scaleRange: [number, number]) => {
      setYScale((previous) =>
        previous?.domain[0] === scaleDomain[0] &&
        previous?.domain[1] === scaleDomain[1] &&
        previous?.range[0] === scaleRange[0] &&
        previous?.range[1] === scaleRange[1]
          ? previous
          : { domain: scaleDomain, range: scaleRange }
      );
    },
    []
  );

  const onMomentumScrollEnd = ({
    nativeEvent,
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = nativeEvent.contentOffset.x;
    setScrollIndex(index);
    if (currentDayOffset && setActiveDayIndex) {
      const dayIndex = Math.max(0, calculateDayIndex(index));
      if (dayIndex !== activeDayIndex) setActiveDayIndex(dayIndex);
    }
  };

  if (tickValues.length === 0) return null;

  return (
    <View
      testID={`chart_${chartType}`}
      accessible
      accessibilityLabel={t(
        observation
          ? 'charts.observationAccessibilityLabel'
          : 'charts.forecastAccessibilityLabel',
        {
          parameter: t(`charts.${chartType}`),
        }
      )}
      accessibilityHint={t(
        observation
          ? 'charts.observationAccessibilityHint'
          : 'charts.forecastAccessibilityHint'
      )}
      style={styles.container}>
      <View style={styles.row}>
        <ChartYAxis
          height={chartHeight}
          onTopPaddingChange={setLeftTopPadding}
          chartType={chartType}
          domain={domain}
          yScale={yScale}
          observation={observation}
          units={units}
          precipitationMaximum={prepared.precipitationMaximum}
        />
        <ScrollView
          ref={scrollRef}
          horizontal
          onLayout={() => {
            if (observation)
              scrollRef.current?.scrollToEnd({ animated: false });
          }}
          onMomentumScrollEnd={onMomentumScrollEnd}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <ChartDataRenderer
            height={chartHeight}
            topPadding={topPadding}
            data={prepared.points}
            chartType={chartType}
            domain={domain}
            onYScaleChange={onYScaleChange}
            tickValues={tickValues}
            width={Math.max(width, 1)}
            locale={i18n.language}
            clockType={clockType}
            isDaily={isDaily}
            observation={observation}
            units={units}
            precipitationValues={prepared.precipitationValues}
          />
        </ScrollView>
        <ChartYAxis
          height={chartHeight}
          onTopPaddingChange={setRightTopPadding}
          chartType={chartType}
          domain={domain}
          yScale={yScale}
          secondaryDomain={prepared.secondaryDomain}
          observation={observation}
          right
          units={units}
          secondaryParameterMissing={secondaryParameterMissing}
          precipitationMaximum={prepared.precipitationMaximum}
        />
      </View>
      <ChartLegend
        chartType={chartType}
        observation={observation}
        units={units}
        secondaryParameterMissing={secondaryParameterMissing}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 16 },
  row: { flexDirection: 'row' },
  scrollContent: { alignItems: 'center', paddingBottom: 10 },
});

export default connector(Chart);
