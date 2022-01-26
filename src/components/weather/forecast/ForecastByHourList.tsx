import React, { memo, useState, useRef, useEffect } from 'react';
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

import Icon from '@components/common/Icon';

import { TimestepData } from '@store/forecast/types';
import { CustomTheme } from '@utils/colors';

import ForecastListColumn from './ForecastListColumn';
import ForecastListHeaderColumn from './ForecastListHeaderColumn';

type ForecastByHourListProps = {
  data: TimestepData[];
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
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation('forecast');

  const virtualizedList = useRef() as React.MutableRefObject<
    VirtualizedList<TimestepData>
  >;

  useEffect(() => {
    if (activeDayIndex !== currentIndex && data.length > 0) {
      const calculatedIndex = !activeDayIndex
        ? 0
        : currentDayOffset + (activeDayIndex - 1) * 24 + 12;

      const index =
        calculatedIndex > data.length ? data.length : calculatedIndex;
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
    const step = data[0];
    const sunrise = moment(step.sunrise);
    const sunset = moment(step.sunset);
    const dayHours = Math.floor(step.daylength / 60);
    const dayMinutes = step.daylength % 60;

    const isPolarNight = !step.sunrisetoday && sunset.isBefore(sunrise);

    const isMidnightSun = !step.sunsettoday && sunrise.isBefore(sunset);

    return (
      <View
        style={[
          styles.row,
          styles.dayLengthContainer,
          styles.forecastHeader,
          styles.justifySpaceAround,
          { borderBottomColor: colors.border },
        ]}>
        {isPolarNight && !isMidnightSun && (
          <>
            <View style={[styles.row, styles.alignCenter]}>
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
                width={24}
                height={24}
                name="sunrise"
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
                {sunrise.format(`DD.MM.YYYY [${t('at')}] HH:mm`)}
              </Text>
            </View>
          </>
        )}
        {isMidnightSun && !isPolarNight && (
          <>
            <View style={[styles.row, styles.alignCenter]}>
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
                width={24}
                height={24}
                name="sunset"
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
                {sunset.format(`DD.MM.YYYY [${t('at')}] HH:mm`)}
              </Text>
            </View>
          </>
        )}
        {!isPolarNight && !isMidnightSun && (
          <>
            <View style={[styles.row, styles.alignCenter]}>
              <Icon
                width={24}
                height={24}
                name="sunrise"
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
                {sunrise.format('HH:mm')}
              </Text>
            </View>
            <View style={[styles.row, styles.alignCenter]}>
              <Icon
                width={24}
                height={24}
                name="sunset"
                style={[styles.withMarginRight, { color: colors.hourListText }]}
              />
              <Text
                style={[
                  styles.panelText,
                  styles.bold,
                  { color: colors.hourListText },
                ]}>
                {sunset.format('HH:mm')}
              </Text>
            </View>
            <View style={[styles.row, styles.alignCenter]}>
              <Icon
                width={24}
                height={24}
                name="time"
                style={[styles.withMarginRight, { color: colors.hourListText }]}
              />
              <Text
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
    );
  };

  const handleOnScroll = ({
    nativeEvent,
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = nativeEvent;
    const dayIndex = Math.ceil((contentOffset.x / 48 - currentDayOffset) / 24);
    if (dayIndex !== currentIndex) setCurrentIndex(dayIndex);
    if (dayIndex !== activeDayIndex) {
      setActiveDayIndex(dayIndex);
    }
  };

  if (!isOpen) return null;

  return (
    <View style={[!isOpen && styles.displayNone]}>
      <View style={styles.row}>
        <ForecastListHeaderColumn />
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
            renderItem={({ item }: any) => <ForecastListColumn data={item} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={handleOnScroll}
            getItemLayout={(_, index: number) => ({
              length: 48,
              offset: index * 48,
              index,
            })}
          />
        </View>
      </View>

      <DayDurationRow />
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
    justifyContent: 'space-between',
    flex: 1,
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
    marginRight: 9,
  },
  forecastHeader: {
    height: 56,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  displayNone: {
    display: 'none',
  },
  alignCenter: {
    alignItems: 'center',
  },
  justifySpaceAround: {
    justifyContent: 'space-around',
  },
});

export default memo(ForecastByHourList);
