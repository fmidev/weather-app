import React, { memo, useState, useRef, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  VirtualizedList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';
import moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';

import Icon from '@components/common/Icon';
import { State } from '@store/types';
import { TimeStepData } from '@store/forecast/types';
import { selectDisplayParams } from '@store/forecast/selectors';
import { selectUnits } from '@store/settings/selectors';
import {
  BLACK_OPACITY,
  WHITE_TRANSPARENT,
  BLACK_TRANSPARENT,
  CustomTheme,
} from '@utils/colors';

import { isOdd } from '@utils/helpers';
import { DAY_LENGTH } from '@store/forecast/constants';
import { selectClockType } from '@store/settings/selectors';
import { Config } from '@config';
import ForecastListColumn from './ForecastListColumn';
import ForecastListHeaderColumn from './ForecastListHeaderColumn';

const mapStateToProps = (state: State) => ({
  clockType: selectClockType(state),
  displayParams: selectDisplayParams(state),
  units: selectUnits(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type ForecastByHourListProps = PropsFromRedux & {
  data: TimeStepData[];
  isOpen: boolean;
  activeDayIndex: number;
  setActiveDayIndex: (i: number) => void;
  currentDayOffset: number;
  currentHour: number;
};

const ForecastByHourList: React.FC<ForecastByHourListProps> = ({
  data,
  isOpen,
  activeDayIndex,
  setActiveDayIndex,
  currentDayOffset,
  displayParams,
  clockType,
  units,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  currentHour, // just for re-rendering every hour
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const { colors, dark } = useTheme() as CustomTheme;
  const { t } = useTranslation('forecast');
  const { excludeDayLength } = Config.get('weather').forecast;

  const virtualizedList = useRef() as React.MutableRefObject<
    VirtualizedList<TimeStepData>
  >;

  useEffect(() => {
    if (activeDayIndex !== currentIndex && data.length > 0) {
      const calculatedIndex = !activeDayIndex
        ? 0
        : currentDayOffset + (activeDayIndex - 1) * 24;

      const index =
        calculatedIndex > data.length ? data.length - 1 : calculatedIndex;
      if (index >= 0) {
        virtualizedList.current.scrollToIndex({
          index,
          animated: false,
        });
      }
    }
  }, [activeDayIndex, currentIndex, data, currentDayOffset]);

  if (!isOpen && !data) return null;

  // eslint-disable-next-line react/no-unstable-nested-components
  const DayDurationRow = () => {
    const calculatedStepIndex = !currentIndex
      ? 0
      : currentDayOffset + (currentIndex - 1) * 24 + 12;
    const adjustedStepIndex =
      calculatedStepIndex > data.length ? data.length - 1 : calculatedStepIndex;

    // get day's first timestep
    let step = data[adjustedStepIndex];
    // get step hour (works in selected location's timezone)
    const stepHour = Number.parseInt(
      moment.unix(step.epochtime).format('H'),
      10
    );
    // do not use 00-05 steps for the FIRST DAY due to possible errors (data is fetched in UTC + daylight savings)
    if (adjustedStepIndex === 0 && stepHour < 6) {
      // use 06 step instead!
      step = data[6 - stepHour];
    }

    const sunrise = moment(`${step.sunrise}Z`);
    const sunset = moment(`${step.sunset}Z`);
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
      sunrise.isBefore(sunset);

    const dateFormat =
      clockType === 12
        ? `D.M.YYYY [${t('at')}] h.mm a`
        : `D.M.YYYY [${t('at')}] HH.mm`;

    const timeFormat = clockType === 12 ? 'h.mm a' : 'HH.mm';

    return (
      <View
        testID="forecast_table"
        style={[
          styles.dayLengthContainer,
          styles.forecastHeader,
          {
            borderColor: colors.border,
            backgroundColor: !isOdd(displayParams.length)
              ? colors.listTint
              : undefined,
          },
        ]}>
        <View
          style={[
            styles.symbolBlock,
            {
              borderColor: colors.border,
            },
          ]}>
          <Icon name="sun" color={colors.hourListText} />
        </View>
        <View
          style={[styles.row, styles.listContainer, styles.paddingHorizontal]}>
          {isPolarNight && !isMidnightSun && (
            <>
              <View
                accessible
                style={[styles.row, styles.alignCenter, styles.listContainer]}>
                <Icon
                  width={24}
                  height={24}
                  name="polar-night"
                  style={[
                    styles.withMarginRight,
                    {
                      color: colors.hourListText,
                    },
                  ]}
                />
                <Text
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
                  width={14}
                  height={14}
                  name="sun-arrow-up"
                  style={[
                    styles.withMarginRight,
                    {
                      color: colors.hourListText,
                    },
                  ]}
                />
                <Text
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
                  width={24}
                  height={24}
                  name="midnight-sun"
                  style={[
                    styles.withMarginRight,
                    {
                      color: colors.hourListText,
                    },
                  ]}
                />
                <Text
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
                  width={14}
                  height={14}
                  name="sun-arrow-down"
                  style={[
                    styles.withMarginRight,
                    {
                      color: colors.hourListText,
                    },
                  ]}
                />
                <Text
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
              ]}>
              <View
                style={[
                  styles.row,
                  styles.alignCenter,
                  styles.withMarginRight20,
                ]}
                accessible>
                <Icon
                  width={14}
                  height={14}
                  name="sun-arrow-up"
                  style={[
                    styles.withMarginRight,
                    {
                      color: colors.hourListText,
                    },
                  ]}
                />
                <Text
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
                  width={14}
                  height={14}
                  name="sun-arrow-down"
                  style={[
                    styles.withMarginRight,
                    { color: colors.hourListText },
                  ]}
                />
                <Text
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
                      styles.withMarginLeft20,
                    ]}
                    accessible>
                    <Icon
                      width={24}
                      height={24}
                      name="time"
                      style={[
                        styles.alignCenter,
                        styles.withMarginRight,
                        { color: colors.hourListText },
                      ]}
                    />
                    <Text
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

  const handleOnScroll = ({
    nativeEvent,
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = nativeEvent;
    let dayIndex = Math.ceil(
      ((contentOffset.x + 1) / 52 - currentDayOffset) / 24
    );
    dayIndex = dayIndex >= 0 ? dayIndex : 0;

    if (dayIndex !== currentIndex) setCurrentIndex(dayIndex);
    if (dayIndex !== activeDayIndex) {
      setActiveDayIndex(dayIndex);
    }
  };

  if (!isOpen) return null;

  return (
    <View style={[!isOpen && styles.displayNone]}>
      <View style={styles.row}>
        <ForecastListHeaderColumn displayParams={displayParams} units={units} />
        <View style={styles.listContainer}>
          <VirtualizedList
            ref={virtualizedList}
            data={data}
            keyExtractor={(item) => `${item.epochtime}`}
            getItem={(items, index) => items[index]}
            getItemCount={(items) => items && items.length}
            onScrollToIndexFailed={({ index }) => {
              console.warn(`scroll to index: ${index} failed`);
            }}
            renderItem={({ item }: any) => (
              <ForecastListColumn
                clockType={clockType}
                data={item}
                displayParams={displayParams}
                units={units}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={handleOnScroll}
            getItemLayout={(_, index: number) => ({
              length: 52,
              offset: index * 52,
              index,
            })}
          />
        </View>
      </View>
      {displayParams
        .map((displayParam) => displayParam[1])
        .includes(DAY_LENGTH) &&
        !excludeDayLength && <DayDurationRow />}
      <LinearGradient
        pointerEvents="none"
        style={[styles.gradient, styles.gradientLeft]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        colors={
          dark
            ? [BLACK_OPACITY, BLACK_TRANSPARENT]
            : [BLACK_OPACITY, WHITE_TRANSPARENT]
        }
      />
      <LinearGradient
        pointerEvents="none"
        style={[styles.gradient, styles.gradientRight]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        colors={
          dark
            ? [BLACK_TRANSPARENT, BLACK_OPACITY]
            : [WHITE_TRANSPARENT, BLACK_OPACITY]
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  dayLengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
  },
  justifyContentCenter: {
    justifyContent: 'center',
  },
  bold: {
    fontFamily: 'Roboto-Bold',
  },
  panelText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
  },
  withMarginRight20: {
    marginRight: 20,
  },
  withMarginLeft20: {
    marginLeft: 20,
  },
  withMarginRight: {
    marginRight: 6,
  },
  forecastHeader: {
    height: 52,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
  },
  displayNone: {
    display: 'none',
  },
  maxWidth: {
    width: '100%',
  },
  alignCenter: {
    alignItems: 'center',
  },
  symbolBlock: {
    height: '100%',
    width: 51,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
  },
  paddingHorizontal: {
    paddingHorizontal: 16,
  },
  gradient: {
    position: 'absolute',
    width: 32,
    zIndex: 3,
    top: 1,
    bottom: 1,
  },
  gradientLeft: {
    left: 52,
  },
  gradientRight: {
    right: 0,
  },
});

export default memo(connector(ForecastByHourList));
