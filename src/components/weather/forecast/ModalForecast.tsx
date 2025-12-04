import React, { memo, useState, useRef, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  View,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  FlatList,
  useWindowDimensions,
  ScrollView,
  Pressable,
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

import TimeSelectButtonGroup from './TimeSelectButtonGroup';
import { MAX_PARAMETERS_WITHOUT_SCROLL } from './constants';
// import { trackMatomoEvent } from '@utils/matomo';

const mapStateToProps = (state: State) => ({
  clockType: selectClockType(state),
  displayParams: selectDisplayParams(state),
  units: selectUnits(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type ModalForecastProps = PropsFromRedux & {
  data: TimeStepData[];
  initialPosition?: 'start' | 'end';
};

const ModalForecast: React.FC<ModalForecastProps> = ({
  data,
  displayParams,
  clockType,
  units,
  initialPosition,
}) => {
  const { fontScale } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const { colors, dark } = useTheme() as CustomTheme;
  const { t } = useTranslation('forecast');
  const { excludeDayLength } = Config.get('weather').forecast;
  const flatListRef = useRef<FlatList<TimeStepData>>(null);

  const { width, height } = useWindowDimensions();

  // keep last tracked timestamp in a ref (doesn’t trigger re-renders)
  // const lastTracked = useRef(0);

  useEffect(() => {
    if (initialPosition === 'start') {
      setCurrentIndex(0);
      flatListRef.current?.scrollToIndex({
        animated: false,
        index: 0,
        viewPosition: 0,
      });
    } else {
      setCurrentIndex(data.length - 1);
      flatListRef.current?.scrollToIndex({
        animated: false,
        index: data.length - 1,
        viewPosition: 0,
      });
    }
  }, [data, initialPosition]);

  if (!data) return null;

  const startHour = parseInt(data[0].localtime.substring(9, 11), 10);
  const endHour = parseInt(data[data.length-1].localtime.substring(9, 11), 10);

  /*
  const trackScroll = () => {
      const now = Date.now();
      // May not be the best way to track...
      if (now - lastTracked.current > 2000) { // 2 seconds
        // TODO: fires from swipe AND button presses. Should track them separately?
        trackMatomoEvent("User action", "Weather", "Swipe or select hours in forecast modal");
        lastTracked.current = now;
      }
    };
*/

  const handleOnScroll = ({
    nativeEvent,
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    // TODO: activates from swipe AND hour -button selections...
    // trackScroll();

    const { contentOffset } = nativeEvent;
    const index = Math.round(Math.abs(contentOffset.x / 48));
    setCurrentIndex(index);
  };

  // Large content should have horizontal scrolling,
  // otherwise disable scrolling so that swipe to close works
  const shouldHorizontalScroll = height < 500 || (height < 900 && displayParams.length > MAX_PARAMETERS_WITHOUT_SCROLL);
  const isWideDisplay = width > 500;
  const maxTableHeight = isWideDisplay ? height - 130 : height - 150;

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

    const iconSize = 14;
    const headerWidth = Math.min(fontScale * 38, 64);

    return (
      <View
        testID="day_duration"
        style={[
          styles.dayLengthContainer,
          styles.forecastHeader,
        ]}>
          <View style={[styles.symbolBlock, { width: headerWidth }]}>
            <LinearGradient
              colors={ dark ? darkGradient : lightGradient }
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 0 }}
              style={[styles.gradient, { width: headerWidth }]}
            >
              <Icon
                name="sun"
                color={colors.hourListText}
                width={24}
                height={24}
                maxScaleFactor={1.5}
              />
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

  const modalContent = (
    <>
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
            onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                console.log('scrollToIndex failed, retrying');
                flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
              }, 100); // Odota että lista ehtii renderöityä
            }}
          />
        </View>
      </View>
      {displayParams.map((displayParam) => displayParam[1]).includes(DAY_LENGTH) &&
        !excludeDayLength && <DayDurationRow />}
    </>
  );

  return (
    <>
      { !isWideDisplay && (
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
      )}
      {shouldHorizontalScroll ? (
        <ScrollView style={[styles.table, { maxHeight: maxTableHeight }]}>
          {modalContent}
        </ScrollView>
      ) : (
        <View style={[styles.table, { maxHeight: maxTableHeight }]}>
          {modalContent}
        </View>
      )}
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
  gradient: {
    flex: 1,
    width: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(connector(ModalForecast));
