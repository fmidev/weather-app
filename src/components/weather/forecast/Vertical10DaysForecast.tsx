import React, { useEffect, useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import moment from '@utils/moment';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import Text from '@components/common/AppText';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { CustomTheme } from '@assets/colors';
import { weatherSymbolGetter } from '@assets/images';
import { Config } from '@config';
import {
  converter,
  getForecastParameterUnitTranslationKey,
  toPrecision,
} from '@utils/units';
import PrecipitationStrip from './PrecipitationStrip';
import { selectUnits } from '@store/settings/selectors';
import { State } from '@store/types';
import {
  selectDisplayParams,
  selectForecastByDay,
  selectForecastInvalidData,
  selectShowSingleHourlyForecast,
} from '@store/forecast/selectors';

import Icon from '@components/common/ScalableIcon';
import {
  formatAccessibleDate,
  formatAccessibleTemperature,
} from '@utils/helpers';
import HourlyForecast from './HourlyForecast';
import { trackMatomoEvent } from '@utils/matomo';
import { REGULAR_FONT, BOLD_FONT } from '@assets/constants';

const mapStateToProps = (state: State) => ({
  units: selectUnits(state),
  invalidData: selectForecastInvalidData(state),
  displayParams: selectDisplayParams(state),
  forecastByDay: selectForecastByDay(state),
  showSingleHourlyForecast: selectShowSingleHourlyForecast(state),
});

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

type DaySelectorListProps = PropsFromRedux & {
  dayData: {
    maxTemperature: number;
    minTemperature: number;
    minWindSpeed: number;
    maxWindSpeed: number;
    totalPrecipitation: number;
    precipitationMissing: boolean;
    timeStamp: number;
    smartSymbol: number | undefined;
    precipitationData: {
      precipitation: number | undefined;
      timestamp: number;
    }[];
  }[];
};

const Vertical10DaysForecast: React.FC<DaySelectorListProps> = ({
  dayData,
  units,
  invalidData,
  forecastByDay,
  showSingleHourlyForecast,
}) => {
  const { width, fontScale } = useWindowDimensions();
  const { colors, dark } = useTheme() as CustomTheme;
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const decimalSeparator = locale === 'en' ? '.' : ',';
  const isWideDisplay = () => width > 500;
  const largeFonts = fontScale >= 1.5;

  const weatherConfig = Config.get('weather');
  const activeParameters = weatherConfig.forecast.data.flatMap(
    ({ parameters }) => parameters
  );

  const defaultUnits = Config.get('settings').units;
  const temperatureUnit =
    units?.temperature.unitAbb ?? defaultUnits.temperature;
  const windUnit = units?.wind.unitAbb ?? defaultUnits.wind;
  const precipitationUnit =
    units?.precipitation.unitAbb ?? defaultUnits.precipitation;

  const [expandedDayIndexes, setExpandedDayIndexes] = useState<Set<number>>(
    () => new Set()
  );

  useEffect(() => {
    if (!showSingleHourlyForecast) return;

    setExpandedDayIndexes((currentIndexes) => {
      if (currentIndexes.size <= 1) return currentIndexes;

      const firstExpandedIndex = currentIndexes.values().next().value;
      return firstExpandedIndex === undefined
        ? new Set()
        : new Set([firstExpandedIndex]);
    });
  }, [showSingleHourlyForecast]);

  const rowRenderer = ({
    item,
    index,
  }: {
    item: {
      timeStamp: number;
      maxTemperature: number;
      minTemperature: number;
      minWindSpeed: number;
      maxWindSpeed: number;
      totalPrecipitation: number;
      precipitationMissing: boolean;
      smartSymbol: number | undefined;
      precipitationData: {
        precipitation: number | undefined;
        timestamp: number;
      }[];
    };
    index: number;
  }) => {
    const {
      timeStamp,
      maxTemperature,
      minTemperature,
      maxWindSpeed,
      minWindSpeed,
      smartSymbol,
      totalPrecipitation,
      precipitationMissing,
    } = item;
    const stepMoment = moment.unix(timeStamp).locale(locale);
    const DaySmartSymbol = weatherSymbolGetter(
      (smartSymbol || 0).toString(),
      dark
    );

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
    const convertedMaxWindSpeed = invalidData
      ? '-'
      : toPrecision('wind', windUnit, converter(windUnit, maxWindSpeed));
    const convertedMinWindSpeed = invalidData
      ? '-'
      : toPrecision('wind', windUnit, converter(windUnit, minWindSpeed));

    const convertedTotalPrecipitation =
      invalidData || precipitationMissing
        ? '-'
        : toPrecision(
            'precipitation',
            precipitationUnit,
            converter(precipitationUnit, totalPrecipitation)
          );

    const symbolSize = Math.min(64, fontScale * 44);
    const rowHeight = fontScale ? 80 : 70;
    const isExpanded = expandedDayIndexes.has(index);
    const forecastKey = moment.unix(timeStamp).format('D.M.');
    const hourlyForecast = forecastByDay
      ? (forecastByDay[forecastKey] ?? [])
      : [];

    return (
      <View key={stepMoment.unix()}>
        <AccessibleTouchableOpacity
          accessibilityRole="button"
          accessibilityHint={t(
            isExpanded
              ? 'forecast:hideHourlyForecast'
              : 'forecast:showHourlyForecast'
          )}
          accessibilityState={{ expanded: isExpanded }}
          onPress={() => {
            trackMatomoEvent(
              'User action',
              'Weather',
              `${isExpanded ? 'Hide' : 'Show'} hourly forecast - day ${index + 1}`
            );
            setExpandedDayIndexes((currentIndexes) => {
              if (showSingleHourlyForecast) {
                return currentIndexes.has(index) ? new Set() : new Set([index]);
              }
              const nextIndexes = new Set(currentIndexes);
              if (nextIndexes.has(index)) {
                nextIndexes.delete(index);
              } else {
                nextIndexes.add(index);
              }
              return nextIndexes;
            });
          }}>
          <View
            style={[
              styles.container,
              { height: rowHeight },
              isExpanded && { backgroundColor: colors.listTint },
            ]}>
            <View
              testID={`daily-forecast-row-${index}`}
              style={[
                styles.row,
                isExpanded ? styles.expandedRow : styles.collapsedRow,
                { borderColor: colors.border },
              ]}>
              <View
                accessible
                accessibilityLabel={formatAccessibleDate(stepMoment, false)}
                style={styles.day}>
                <Text
                  style={[
                    styles.text,
                    styles.bold,
                    { color: colors.primaryText },
                  ]}>
                  {stepMoment.formatDateTime('weekdayAbbreviation', locale)}
                </Text>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={[styles.text, { color: colors.primaryText }]}>
                  {stepMoment.formatDateTime('date', locale)}
                </Text>
              </View>
              <View accessible accessibilityLabel={t(`symbols:${smartSymbol}`)}>
                {DaySmartSymbol ? (
                  <DaySmartSymbol width={symbolSize} height={symbolSize} />
                ) : null}
              </View>
              {activeParameters.includes('temperature') && (
                <Text
                  style={[
                    styles.text,
                    styles.temperatureWidth,
                    { color: colors.primaryText },
                  ]}
                  accessibilityLabel={`${t('forecast:temperature')} ${t(
                    'forecast:fromTo',
                    {
                      min: formatAccessibleTemperature(
                        convertedMinTemperature,
                        t
                      ),
                      max: formatAccessibleTemperature(
                        convertedMaxTemperature,
                        t
                      ),
                      unit: t(
                        temperatureUnit === 'C'
                          ? 'forecast:celsius'
                          : 'forecast:fahrenheit'
                      ),
                    }
                  )}`}>
                  {`${convertedMinTemperature}°`}
                  <Text maxFontSizeMultiplier={1.5}> ... </Text>
                  {`${convertedMaxTemperature}°`}
                </Text>
              )}
              {isWideDisplay() && activeParameters.includes('windSpeedMS') && (
                <View style={styles.flexRow}>
                  <Icon
                    name="wind"
                    height={28}
                    width={20}
                    color={colors.hourListText}
                  />
                  <Text
                    style={[
                      styles.text,
                      styles.windWidth,
                      { color: colors.primaryText },
                    ]}
                    accessibilityLabel={`${t('forecast:windSpeed')} ${t(
                      'forecast:fromTo',
                      {
                        min: convertedMinWindSpeed,
                        max: convertedMaxWindSpeed,
                        unit: t(
                          windUnit === 'm/s'
                            ? 'forecast:metersPerSecond'
                            : 'forecast:kilometersPerHour'
                        ),
                      }
                    )}`}>
                    {`${convertedMinWindSpeed}`}
                    <Text maxFontSizeMultiplier={1.5}> ... </Text>
                    {`${convertedMaxWindSpeed} ${windUnit}`}
                  </Text>
                </View>
              )}
              {activeParameters.includes('precipitation1h') && (
                <View style={styles.precipitationContainer}>
                  <View style={[styles.flex, styles.flexRow, styles.center]}>
                    {!largeFonts && (
                      <Icon
                        width={18}
                        height={18}
                        name="precipitation"
                        color={colors.hourListText}
                      />
                    )}
                    <Text
                      style={[styles.text, { color: colors.hourListText }]}
                      maxFontSizeMultiplier={1.2}
                      accessibilityLabel={
                        precipitationMissing
                          ? t('forecast:precipitationMissing')
                          : `${t('forecast:precipitation')} ${
                              totalPrecipitation
                                ?.toString()
                                .replace('.', decimalSeparator) ||
                              (0).toFixed(1).replace('.', decimalSeparator)
                            } ${t(
                              `forecast:${getForecastParameterUnitTranslationKey(
                                precipitationUnit
                              )}`
                            )}`
                      }>
                      <Text style={styles.text}>{`${
                        convertedTotalPrecipitation?.replace(
                          '.',
                          decimalSeparator
                        ) || (0).toFixed(1).replace('.', decimalSeparator)
                      }`}</Text>
                      {` ${t(`unitAbbreviations:${precipitationUnit}`)}`}
                    </Text>
                  </View>
                  <PrecipitationStrip
                    precipitationData={item.precipitationData}
                    border
                  />
                </View>
              )}
            </View>
          </View>
        </AccessibleTouchableOpacity>
        {isExpanded && (
          <View
            testID={`hourly-forecast-${index}`}
            style={[
              styles.hourlyForecastContainer,
              { borderColor: colors.border },
            ]}>
            <HourlyForecast
              data={hourlyForecast}
              initialScrollHour={
                weatherConfig.layout === 'vertical' && !isWideDisplay()
                  ? 8
                  : undefined
              }
            />
          </View>
        )}
      </View>
    );
  };

  return <>{dayData.map((item, index) => rowRenderer({ item, index }))}</>;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 70,
  },
  flex: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 16,
  },
  collapsedRow: {
    borderBottomWidth: 1,
  },
  expandedRow: {
    borderBottomWidth: 0,
  },
  bold: {
    fontFamily: BOLD_FONT,
  },
  text: {
    fontSize: 16,
    fontFamily: REGULAR_FONT,
  },
  precipitationContainer: {
    width: 80,
  },
  day: {
    width: 58,
  },
  hourlyForecastContainer: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  temperatureWidth: {
    width: 130,
    textAlign: 'center',
  },
  windWidth: {
    width: 150,
  },
});

export default connector(Vertical10DaysForecast);
