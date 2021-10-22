import React, { memo, useState, useRef } from 'react';
import {
  View,
  Text,
  VirtualizedList,
  StyleSheet,
  TouchableOpacity,
  ViewToken,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import Icon from '@components/common/Icon';

import { TimestepData } from '@store/forecast/types';

import { weatherSymbolGetter } from '@assets/images';
import { CustomTheme } from '@utils/colors';

type ForecastByHourListProps = {
  dayForecast: TimestepData[];
  isOpen: boolean;
};

const ForecastByHourList: React.FC<ForecastByHourListProps> = ({
  dayForecast,
  isOpen,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const { colors, dark } = useTheme() as CustomTheme;
  const { t } = useTranslation('forecast');
  const virtualizedList = useRef() as React.MutableRefObject<
    VirtualizedList<TimestepData>
  >;

  if (!isOpen && !dayForecast) return null;
  const DayDurationRow = () => {
    const step = dayForecast[0];
    const sunrise = moment(step.sunrise);
    const sunset = moment(step.sunset);
    const dayDuration = moment.duration(sunset.diff(sunrise));

    const dayLength = moment
      .utc(dayDuration.asMilliseconds())
      .format('HH [h] mm [min]');

    return (
      <View
        style={[
          styles.row,
          styles.dayLengthContainer,
          styles.forecastHeader,
          styles.alignStart,
          { borderBottomColor: colors.border },
        ]}>
        <View style={styles.withMarginRight}>
          <Icon
            width={24}
            height={24}
            name="sunrise"
            style={[
              styles.withMarginRight,
              {
                color: colors.text,
              },
            ]}
          />
        </View>
        <View>
          <Text style={[styles.panelText, { color: colors.text }]}>
            {t('sunrise')}{' '}
            <Text style={styles.bold}>{sunrise.format('HH:mm')}</Text>{' '}
            {t('sunset')}{' '}
            <Text style={styles.bold}>{sunset.format('HH:mm')}</Text>
          </Text>
          <Text style={[styles.panelText, { color: colors.text }]}>
            {t('dayLength')} <Text style={styles.bold}>{dayLength}</Text>
          </Text>
        </View>
      </View>
    );
  };

  const columnRenderer = ({ item }: { item: TimestepData }) => {
    const dayStepMoment = moment.unix(item.epochtime);
    const dayTempPrefix = item.temperature > 0 ? '+' : '';
    // const feelsLikePrefix = item.feelsLike > 0 ? '+' : '';
    const hourSmartSymbol = weatherSymbolGetter(
      item.smartSymbol.toString(),
      dark
    );

    const precipitation = item.precipitation1h || '-';

    return (
      <View
        style={[
          styles.hourColumn,
          // index === 0 && styles.withBorderLeft,
          { borderColor: colors.border },
        ]}>
        <View style={styles.hourBlock}>
          <Text
            style={[
              styles.panelText,
              styles.medium,
              { color: colors.hourListText },
            ]}>
            {dayStepMoment.format('HH:mm')}
          </Text>
        </View>

        <View>
          {hourSmartSymbol?.({
            width: 40,
            height: 40,
          })}
        </View>
        <View style={styles.hourBlock}>
          <Text
            style={[
              styles.hourText,
              { color: colors.hourListText },
            ]}>{`${dayTempPrefix}${item.temperature}°`}</Text>
        </View>
        <View style={styles.windBlock}>
          <Icon
            name={dark ? 'wind-dark' : 'wind-light'}
            width={20}
            height={20}
            style={{
              transform: [
                {
                  rotate: `${item.winddirection + 45 - 180}deg`,
                },
              ],
            }}
          />
          <Text
            style={[
              styles.hourText,
              styles.withMarginTop,
              { color: colors.hourListText },
            ]}>
            {item.windspeedms}
          </Text>
        </View>

        <View style={styles.hourBlock}>
          <Text style={[styles.hourText, { color: colors.hourListText }]}>
            {precipitation}
          </Text>
        </View>
      </View>
    );
  };

  const handleViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken[];
  }) => {
    const firstViewable = viewableItems[0];
    if (!firstViewable) return;
    const { index } = firstViewable;
    if (typeof index === 'number') {
      setCurrentIndex(index);
    }
  };

  const handleMoveBack = () => {
    if (currentIndex === dayForecast.length - 1) {
      if (currentIndex - 12 >= 6) {
        setCurrentIndex(currentIndex - 12);
        virtualizedList.current.scrollToIndex({
          index: currentIndex - 12,
          animated: true,
        });
        return;
      }
      setCurrentIndex(0);
      virtualizedList.current.scrollToIndex({ index: 0, animated: true });
    }
    if (currentIndex >= 6) {
      const i = currentIndex - 6;

      setCurrentIndex(i);
      virtualizedList.current.scrollToIndex({ index: i, animated: true });
    }
    if (currentIndex < 6 && currentIndex > 0) {
      setCurrentIndex(0);
      virtualizedList.current.scrollToIndex({ index: 0, animated: true });
    }
  };

  const handleMoveForward = () => {
    if (currentIndex + 6 <= dayForecast.length - 1) {
      const i = currentIndex + 6;
      setCurrentIndex(i);
      virtualizedList.current.scrollToIndex({ index: i, animated: true });
    }
    if (
      currentIndex + 6 > dayForecast.length - 1 &&
      currentIndex < dayForecast.length - 1
    ) {
      const index = dayForecast.length - 1 - 6;
      setCurrentIndex(index);
      virtualizedList.current.scrollToIndex({
        index,
        animated: true,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <View style={[!isOpen && styles.displayNone]}>
      <View style={styles.row}>
        <View
          style={[
            styles.iconColumn,
            {
              borderColor: colors.border,
            },
          ]}>
          <View style={styles.hourBlock}>
            <Icon name="time-outline" size={16} color={colors.hourListText} />
          </View>
          <View style={styles.hourBlock}>
            <Icon name="cloud-outline" size={16} color={colors.hourListText} />
          </View>
          <View style={styles.hourBlock}>
            <Icon
              name="thermometer-outline"
              size={16}
              color={colors.hourListText}
            />
          </View>
          <View style={styles.windBlock}>
            <Icon
              name="trending-up-outline"
              size={16}
              color={colors.hourListText}
            />
            <Text style={[styles.panelText, { color: colors.hourListText }]}>
              m/s
            </Text>
          </View>
          <View style={styles.hourBlock}>
            <Icon
              name="umbrella-outline"
              size={16}
              color={colors.hourListText}
            />
            <Text style={[styles.panelText, { color: colors.hourListText }]}>
              mm
            </Text>
          </View>
        </View>
        <View style={styles.listContainer}>
          <VirtualizedList
            ref={virtualizedList}
            data={dayForecast}
            getItem={(data, index) => data[index]}
            getItemCount={(data) => data && data.length}
            keyExtractor={(item) => `${item.epochtime}`}
            renderItem={columnRenderer}
            horizontal
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={handleViewableItemsChanged}
            getItemLayout={(data: TimestepData, index: number) => ({
              length: 48,
              offset: index * 48,
              index,
            })}
            initialScrollIndex={dayForecast.length === 24 ? 9 : 0}
          />
          <View
            style={[
              styles.row,
              styles.listActionButtonContainer,
              { borderColor: colors.border },
            ]}>
            <TouchableOpacity
              style={[
                styles.listActionButton,
                currentIndex === 0 && styles.disabled,
              ]}
              onPress={handleMoveBack}
              disabled={currentIndex === 0}>
              <Icon
                name="arrow-left"
                color={colors.primaryText}
                width={24}
                height={24}
              />
            </TouchableOpacity>
            <View
              style={[
                styles.separator,
                {
                  backgroundColor: colors.border,
                },
              ]}
            />
            <TouchableOpacity
              style={[
                styles.listActionButton,
                currentIndex + 7 > dayForecast.length - 1 && styles.disabled,
              ]}
              onPress={handleMoveForward}
              disabled={currentIndex + 6 > dayForecast.length - 1}>
              <Icon
                name="arrow-right"
                color={colors.primaryText}
                width={24}
                height={24}
              />
            </TouchableOpacity>
          </View>
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
  medium: {
    fontFamily: 'Roboto-Medium',
  },
  panelText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  alignStart: {
    justifyContent: 'flex-start',
  },
  withMarginRight: {
    marginRight: 9,
  },
  withMarginTop: {
    marginTop: 2,
  },
  forecastHeader: {
    height: 56,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  hourText: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  displayNone: {
    display: 'none',
  },
  iconColumn: {
    width: 48,
    borderWidth: 1,
    borderTopWidth: 0,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  hourColumn: {
    width: 48,
    borderRightWidth: 1,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  hourBlock: { height: 40, justifyContent: 'center', alignItems: 'center' },
  windBlock: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: '70%',
    width: 1,
    alignSelf: 'center',
  },
  listActionButton: {
    height: 44,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listActionButtonContainer: {
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default memo(ForecastByHourList);
