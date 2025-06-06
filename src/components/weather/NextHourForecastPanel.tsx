import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import moment from 'moment-timezone';
import 'moment/locale/fi';
import 'moment/locale/sv';
import 'moment/locale/en-gb';
import 'moment/locale/es';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { State } from '@store/types';

import {
  selectLoading,
  selectNextHourForecast,
} from '@store/forecast/selectors';
import { selectTimeZone } from '@store/location/selector';
import { selectUnits } from '@store/settings/selectors';
import { weatherSymbolGetter } from '@assets/images';

import { getFeelsLikeIconName, getWindDirection } from '@utils/helpers';
import { CustomTheme, GRAY_1 } from '@assets/colors';

import Icon from '@assets/Icon';
import { Config } from '@config';
import {
  converter,
  toPrecision,
  getForecastParameterUnitTranslationKey,
} from '@utils/units';
import { selectClockType } from '@store/settings/selectors';

const mapStateToProps = (state: State) => ({
  clockType: selectClockType(state),
  loading: selectLoading(state),
  nextHourForecast: selectNextHourForecast(state),
  timezone: selectTimeZone(state),
  units: selectUnits(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type NextHourForecastPanelProps = PropsFromRedux & {
  currentHour: number;
};

const NextHourForecastPanel: React.FC<NextHourForecastPanelProps> = ({
  clockType,
  loading,
  nextHourForecast,
  timezone,
  units,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  currentHour, // To force re-render when the hour changes
}) => {
  const { t, i18n } = useTranslation('forecast');
  const locale = i18n.language;
  const decimalSeparator = locale === 'en' ? '.' : ',';
  const { colors, dark } = useTheme() as CustomTheme;
  useEffect(() => {
    moment.tz.setDefault(timezone);
  }, [timezone]);

  if (loading || !nextHourForecast) {
    return (
      <View style={styles.container}>
        <ActivityIndicator accessibilityLabel={t('weather:loading')} />
      </View>
    );
  }
  const activeParameters = Config.get('weather').forecast.data.flatMap(
    ({ parameters }) => parameters
  );

  const defaultUnits = Config.get('settings').units;
  const temperatureUnit =
    units?.temperature.unitAbb ?? defaultUnits.temperature;
  const windUnit = units?.wind.unitAbb ?? defaultUnits.wind;
  const precipitationUnit =
    units?.precipitation.unitAbb ?? defaultUnits.precipitation;

  const currentTime = moment.unix(nextHourForecast.epochtime);
  const smartSymbol = weatherSymbolGetter(
    nextHourForecast?.smartSymbol?.toString() || '0',
    dark
  );

  const numericOrDash = (val: string | undefined | null): string =>
    val && !Number.isNaN(val) ? val : '-';

  const convertValue = (
    unit: string,
    unitAbb: string,
    val: number | undefined | null
  ) => {
    const result =
      val || val === 0
        ? toPrecision(unit, unitAbb, converter(unitAbb, val))
        : null;
    return result;
  };

  const temperatureValue = convertValue(
    'temperature',
    temperatureUnit,
    nextHourForecast.temperature
  );

  const feelsLikeValue = convertValue(
    'temperature',
    temperatureUnit,
    nextHourForecast.feelsLike
  );

  const windSpeedValue = convertValue(
    'wind',
    windUnit,
    nextHourForecast.windSpeedMS
  );

  const precipitationValue = convertValue(
    'precipitation',
    precipitationUnit,
    nextHourForecast.precipitation1h
  );

  return (
    <View style={styles.container}>
      <View style={styles.alignCenter} accessible accessibilityRole="header">
        <Text style={[styles.text, styles.bold, { color: colors.primaryText }]}>
          {t('nextHourForecast')}
        </Text>
        <Text
          style={[
            styles.text,
            styles.bold,
            { color: colors.primaryText },
          ]}>{`${t('at')} ${currentTime.format(
          clockType === 12 ? 'h.mm a' : 'HH.mm'
        )}`}</Text>
      </View>
      <View style={styles.row}>
        <View
          accessible
          accessibilityLabel={`${t(
            `symbols:${nextHourForecast.smartSymbol}`
          )}`}>
          {smartSymbol?.({
            width: 100,
            height: 100,
          })}
        </View>
        {activeParameters.includes('temperature') && (
          <View style={[styles.row, styles.alignStart]} accessible>
            <Text
              style={[styles.temperatureText, { color: colors.primaryText }]}>
              {numericOrDash(temperatureValue)}
            </Text>
            <Text
              style={[styles.unitText, { color: colors.primaryText }]}
              accessibilityLabel={`${numericOrDash(temperatureValue)} ${t(
                getForecastParameterUnitTranslationKey(`°${temperatureUnit}`)
              )} `}>
              °{t(`unitAbbreviations:${temperatureUnit}`)}
            </Text>
          </View>
        )}
      </View>
      <View style={[styles.feelsLikeRow, styles.withMarginBottom]}>
        <View style={[styles.row, styles.alignEnd]}>
          {activeParameters.includes('feelsLike') && (
            <>
              <View
                accessible
                accessibilityLabel={`${t('feelsLike')} ${numericOrDash(
                  feelsLikeValue
                )} ${t(
                  getForecastParameterUnitTranslationKey(`°${temperatureUnit}`)
                )}`}>
                <Text
                  style={[
                    styles.text,
                    styles.withMarginRight,
                    { color: colors.hourListText },
                  ]}>
                  {t('feelsLike')}{' '}
                  <Text style={[styles.bold, styles.feelsLikeText]}>
                    {numericOrDash(feelsLikeValue)}
                  </Text>
                  <Text style={styles.feelsLikeText}>°{t(`unitAbbreviations:${temperatureUnit}`)}</Text>
                </Text>
              </View>
              <Icon
                name={getFeelsLikeIconName(
                  nextHourForecast,
                  currentTime.toObject()
                )}
                height={40}
                width={40}
                color={colors.primaryText}
              />
            </>
          )}
        </View>
      </View>
      <View style={[styles.separator]} />
      <View
        style={[styles.row, styles.justifySpaceBetween, styles.bottomInfoRow]}>
        <View
          accessible
          style={styles.row}
          accessibilityLabel={
            nextHourForecast.windCompass8
              ? `${t(
                  `observation:windDirection:${nextHourForecast.windCompass8}`
                )} ${windSpeedValue} ${t(
                  `forecast:${getForecastParameterUnitTranslationKey(windUnit)}`
                )}`
              : undefined
          }>
          {activeParameters.includes('windDirection') && (
            <Icon
              name="wind-next-hour"
              width={28}
              height={28}
              style={[
                styles.withMarginRight,
                {
                  transform: [
                    {
                      rotate: `${getWindDirection(
                        nextHourForecast.windDirection
                      )}deg`,
                    },
                  ],
                },
              ]}
            />
          )}
          {activeParameters.includes('windSpeedMS') && (
            <View style={styles.alignStart}>
              <View style={styles.row}>
                <Text
                  style={[
                    styles.text,
                    styles.bold,
                    { color: colors.hourListText },
                  ]}>
                  {numericOrDash(windSpeedValue)}
                </Text>
                <Text style={[styles.text, { color: colors.hourListText }]}>
                  {` ${t(`unitAbbreviations:${windUnit}`)}`}
                </Text>
              </View>
            </View>
          )}
        </View>
        <View accessible style={styles.row}>
          {activeParameters.includes('precipitation1h') && (
            <>
              <Icon name="precipitation" color={colors.hourListText} />
              <Text
                style={[styles.text, { color: colors.hourListText }]}
                accessibilityLabel={`${t('forecast:precipitation')} ${
                  precipitationValue
                    ?.toString()
                    .replace('.', decimalSeparator) ||
                  (0).toFixed(1).replace('.', decimalSeparator)
                } ${t(
                  `forecast:${getForecastParameterUnitTranslationKey(
                    precipitationUnit
                  )}`
                )}`}>
                <Text style={styles.bold}>{`${
                  precipitationValue?.replace('.', decimalSeparator) ||
                  (0).toFixed(1).replace('.', decimalSeparator)
                }`}</Text>
                {` ${t(`unitAbbreviations:${precipitationUnit}`)}`}
              </Text>
            </>
          )}
        </View>
        <View style={styles.row}>
          {activeParameters.includes('uvCumulated') && (
            <Text
              style={[styles.text, { color: colors.hourListText }]}
              accessibilityLabel={t('params.uvCumulated', {
                value: numericOrDash(nextHourForecast.uvCumulated?.toString()),
              })}>
              {'UV '}
              <Text style={styles.bold}>
                {numericOrDash(nextHourForecast.uvCumulated?.toString())}
              </Text>
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 44,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  justifySpaceBetween: {
    justifyContent: 'space-between',
  },
  feelsLikeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 'auto',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  withMarginBottom: {
    marginBottom: 15,
  },
  withMarginRight: {
    marginRight: 8,
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  alignCenter: {
    alignItems: 'center',
  },
  separator: {
    width: '100%',
    height: 1,
    opacity: 0.2,
    backgroundColor: GRAY_1,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  unitText: {
    fontSize: 24,
    fontFamily: 'Roboto-Regular',
    paddingTop: 12,
  },
  bold: {
    fontFamily: 'Roboto-Bold',
  },
  feelsLikeText: {
    fontSize: 20,
  },
  temperatureText: {
    fontSize: 72,
    fontFamily: 'Roboto-Light',
  },
  bottomInfoRow: {
    marginBottom: 11,
  },
});

export default connector(NextHourForecastPanel);
