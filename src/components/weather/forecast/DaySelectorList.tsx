import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import moment from 'moment';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { CustomTheme } from '@utils/colors';
import { weatherSymbolGetter } from '@assets/images';
import { Config } from '@config';
import { converter, toPrecision } from '@utils/units';
import PrecipitationStrip from './PrecipitationStrip';

type DaySelectorListProps = {
  activeDayIndex: number;
  setActiveDayIndex: (i: number) => void;
  dayData: {
    maxTemperature: number;
    minTemperature: number;
    totalPrecipitation: number;
    timeStamp: number;
    smartSymbol: number | undefined;
    precipitationData: {
      precipitation: number | undefined;
      timestamp: number;
    }[];
  }[];
};

const DaySelectorList: React.FC<DaySelectorListProps> = ({
  activeDayIndex,
  setActiveDayIndex,
  dayData,
}) => {
  const { colors, dark } = useTheme() as CustomTheme;
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const dayStripRef = useRef() as React.MutableRefObject<ScrollView>;

  const activeParameters = Config.get('weather').forecast.data.flatMap(
    ({ parameters }) => parameters
  );

  const { temperature: temperatureUnit } = Config.get('settings').units;

  useEffect(() => {
    if (activeDayIndex >= 0 && dayData && dayData.length) {
      dayStripRef.current.scrollTo({
        x: activeDayIndex * 100,
        animated: true,
      });
    }
  }, [activeDayIndex, dayData]);

  const colRenderer = ({
    item,
    index,
  }: {
    item: {
      timeStamp: number;
      maxTemperature: number;
      minTemperature: number;
      smartSymbol: number | undefined;
      precipitationData: {
        precipitation: number | undefined;
        timestamp: number;
      }[];
    };
    index: number;
  }) => {
    const { timeStamp, maxTemperature, minTemperature, smartSymbol } = item;
    const stepMoment = moment.unix(timeStamp);
    const daySmartSymbol = weatherSymbolGetter(
      (smartSymbol || 0).toString(),
      dark
    );
    const isActive = index === activeDayIndex;

    const convertedMaxTemperature = toPrecision(
      'temperature',
      temperatureUnit,
      converter(temperatureUnit, maxTemperature)
    );
    const convertedMinTemperature = toPrecision(
      'temperature',
      temperatureUnit,
      converter(temperatureUnit, minTemperature)
    );

    const weekdayAbbreviationFormat = locale === 'en' ? 'ddd' : 'dd';
    const dateFormat = locale === 'en' ? 'D MMM' : 'D.M.';

    return (
      <View
        key={timeStamp}
        accessible
        accessibilityRole="button"
        style={[
          styles.dayBlock,
          isActive ? styles.activeBlock : undefined,
          index === 0 ? styles.leftBlock : undefined,
          index < dayData.length - 1 ? styles.noBorderRight : undefined,
          index === dayData.length - 1 ? styles.rightBlock : undefined,
          {
            backgroundColor: isActive ? colors.screenBackground : undefined,
            borderColor: colors.border,
            borderTopColor: isActive ? colors.tabBarActive : colors.border,
          },
        ]}>
        <AccessibleTouchableOpacity
          accessible
          accessibilityState={{ selected: isActive }}
          onPress={() => setActiveDayIndex(index)}>
          <Text
            style={[
              styles.dateText,
              {
                color: colors.primaryText,
              },
            ]}
            accessibilityLabel={stepMoment
              .locale(locale)
              .format('dddd, Do MMMM')}>
            {stepMoment.locale(locale).format(weekdayAbbreviationFormat)}{' '}
            <Text style={[styles.bold, { color: colors.primaryText }]}>
              {stepMoment.locale(locale).format(dateFormat)}
            </Text>
          </Text>
          <View
            style={styles.alignCenter}
            accessibilityLabel={`${t(`symbols:${smartSymbol}`)}`}>
            {daySmartSymbol?.({
              width: 40,
              height: 40,
            })}
          </View>
          {activeParameters.includes('temperature') && (
            <Text
              style={[styles.forecastText, { color: colors.primaryText }]}
              accessibilityLabel={t('forecast:fromTo', {
                min: convertedMinTemperature,
                max: convertedMaxTemperature,
                unit: t(
                  temperatureUnit === 'C'
                    ? 'forecast:celsius'
                    : 'forecast:fahrenheit'
                ),
              })}>{`${convertedMinTemperature} ... ${convertedMaxTemperature}°${temperatureUnit}`}</Text>
          )}
        </AccessibleTouchableOpacity>
        {activeParameters.includes('precipitation1h') && (
          <PrecipitationStrip
            precipitationData={item.precipitationData}
            style={styles.precipitationStrip}
          />
        )}
      </View>
    );
  };

  return (
    <ScrollView
      ref={dayStripRef}
      contentContainerStyle={styles.listContentContainer}
      horizontal
      showsHorizontalScrollIndicator={false}>
      {dayData.map((item, index) => colRenderer({ item, index }))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  listContentContainer: {
    paddingRight: 8,
    paddingTop: 10,
  },
  dayBlock: {
    minWidth: 100,
    borderWidth: 1,
    padding: 6,
    flex: 1,
    alignItems: 'center',
  },
  noBorderRight: {
    borderRightWidth: 0,
  },
  activeBlock: {
    borderTopWidth: 3,
    paddingTop: 4,
  },
  leftBlock: {
    borderTopLeftRadius: 4,
  },
  rightBlock: {
    borderTopRightRadius: 4,
  },
  alignCenter: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    textTransform: 'capitalize',
  },
  forecastText: {
    fontSize: 16,
    fontFamily: 'Roboto-Light',
  },
  bold: {
    fontFamily: 'Roboto-Regular',
  },
  precipitationStrip: {
    marginBottom: -6,
    marginHorizontal: -6,
    marginTop: 4,
  },
});

export default DaySelectorList;
