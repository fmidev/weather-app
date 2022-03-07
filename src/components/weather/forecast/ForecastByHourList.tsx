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
import {
  BLACK_OPACITY,
  WHITE_TRANSPARENT,
  BLACK_TRANSPARENT,
  WHITE_OPACITY,
  CustomTheme,
} from '@utils/colors';

import { isOdd } from '@utils/helpers';
import ForecastListColumn from './ForecastListColumn';
import ForecastListHeaderColumn from './ForecastListHeaderColumn';

const mapStateToProps = (state: State) => ({
  displayParams: selectDisplayParams(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type ForecastByHourListProps = PropsFromRedux & {
  data: TimeStepData[];
  isOpen: boolean;
  activeDayIndex: number;
  setActiveDayIndex: (i: number) => void;
  currentDayOffset: number;
};

const ForecastByHourList: React.FC<ForecastByHourListProps> = ({
  data,
  isOpen,
  activeDayIndex,
  setActiveDayIndex,
  currentDayOffset,
  displayParams,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const { colors, dark } = useTheme() as CustomTheme;
  const { t } = useTranslation('forecast');

  const virtualizedList = useRef() as React.MutableRefObject<
    VirtualizedList<TimeStepData>
  >;

  useEffect(() => {
    if (activeDayIndex !== currentIndex && data.length > 0) {
      const calculatedIndex = !activeDayIndex
        ? 0
        : currentDayOffset + (activeDayIndex - 1) * 24 + 12;

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

  const DayDurationRow = () => {
    const calculatedStepIndex = !currentIndex
      ? 0
      : currentDayOffset + (currentIndex - 1) * 24 + 12;
    const adjustedStepIndex =
      calculatedStepIndex > data.length ? data.length - 1 : calculatedStepIndex;

    const step = data[adjustedStepIndex];
    const sunrise = moment(step.sunrise);
    const sunset = moment(step.sunset);
    const dayHours = Math.floor(step.dayLength / 60);
    const dayMinutes = step.dayLength % 60;

    const isPolarNight = !step.sunriseToday && sunset.isBefore(sunrise);

    const isMidnightSun = !step.sunsetToday && sunrise.isBefore(sunset);

    return (
      <View
        style={[
          styles.dayLengthContainer,
          styles.forecastHeader,
          {
            borderColor: colors.border,
            backgroundColor: isOdd(displayParams.length)
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
          accessible
          style={[styles.row, styles.listContainer, styles.paddingHorizontal]}>
          {isPolarNight && !isMidnightSun && (
            <>
              <View
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
              <View style={[styles.row, styles.alignCenter]}>
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
                  accessibilityLabel={`${t('sunrise')} ${sunrise.format(
                    `DD.MM.YYYY [${t('at')}] HH:mm`
                  )}`}
                  style={[
                    styles.panelText,
                    styles.bold,
                    { color: colors.hourListText },
                  ]}>
                  {sunrise.format(`DD.MM.YYYY [${t('at')}] HH:mm`)}
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
              <View style={[styles.row, styles.alignCenter]}>
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
                  accessibilityLabel={`${t('sunset')} ${sunset.format(
                    `DD.MM.YYYY [${t('at')}] HH:mm`
                  )}`}
                  style={[
                    styles.panelText,
                    styles.bold,
                    { color: colors.hourListText },
                  ]}>
                  {sunset.format(`DD.MM.YYYY [${t('at')}] HH:mm`)}
                </Text>
              </View>
            </>
          )}
          {!isPolarNight && !isMidnightSun && (
            <>
              <View
                accessible
                style={[styles.row, styles.alignCenter, styles.listContainer]}>
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
                  accessibilityLabel={`${t('sunrise')} ${sunrise.format(
                    'HH:mm'
                  )}`}
                  style={[
                    styles.panelText,
                    styles.bold,
                    { color: colors.hourListText },
                  ]}>
                  {sunrise.format('HH:mm')}
                </Text>
              </View>
              <View
                style={[styles.row, styles.alignCenter, styles.listContainer]}>
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
                  accessibilityLabel={`${t('sunset')} ${sunset.format(
                    'HH:mm'
                  )}`}
                  style={[
                    styles.panelText,
                    styles.bold,
                    { color: colors.hourListText },
                  ]}>
                  {sunset.format('HH:mm')}
                </Text>
              </View>
              <View
                style={[styles.row, styles.alignCenter, styles.listContainer]}>
                <Icon
                  width={24}
                  height={24}
                  name="time"
                  style={[
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
      </View>
    );
  };

  const handleOnScroll = ({
    nativeEvent,
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = nativeEvent;
    let dayIndex = Math.ceil((contentOffset.x / 52 - currentDayOffset) / 24);
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
        <ForecastListHeaderColumn displayParams={displayParams} />
        <View style={styles.listContainer}>
          <VirtualizedList
            listKey="hoursList"
            ref={virtualizedList}
            data={data}
            keyExtractor={(item) => `${item.epochtime}`}
            getItem={(items, index) => items[index]}
            getItemCount={(items) => items && items.length}
            onScrollToIndexFailed={({ index }) => {
              console.warn(`scroll to index: ${index} failed`);
            }}
            renderItem={({ item }: any) => (
              <ForecastListColumn data={item} displayParams={displayParams} />
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
      <DayDurationRow />
      <LinearGradient
        pointerEvents="none"
        style={[styles.gradient, styles.gradientLeft]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        colors={
          dark
            ? [WHITE_OPACITY, BLACK_TRANSPARENT]
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
            ? [BLACK_TRANSPARENT, WHITE_OPACITY]
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
  bold: {
    fontFamily: 'Roboto-Bold',
  },
  panelText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
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
    height: '100%',
    zIndex: 3,
  },
  gradientLeft: {
    left: 52,
  },
  gradientRight: {
    right: 0,
  },
});

export default memo(connector(ForecastByHourList));
