import React, { memo, useState, useRef } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  View,
  Text,
  VirtualizedList,
  StyleSheet,
  TouchableOpacity,
  ViewToken,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';
import moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';

import Icon from '@components/common/Icon';

import { State } from '@store/types';
import { TimestepData } from '@store/forecast/types';
import { selectDisplayParams } from '@store/forecast/selectors';

import { weatherSymbolGetter } from '@assets/images';
import {
  WHITE,
  WHITE_TRANSPARENT,
  GRAY_6,
  GRAY_6_TRANSPARENT,
  CustomTheme,
} from '@utils/colors';
import * as constants from '@store/forecast/constants';

const mapStateToProps = (state: State) => ({
  displayParams: selectDisplayParams(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type ForecastByHourListProps = PropsFromRedux & {
  dayForecast: TimestepData[];
  isOpen: boolean;
};

const ForecastByHourList: React.FC<ForecastByHourListProps> = ({
  displayParams,
  dayForecast,
  isOpen,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLastVisible, setIsLastVisible] = useState<boolean>(false);
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
          styles.justifySpaceAround,
          { borderBottomColor: colors.border },
        ]}>
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
            {dayLength}
          </Text>
        </View>
      </View>
    );
  };

  const columnRenderer = ({ item }: { item: TimestepData }) => {
    const dayStepMoment = moment.unix(item.epochtime);
    const dayTempPrefix = item.temperature > 0 ? '+' : '';
    const feelsLikePrefix = item.feelsLike > 0 ? '+' : '';
    const hourSmartSymbol = weatherSymbolGetter(
      item.smartSymbol.toString(),
      dark
    );

    return (
      <View style={[styles.hourColumn, { borderColor: colors.border }]}>
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
        {displayParams.map(([i, param]) => {
          if (param === constants.SMART_SYMBOL) {
            return (
              <View key={i}>
                {hourSmartSymbol?.({
                  width: 40,
                  height: 40,
                })}
              </View>
            );
          }
          if (param === constants.WIND_SPEED_AND_DIRECTION) {
            return (
              <View key={i} style={styles.windBlock}>
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
            );
          }
          if (param === constants.TEMPERATURE) {
            return (
              <View key={i} style={styles.hourBlock}>
                <Text
                  style={[
                    styles.hourText,
                    { color: colors.hourListText },
                  ]}>{`${dayTempPrefix}${item.temperature}°`}</Text>
              </View>
            );
          }
          if (param === constants.FEELS_LIKE) {
            return (
              <View key={i} style={styles.hourBlock}>
                <Text
                  style={[
                    styles.hourText,
                    { color: colors.hourListText },
                  ]}>{`${feelsLikePrefix}${item.feelsLike}°`}</Text>
              </View>
            );
          }
          return (
            <View
              key={i}
              style={
                param === constants.PRECIPITATION_1H ||
                param === constants.WIND_GUST
                  ? styles.windBlock
                  : styles.hourBlock
              }>
              <Text style={[styles.hourText, { color: colors.hourListText }]}>
                {item[param]}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const handleViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken[];
  }) => {
    const isLastItemVisible =
      viewableItems[viewableItems.length - 1] &&
      viewableItems[viewableItems.length - 1].index === dayForecast.length - 1;
    setIsLastVisible(isLastItemVisible);
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
            <Icon name="clock" color={colors.hourListText} />
          </View>
          {displayParams.map(([i, param]) => {
            if (param === constants.WIND_SPEED_AND_DIRECTION) {
              return (
                <View key={i} style={styles.windBlock}>
                  <Icon name="wind" color={colors.hourListText} />
                  <Text
                    style={[styles.panelText, { color: colors.hourListText }]}>
                    m/s
                  </Text>
                </View>
              );
            }
            if (param === constants.WIND_GUST) {
              return (
                <View key={i} style={styles.windBlock}>
                  <Icon name="gust" color={colors.hourListText} />
                  <Text
                    style={[styles.panelText, { color: colors.hourListText }]}>
                    m/s
                  </Text>
                </View>
              );
            }
            if (param === constants.PRECIPITATION_1H) {
              return (
                <View key={i} style={styles.windBlock}>
                  <Icon name="precipitation" color={colors.hourListText} />
                  <Text
                    style={[styles.panelText, { color: colors.hourListText }]}>
                    mm
                  </Text>
                </View>
              );
            }

            if (param === constants.PRECIPITATION_PROBABILITY) {
              return (
                <View key={i} style={[styles.hourBlock, styles.row]}>
                  <Icon name="precipitation" color={colors.hourListText} />
                  <Text
                    style={[styles.panelText, { color: colors.hourListText }]}>
                    %
                  </Text>
                </View>
              );
            }

            if (param === constants.RELATIVE_HUMIDITY) {
              return (
                <View key={i} style={styles.hourBlock}>
                  <Text
                    style={[styles.panelText, { color: colors.hourListText }]}>
                    RH%
                  </Text>
                </View>
              );
            }

            if (param === constants.PRESSURE) {
              return (
                <View key={i} style={styles.hourBlock}>
                  <Text
                    style={[styles.panelText, { color: colors.hourListText }]}>
                    hPa
                  </Text>
                </View>
              );
            }
            return (
              <View key={i} style={styles.hourBlock}>
                <Icon
                  name={constants.PARAMS_TO_ICONS[param]}
                  color={colors.hourListText}
                />
              </View>
            );
          })}
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
          {currentIndex !== 0 && (
            <LinearGradient
              style={[styles.gradient, styles.gradientLeft]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              colors={
                dark ? [GRAY_6, GRAY_6_TRANSPARENT] : [WHITE, WHITE_TRANSPARENT]
              }
            />
          )}
          {!isLastVisible && (
            <LinearGradient
              style={[styles.gradient, styles.gradientRight]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              colors={
                dark ? [GRAY_6_TRANSPARENT, GRAY_6] : [WHITE_TRANSPARENT, WHITE]
              }
            />
          )}
          <View
            style={[
              styles.row,
              styles.listActionButtonContainer,
              styles.noBorderLeft,
              { borderColor: colors.border },
            ]}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('hourList.moveBackAccessibilityLabel')}
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
              accessibilityRole="button"
              accessibilityLabel={t('hourList.moveForwardAccessibilityLabel')}
              style={[
                styles.listActionButton,
                isLastVisible && styles.disabled,
              ]}
              onPress={handleMoveForward}
              disabled={isLastVisible}>
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
    fontFamily: 'Roboto-Medium',
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
    zIndex: 4,
  },
  noBorderLeft: {
    borderLeftWidth: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  alignCenter: {
    alignItems: 'center',
  },
  justifySpaceAround: {
    justifyContent: 'space-around',
  },
  gradient: {
    position: 'absolute',
    width: 32,
    height: '100%',
    zIndex: 3,
  },
  gradientLeft: {
    left: 0,
  },
  gradientRight: {
    right: 0,
  },
});

export default memo(connector(ForecastByHourList));
