import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

import moment from 'moment';
import 'moment/locale/fi';
import 'moment/locale/sv';
import 'moment/locale/en-gb';
import 'moment/locale/es';
import { useTranslation } from 'react-i18next';

import { State } from '@store/types';

import { selectCurrent } from '@store/location/selector';
import { selectUnits } from '@store/settings/selectors';

import { getFeelsLikeIconName, getWindDirection } from '@utils/helpers';
import { CustomTheme, WHITE } from '@assets/colors';

import Icon from '@assets/Icon';
import { Config } from '@config';
import {
  converter,
  toPrecision,
  getForecastParameterUnitTranslationKey,
} from '@utils/units';
import { setCurrentLocation as setCurrentLocationAction } from '@store/location/actions';
import { TimeStepData } from '@store/forecast/types';

const mapStateToProps = (state: State) => ({
  units: selectUnits(state),
  location: selectCurrent(state),
});

const mapDispatchToProps = {
  setCurrentLocation: setCurrentLocationAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type NextHourForecastBarProps = PropsFromRedux & {
  forecast: TimeStepData;
  wide?: boolean;
};

const NextHourForecastBar: React.FC<NextHourForecastBarProps> = ({
  forecast,
  wide,
  units,
}) => {
  const { t, i18n } = useTranslation('forecast');
  const locale = i18n.language;
  const decimalSeparator = locale === 'en' ? '.' : ',';
  const { dark } = useTheme() as CustomTheme;

  if (!forecast) return null;

  const activeParameters = Config.get('weather').forecast.data.flatMap(
    ({ parameters }) => parameters
  );

  const defaultUnits = Config.get('settings').units;
  const temperatureUnit =
    units?.temperature.unitAbb ?? defaultUnits.temperature;
  const windUnit = units?.wind.unitAbb ?? defaultUnits.wind;
  const precipitationUnit =
    units?.precipitation.unitAbb ?? defaultUnits.precipitation;

  const currentTime = moment.unix(forecast.epochtime);
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

  const feelsLikeValue = convertValue(
    'temperature',
    temperatureUnit,
    forecast.feelsLike
  );

  const windSpeedValue = convertValue(
    'wind',
    windUnit,
    forecast.windSpeedMS
  );

  const precipitationValue = convertValue(
    'precipitation',
    precipitationUnit,
    forecast.precipitation1h
  );

  // Either show UV or precipitation
  const showUv = forecast.precipitation1h === 0 || dark;
  const textColor = WHITE;

  return (
    <View style={styles.container}>
      <View style={[ styles.bar, styles.justifySpaceBetween ]}>
        <View
          accessible
          style={styles.row}
          accessibilityLabel={
            forecast.windCompass8
              ? `${t(
                  `observation:windDirection:${forecast.windCompass8}`
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
                        forecast.windDirection
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
                    { color: textColor },
                  ]}>
                  {numericOrDash(windSpeedValue)}
                </Text>
                <Text style={[styles.text, { color: textColor }]}>
                  {` ${windUnit}`}
                </Text>
              </View>
            </View>
          )}
        </View>
      <View accessible style={styles.row}>
        { (wide || !showUv) && activeParameters.includes('precipitation1h') && (
          <>
            <Icon name="precipitation" color={textColor} />
            <Text
              style={[styles.text, { color: textColor }]}
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
              <Text style={[styles.bold]}>{`${
                precipitationValue?.replace('.', decimalSeparator) ||
                (0).toFixed(1).replace('.', decimalSeparator)
              }`}</Text>
              {` ${precipitationUnit}`}
            </Text>
          </>
        )}
      </View>
      <View style={styles.row}>
        { (wide || showUv) && activeParameters.includes('uvCumulated') && (
          <Text
            style={[styles.text, { color: textColor }]}
            accessibilityLabel={t('params.uvCumulated', {
              value: numericOrDash(forecast.uvCumulated?.toString()),
            })}>
            {'UV '}
            <Text style={[styles.bold]}>
              {numericOrDash(forecast.uvCumulated?.toString())}
            </Text>
          </Text>
        )}
      </View>
      {activeParameters.includes('feelsLike') && (
        <View style={styles.row}>
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
                { color: textColor },
              ]}>
              {t('feelsLike')}{' '}
              <Text>
                {numericOrDash(feelsLikeValue)}
              </Text>
              <Text>{`°${temperatureUnit}`}</Text>
            </Text>
          </View>
          <Icon
            name={getFeelsLikeIconName(forecast, currentTime.toObject())}
            style={styles.feelsLikeIcon}
            height={40}
            width={40}
            color={textColor}
          />
        </View>
      )}
    </View>
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    paddingBottom: 16,
  },
  bar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    flexGrow: 1,
    width: '100%',
    maxHeight: 45,
    maxWidth: 440,
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  justifySpaceBetween: {
    justifyContent: 'space-between',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  withMarginRight: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  bold: {
    fontFamily: 'Roboto-Bold',
    fontWeight: 'bold',
  },
  feelsLikeIcon: {
    marginTop: -20,
  },
});

export default connector(NextHourForecastBar);
