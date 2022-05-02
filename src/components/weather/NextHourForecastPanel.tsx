import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import moment from 'moment-timezone';
import 'moment/locale/fi';
import 'moment/locale/sv';
import 'moment/locale/en-gb';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { State } from '@store/types';

import {
  selectLoading,
  selectNextHourForecast,
} from '@store/forecast/selectors';
import { selectTimeZone } from '@store/location/selector';
import { weatherSymbolGetter } from '@assets/images';

import { getFeelsLikeIconName } from '@utils/helpers';
import { CustomTheme, GRAY_1 } from '@utils/colors';

import Icon from '@components/common/Icon';
import { Config } from '@config';

const mapStateToProps = (state: State) => ({
  loading: selectLoading(state),
  nextHourForecast: selectNextHourForecast(state),
  timezone: selectTimeZone(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type NextHourForecastPanelProps = PropsFromRedux;

const NextHourForecastPanel: React.FC<NextHourForecastPanelProps> = ({
  loading,
  nextHourForecast,
  timezone,
}) => {
  const { t } = useTranslation('forecast');
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

  const currentTime = moment.unix(nextHourForecast.epochtime);
  const smartSymbol = weatherSymbolGetter(
    nextHourForecast?.smartSymbol?.toString() || '0',
    dark
  );

  const sunrise = moment(`${nextHourForecast.sunrise}Z`);
  const sunset = moment(`${nextHourForecast.sunset}Z`);

  const numericOrDash = (val: number | undefined | null): string => {
    if (!Number.isInteger(val)) return '-';
    return `${val}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.alignCenter} accessible accessibilityRole="header">
        <Text style={[styles.text, { color: colors.primaryText }]}>
          {t('nextHourForecast')}
        </Text>
        <Text
          style={[
            styles.text,
            styles.bold,
            { color: colors.primaryText },
          ]}>{`${t('at')} ${currentTime.format('HH:mm')}`}</Text>
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
              {numericOrDash(nextHourForecast.temperature)}
            </Text>
            <Text style={[styles.unitText, { color: colors.primaryText }]}>
              °C
            </Text>
          </View>
        )}
      </View>
      <View style={[styles.feelsLikeRow, styles.withMarginBottom]}>
        <View style={styles.row}>
          {activeParameters.includes('uvCumulated') && (
            <Text
              style={[styles.text, { color: colors.hourListText }]}
              accessibilityLabel={t('params.uvCumulated', {
                value: numericOrDash(nextHourForecast.uvCumulated),
              })}>
              {'UV '}
              <Text style={styles.bold}>
                {numericOrDash(nextHourForecast.uvCumulated)}
              </Text>
            </Text>
          )}
        </View>
        <View style={[styles.row, styles.alignEnd]}>
          {activeParameters.includes('feelsLike') && (
            <>
              <Text
                style={[
                  styles.text,
                  styles.withMarginRight,
                  { color: colors.hourListText },
                ]}>
                {t('feelsLike')}{' '}
                <Text style={[styles.bold, styles.feelsLikeText]}>
                  {numericOrDash(nextHourForecast.feelsLike)}
                </Text>
                <Text style={styles.feelsLikeText}>°C</Text>
              </Text>
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
      <View style={[styles.separator, styles.withMarginBottom]} />
      <View style={[styles.row, styles.justifySpaceBetween]}>
        <View
          accessible
          style={styles.row}
          accessibilityLabel={
            nextHourForecast.windCompass8
              ? `${t(
                  `observation:windDirection:${nextHourForecast.windCompass8}`
                )} ${nextHourForecast.windSpeedMS} ${t(
                  'forecast:metersPerSecond'
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
                      rotate: `${
                        (nextHourForecast.windDirection || 0) + 45 - 180
                      }deg`,
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
                  {numericOrDash(nextHourForecast.windSpeedMS)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.text, { color: colors.hourListText }]}>
                  m/s
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
                  nextHourForecast.precipitation1h
                    ?.toString()
                    .replace('.', ',') || (0).toFixed(1).replace('.', ',')
                } ${t('forecast:millimeters')}`}>
                <Text style={styles.bold}>{`${
                  nextHourForecast.precipitation1h
                    ?.toString()
                    .replace('.', ',') || (0).toFixed(1).replace('.', ',')
                }`}</Text>
                {' mm'}
              </Text>
            </>
          )}
        </View>
        <View
          accessible
          style={styles.row}
          accessibilityLabel={`${t('forecast:sunrise')} ${t(
            'forecast:at'
          )} ${sunrise.format('HH:mm')} ${t('forecast:sunset')} ${t(
            'at'
          )} ${sunset.format('HH:mm')}`}>
          <Icon
            name="sun"
            color={colors.hourListText}
            style={styles.withSmallMarginRight}
          />
          <View>
            <View style={styles.row}>
              <Icon
                name="sun-arrow-up"
                size={14}
                color={colors.hourListText}
                style={styles.withSmallMarginRight}
              />
              <Text
                style={[
                  styles.text,
                  styles.bold,
                  { color: colors.hourListText },
                ]}>
                {sunrise.format('HH:mm')}
              </Text>
            </View>
            <View style={styles.row}>
              <Icon
                name="sun-arrow-down"
                size={14}
                color={colors.hourListText}
                style={styles.withSmallMarginRight}
              />
              <Text
                style={[
                  styles.text,
                  styles.bold,
                  { color: colors.hourListText },
                ]}>
                {sunset.format('HH:mm')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 32,
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
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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
  withSmallMarginRight: {
    marginRight: 4,
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
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  unitText: {
    fontSize: 20,
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
});

export default connector(NextHourForecastPanel);
