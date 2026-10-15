import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import moment from 'moment';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { CustomTheme } from '@assets/colors';
import { weatherSymbolGetter } from '@assets/images';
import { Config } from '@config';
import { converter, toPrecision } from '@utils/units';
import PrecipitationStrip from './PrecipitationStrip';
import { selectUnits } from '@store/settings/selectors';
import { State } from '@store/types';
import { selectForecastInvalidData } from '@store/forecast/selectors';
import { REGULAR_FONT, BOLD_FONT } from '@assets/constants';
import {
  formatAccessiblePrecipitation,
  formatAccessibleTemperature,
} from '@utils/accessibility';

const mapStateToProps = (state: State) => ({
  units: selectUnits(state),
  invalidData: selectForecastInvalidData(state),
});

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

type DaySelectorListProps = PropsFromRedux & {
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
  units,
  invalidData,
}) => {
  const { colors, dark } = useTheme() as CustomTheme;
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const dayStripRef = useRef<ScrollView>(null);

  const activeParameters = Config.get('weather').forecast.data.flatMap(
    ({ parameters }) => parameters
  );

  const defaultUnits = Config.get('settings').units;
  const temperatureUnit =
    units?.temperature.unitAbb ?? defaultUnits.temperature;
  const precipitationUnit =
    units?.precipitation?.unitAbb ?? defaultUnits.precipitation;

  useEffect(() => {
    if (
      activeDayIndex >= 0 &&
      dayData &&
      dayData.length &&
      dayStripRef.current
    ) {
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
    const DaySmartSymbol = weatherSymbolGetter(
      (smartSymbol || 0).toString(),
      dark
    );
    const isActive = index === activeDayIndex;

    const convertedMaxTemperature = invalidData
      ? '-'
      : toPrecision(
          'temperature',
          temperatureUnit,
          converter(temperatureUnit, maxTemperature)
        );
    const convertedMinTemperature = invalidData
      ? '-'
      : toPrecision(
          'temperature',
          temperatureUnit,
          converter(temperatureUnit, minTemperature)
        );

    const weekdayAbbreviationFormat = locale === 'en' ? 'ddd' : 'dd';
    const dateFormat = locale === 'en' ? 'D MMM' : 'D.M.';
    const dateDescription = stepMoment.locale(locale).format('dddd, Do MMMM');
    const weatherDescription = t(`symbols:${smartSymbol ?? 0}`);
    const temperatureDescription = activeParameters.includes('temperature')
      ? t('forecast:fromTo', {
          min: formatAccessibleTemperature(convertedMinTemperature, t),
          max: formatAccessibleTemperature(convertedMaxTemperature, t),
          unit: t(
            temperatureUnit === 'C' ? 'forecast:celsius' : 'forecast:fahrenheit'
          ),
        })
      : '';
    const precipitationDescription = activeParameters.includes(
      'precipitation1h'
    )
      ? invalidData
        ? t('forecast:precipitationMissing')
        : formatAccessiblePrecipitation(
            item.precipitationData,
            precipitationUnit,
            locale,
            t
          )
      : '';
    const dayDescription = [
      dateDescription,
      weatherDescription,
      temperatureDescription,
      precipitationDescription,
    ]
      .filter(Boolean)
      .join('. ');

    return (
      <View
        key={timeStamp}
        accessible={false}
        focusable={false}
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
          accessibilityRole="button"
          accessibilityLabel={dayDescription}
          accessibilityState={{ selected: isActive }}
          onPress={() => setActiveDayIndex(index)}>
          <Text
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[
              styles.dateText,
              {
                color: colors.primaryText,
              },
            ]}
            accessibilityLabel={dateDescription}>
            {stepMoment.locale(locale).format(weekdayAbbreviationFormat)}{' '}
            <Text style={[styles.bold, { color: colors.primaryText }]}>
              {stepMoment.locale(locale).format(dateFormat)}
            </Text>
          </Text>
          <View
            accessible={false}
            focusable={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.alignCenter}
            accessibilityLabel={weatherDescription}>
            {DaySmartSymbol ? <DaySmartSymbol width={40} height={40} /> : null}
          </View>
          {activeParameters.includes('temperature') && (
            <Text
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[styles.forecastText, { color: colors.primaryText }]}
              accessibilityLabel={
                temperatureDescription
              }>{`${convertedMinTemperature} ... ${convertedMaxTemperature}°${t(`unitAbbreviations:${temperatureUnit}`)}`}</Text>
          )}
        </AccessibleTouchableOpacity>
        {activeParameters.includes('precipitation1h') && (
          <PrecipitationStrip
            accessible={false}
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
    fontFamily: REGULAR_FONT,
    textTransform: 'capitalize',
  },
  forecastText: {
    fontSize: 14,
    fontFamily: REGULAR_FONT,
  },
  bold: {
    fontFamily: BOLD_FONT,
  },
  precipitationStrip: {
    marginBottom: -6,
    marginHorizontal: -6,
    marginTop: 4,
  },
});

export default connector(DaySelectorList);
