import React, { memo, useState, useRef } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';
import moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';

import Icon from '@components/common/Icon';
import { State } from '@store/types';
import { TimeStepData } from '@store/forecast/types';
import { selectDisplayParams } from '@store/forecast/selectors';
import { selectUnits, selectClockType } from '@store/settings/selectors';
import { CustomTheme } from '@assets/colors';

import { DAY_LENGTH } from '@store/forecast/constants';
import { Config } from '@config';
import ForecastListColumn from './ForecastListColumn';
import ForecastListHeaderColumn from './ForecastListHeaderColumn';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import TimeSelectButtonGroup from './TimeSelectButtonGroup';

const mapStateToProps = (state: State) => ({
  clockType: selectClockType(state),
  displayParams: selectDisplayParams(state),
  units: selectUnits(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type ModalForecastProps = PropsFromRedux & {
  data: TimeStepData[];
};

const ModalForecast: React.FC<ModalForecastProps> = ({
  data,
  displayParams,
  clockType,
  units,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const { colors, dark } = useTheme() as CustomTheme;
  const { t } = useTranslation('forecast');
  const { excludeDayLength } = Config.get('weather').forecast;
  const flatListRef = useRef<FlatList<TimeStepData>>(null);

  const dimensions = useWindowDimensions();
  const maxTableHeight = dimensions.height - 220;

  if (!data) return null;

  const startHour = parseInt(data[0].localtime.substring(9, 11), 10);
  const endHour = parseInt(data[data.length-1].localtime.substring(9, 11), 10);

  const handleOnScroll = ({
    nativeEvent,
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = nativeEvent;
    const index = Math.round(Math.abs(contentOffset.x / 48));
    setCurrentIndex(index);
  };

  // eslint-disable-next-line react/no-unstable-nested-components
  const DayDurationRow = () => {
    let step = data[0];

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

    const lightGradient = [
      'rgba(238, 239, 241, 0.64)',
      'rgba(244, 245, 247, 0.48)',
      'rgba(255, 255, 255, 0.80)'
    ];

    const darkGradient = [
      'rgba(25, 25, 25, 0.64)',
      'rgba(32, 32, 32, 0.48)',
      'rgba(40, 40, 40, 0.80)'
    ];

    return (
      <View
        testID="day_duration"
        style={[
          styles.dayLengthContainer,
          styles.forecastHeader,
        ]}>
          <View style={[styles.symbolBlock]}>
            <LinearGradient
              colors={ dark ? darkGradient : lightGradient }
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 0 }}
              style={styles.gradient}
            >
              <Icon name="sun" color={colors.hourListText} />
            </LinearGradient>
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

  return (
    <>
      <TimeSelectButtonGroup
        startHour={startHour}
        endHour={endHour}
        selectedHour={startHour+currentIndex}
        onTimeSelect={(hour) => {
          let index = hour;

          if (data.length !== 24) {
            const start = 24 - data.length;
            index = hour - start;
            if (index < 0) index = 0;
          }

          setCurrentIndex(index);
          flatListRef.current?.scrollToIndex({
            animated: false,
            index: index,
            viewPosition: 0,
          });
        }}
      />
      <ScrollView style={[styles.table, { maxHeight: maxTableHeight }]}>
        <View style={styles.row}>
          <ForecastListHeaderColumn displayParams={displayParams} units={units} modal />
          <View style={styles.listContainer}>
            <FlatList
              ref={flatListRef}
              data={data}
              keyExtractor={(item) => `${item.epochtime}`}
              renderItem={({ item }: any) => (
                <Pressable>
                  <ForecastListColumn
                    clockType={clockType}
                    data={item}
                    displayParams={displayParams}
                    units={units}
                    modal
                  />
                </Pressable>
              )}
              onScroll={handleOnScroll}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </View>
        {displayParams
          .map((displayParam) => displayParam[1])
          .includes(DAY_LENGTH) &&
          !excludeDayLength && <DayDurationRow />}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  table: {
    maxHeight: 500,
  },
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
  gradient: {
    flex: 1,
    width: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(connector(ModalForecast));
