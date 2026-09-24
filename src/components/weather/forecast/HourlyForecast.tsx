import React, { memo, useCallback, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  View,
  StyleSheet,
  FlatList,
  processColor,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';
import moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';

import Text from '@components/common/AppText';
import Icon from '@components/common/ScalableIcon';
import { State } from '@store/types';
import { TimeStepData } from '@store/forecast/types';
import { selectDisplayParams } from '@store/forecast/selectors';
import { selectUnits, selectClockType } from '@store/settings/selectors';
import { CustomTheme } from '@assets/colors';

import { DAY_LENGTH } from '@store/forecast/constants';
import { Config } from '@config';
import ForecastListColumn from './ForecastListColumn';
import ForecastListHeaderColumn from './ForecastListHeaderColumn';

import { MEDIUM_FONT, BOLD_FONT } from '@assets/constants';
// import { trackMatomoEvent } from '@utils/matomo';

const mapStateToProps = (state: State) => ({
  clockType: selectClockType(state),
  displayParams: selectDisplayParams(state),
  units: selectUnits(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type HourlyForecastProps = PropsFromRedux & {
  data: TimeStepData[];
  initialScrollHour?: number;
};

const HourlyForecast: React.FC<HourlyForecastProps> = ({
  data,
  displayParams,
  clockType,
  units,
  initialScrollHour,
}) => {
  const { fontScale } = useWindowDimensions();
  const { colors, dark } = useTheme() as CustomTheme;
  const { t } = useTranslation('forecast');
  const { excludeDayLength } = Config.get('weather').forecast;

  const initialScrollIndex =
    initialScrollHour === undefined || !data?.length
      ? -1
      : data.findIndex(({ localtime }) => {
          const localMoment = moment(localtime, moment.ISO_8601, true);
          return (
            localMoment.isValid() && localMoment.hour() === initialScrollHour
          );
        });
  const hourColumnWidth = Math.min(fontScale * 48, 62);
  const scrollMetrics = useRef({
    width: 0,
    contentWidth: 0,
    offset: Math.max(0, initialScrollIndex) * hourColumnWidth,
  });
  const [scrollEdges, setScrollEdges] = useState({ left: false, right: false });
  const updateScrollEdges = useCallback(
    (metrics: Partial<typeof scrollMetrics.current>) => {
      scrollMetrics.current = { ...scrollMetrics.current, ...metrics };
      const { width, contentWidth, offset } = scrollMetrics.current;
      const maxOffset = Math.max(0, contentWidth - width);
      const clampedOffset = Math.max(0, Math.min(offset, maxOffset));
      // Allow for fractional layout values and overscroll at either end.
      const left = width > 0 && clampedOffset > 1;
      const right = width > 0 && maxOffset - clampedOffset > 1;
      setScrollEdges((current) =>
        current.left === left && current.right === right
          ? current
          : { left, right }
      );
    },
    []
  );

  if (!data || data.length === 0) return null;

  const backgroundColor = processColor(colors.background);
  const backgroundRgb =
    typeof backgroundColor === 'number'
      ? // Decode the packed native color so the fade keeps the same RGB values.
        // eslint-disable-next-line no-bitwise
        `${(backgroundColor >>> 16) & 255}, ${(backgroundColor >>> 8) & 255}, ${backgroundColor & 255}`
      : undefined;
  const transparentBackground = backgroundRgb
    ? `rgba(${backgroundRgb}, 0)`
    : 'transparent';
  const fadeColors = dark
    ? [
        colors.background,
        backgroundRgb ? `rgba(${backgroundRgb}, 0.65)` : colors.background,
        transparentBackground,
      ]
    : [colors.background, transparentBackground];

  // eslint-disable-next-line react/no-unstable-nested-components
  const DayDurationRow = () => {
    const step = data[data.length - 1];
    const sunrise = moment(`${step.sunrise}Z`);
    const sunset = moment(`${step.sunset}Z`);
    const sunriseSunsetDiff = Math.abs(sunset.diff(sunrise, 'hours'));
    const dayHours = Math.floor(step.dayLength / 60);
    const dayMinutes = step.dayLength % 60;

    const { excludeDayDuration, excludePolarNightAndMidnightSun } =
      Config.get('weather').forecast;

    // check if sunrise and sunset are on same day or not (works in all timezones)
    const sunriseDay = moment(sunrise).format('D');
    const sunsetDay = moment(sunset).format('D');
    const isSunriseAndDayInSameDay = sunriseDay === sunsetDay;

    const isPolarNight =
      (excludePolarNightAndMidnightSun === undefined ||
        !excludePolarNightAndMidnightSun) &&
      !isSunriseAndDayInSameDay &&
      sunset.isBefore(sunrise);

    const isMidnightSun =
      (excludePolarNightAndMidnightSun === undefined ||
        !excludePolarNightAndMidnightSun) &&
      !isSunriseAndDayInSameDay &&
      sunrise.isBefore(sunset) &&
      sunriseSunsetDiff >= 36;

    const dateFormat =
      clockType === 12
        ? `D.M.YYYY [${t('at')}] h.mm a`
        : `D.M.YYYY [${t('at')}] HH.mm`;

    const timeFormat = clockType === 12 ? 'h.mm a' : 'HH.mm';

    const iconSize = 14;
    const headerWidth = Math.min(fontScale * 38, 64);

    return (
      <View
        testID="day_duration"
        style={[styles.dayLengthContainer, styles.forecastHeader]}>
        <View
          testID="day-duration-symbol"
          style={[
            styles.symbolBlock,
            {
              width: headerWidth,
              backgroundColor: colors.dayForecastBackground,
            },
          ]}>
          <Icon
            name="sun"
            color={colors.hourListText}
            width={24}
            height={24}
            maxScaleFactor={1.5}
          />
        </View>
        <View
          style={[styles.row, styles.listContainer, styles.paddingHorizontal]}>
          {isPolarNight && !isMidnightSun && (
            <>
              <View
                accessible
                style={[styles.row, styles.alignCenter, styles.listContainer]}>
                <Icon
                  width={iconSize}
                  height={iconSize}
                  maxScaleFactor={1.5}
                  name="polar-night"
                  style={[
                    styles.withMarginRight,
                    {
                      color: colors.hourListText,
                    },
                  ]}
                />
                <Text
                  maxFontSizeMultiplier={1.5}
                  style={[
                    styles.panelText,
                    styles.bold,
                    { color: colors.hourListText },
                  ]}>
                  {t('weatherInfoBottomSheet.polarNight')}
                </Text>
              </View>
              <View style={[styles.row, styles.alignCenter]} accessible>
                <Icon
                  width={iconSize}
                  height={iconSize}
                  maxScaleFactor={1.5}
                  name="sun-arrow-up"
                  style={[
                    styles.withMarginRight,
                    {
                      color: colors.hourListText,
                    },
                  ]}
                />
                <Text
                  maxFontSizeMultiplier={1.5}
                  accessibilityLabel={`${t('sunrise')} ${t(
                    'at'
                  )} ${sunrise.format(dateFormat)}`}
                  style={[
                    styles.panelText,
                    styles.bold,
                    { color: colors.hourListText },
                  ]}>
                  {sunrise.format(dateFormat)}
                </Text>
              </View>
            </>
          )}
          {isMidnightSun && !isPolarNight && (
            <>
              <View
                accessible
                style={[styles.row, styles.alignCenter, styles.listContainer]}>
                <Icon
                  width={iconSize}
                  height={iconSize}
                  maxScaleFactor={1.5}
                  name="midnight-sun"
                  style={[
                    styles.withMarginRight,
                    {
                      color: colors.hourListText,
                    },
                  ]}
                />
                <Text
                  maxFontSizeMultiplier={1.5}
                  style={[
                    styles.panelText,
                    styles.bold,
                    { color: colors.hourListText },
                  ]}>
                  {t('weatherInfoBottomSheet.nightlessNight')}
                </Text>
              </View>
              <View style={[styles.row, styles.alignCenter]} accessible>
                <Icon
                  width={iconSize}
                  height={iconSize}
                  maxScaleFactor={1.5}
                  name="sun-arrow-down"
                  style={[
                    styles.withMarginRight,
                    {
                      color: colors.hourListText,
                    },
                  ]}
                />
                <Text
                  maxFontSizeMultiplier={1.5}
                  accessibilityLabel={`${t('sunset')} ${t(
                    'at'
                  )} ${sunset.format(dateFormat)}`}
                  style={[
                    styles.panelText,
                    styles.bold,
                    { color: colors.hourListText },
                  ]}>
                  {sunset.format(dateFormat)}
                </Text>
              </View>
            </>
          )}
          {!isPolarNight && !isMidnightSun && (
            <View
              style={[
                styles.row,
                styles.listContainer,
                styles.maxWidth,
                styles.justifyContentCenter,
                styles.wrap,
              ]}>
              <View
                style={[
                  styles.row,
                  styles.alignCenter,
                  styles.withMarginRight10,
                ]}
                accessible>
                <Icon
                  width={iconSize}
                  height={iconSize}
                  maxScaleFactor={1.5}
                  name="sun-arrow-up"
                  style={[
                    styles.withMarginRight,
                    {
                      color: colors.hourListText,
                    },
                  ]}
                />
                <Text
                  maxFontSizeMultiplier={1.5}
                  accessibilityLabel={`${t('sunrise')} ${t(
                    'at'
                  )} ${sunrise.format(timeFormat)}`}
                  style={[
                    styles.panelText,
                    styles.bold,
                    { color: colors.hourListText },
                  ]}>
                  {sunrise.format(timeFormat)}
                </Text>
              </View>
              <View style={[styles.row, styles.alignCenter]} accessible>
                <Icon
                  width={iconSize}
                  height={iconSize}
                  maxScaleFactor={1.5}
                  name="sun-arrow-down"
                  style={[
                    styles.withMarginRight,
                    { color: colors.hourListText },
                  ]}
                />
                <Text
                  maxFontSizeMultiplier={1.5}
                  accessibilityLabel={`${t('sunset')} ${t(
                    'at'
                  )} ${sunset.format(timeFormat)}`}
                  style={[
                    styles.panelText,
                    styles.bold,
                    { color: colors.hourListText },
                  ]}>
                  {sunset.format(timeFormat)}
                </Text>
              </View>
              {(excludeDayDuration === undefined || !excludeDayDuration) && (
                <>
                  <View
                    style={[
                      styles.row,
                      styles.alignCenter,
                      styles.withMarginLeft10,
                    ]}
                    accessible>
                    <Icon
                      width={iconSize}
                      height={iconSize}
                      maxScaleFactor={1.5}
                      name="time"
                      style={[
                        styles.alignCenter,
                        styles.withMarginRight,
                        { color: colors.hourListText },
                      ]}
                    />
                    <Text
                      maxFontSizeMultiplier={1.5}
                      accessibilityLabel={`${t('dayLength')} ${dayHours} ${t(
                        'hours'
                      )} ${dayMinutes} ${t('minutes')}`}
                      style={[
                        styles.panelText,
                        styles.bold,
                        { color: colors.hourListText },
                      ]}>
                      {`${dayHours} h ${dayMinutes} min`}
                    </Text>
                  </View>
                </>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <>
      <View style={styles.row}>
        <ForecastListHeaderColumn
          displayParams={displayParams}
          units={units}
          compact
        />
        <View style={styles.listContainer}>
          <FlatList
            testID="hourly-forecast-list"
            onLayout={({ nativeEvent }) =>
              updateScrollEdges({ width: nativeEvent.layout.width })
            }
            onContentSizeChange={(contentWidth) =>
              updateScrollEdges({ contentWidth })
            }
            onScroll={({ nativeEvent }) =>
              updateScrollEdges({
                width: nativeEvent.layoutMeasurement.width,
                contentWidth: nativeEvent.contentSize.width,
                offset: nativeEvent.contentOffset.x,
              })
            }
            scrollEventThrottle={16}
            data={data}
            initialScrollIndex={
              initialScrollIndex >= 0 ? initialScrollIndex : undefined
            }
            getItemLayout={(_, index) => ({
              length: hourColumnWidth,
              offset: index * hourColumnWidth,
              index,
            })}
            keyExtractor={(item) => `${item.epochtime}`}
            renderItem={({ item }: any) => (
              <ForecastListColumn
                clockType={clockType}
                data={item}
                displayParams={displayParams}
                units={units}
                compact
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
          {scrollEdges.left && (
            <LinearGradient
              testID="hourly-forecast-left-fade"
              pointerEvents="none"
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              colors={fadeColors}
              locations={dark ? [0, 0.45, 1] : undefined}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.scrollFade,
                dark && styles.darkScrollFade,
                styles.leftFade,
              ]}
            />
          )}
          {scrollEdges.right && (
            <LinearGradient
              testID="hourly-forecast-right-fade"
              pointerEvents="none"
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              colors={[...fadeColors].reverse()}
              locations={dark ? [0, 0.55, 1] : undefined}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.scrollFade,
                dark && styles.darkScrollFade,
                styles.rightFade,
              ]}
            />
          )}
        </View>
      </View>
      {displayParams
        .map((displayParam) => displayParam[1])
        .includes(DAY_LENGTH) &&
        !excludeDayLength && <DayDurationRow />}
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  wrap: {
    flexWrap: 'wrap',
  },
  dayLengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
  },
  scrollFade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 30,
  },
  darkScrollFade: {
    width: 40,
  },
  leftFade: {
    left: 0,
  },
  rightFade: {
    right: 0,
  },
  justifyContentCenter: {
    justifyContent: 'center',
  },
  bold: {
    fontFamily: BOLD_FONT,
  },
  panelText: {
    fontSize: 14,
    fontFamily: MEDIUM_FONT,
  },
  withMarginRight10: {
    marginRight: 10,
  },
  withMarginLeft10: {
    marginLeft: 10,
  },
  withMarginRight: {
    marginRight: 2,
  },
  forecastHeader: {
    height: 52,
  },
  maxWidth: {
    width: '100%',
  },
  alignCenter: {
    alignItems: 'center',
  },
  symbolBlock: {
    height: '100%',
    width: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paddingHorizontal: {
    paddingHorizontal: 16,
  },
});

export default memo(connector(HourlyForecast));
