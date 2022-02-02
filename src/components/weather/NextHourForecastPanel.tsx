import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import moment from 'moment-timezone';
import 'moment/locale/fi';
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
import { CustomTheme } from '@utils/colors';

import Icon from '@components/common/Icon';

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
        <ActivityIndicator />
      </View>
    );
  }

  const currentTime = moment.unix(nextHourForecast.epochtime);
  const smartSymbol = weatherSymbolGetter(
    nextHourForecast.smartSymbol.toString(),
    dark
  );
  const temperaturePrefix = nextHourForecast.temperature > 0 ? '+' : '';
  const feelsLikePrefix = nextHourForecast.feelsLike > 0 ? '+' : '';

  const sunrise = moment(nextHourForecast.sunrise);
  const sunset = moment(nextHourForecast.sunset);

  return (
    <View style={styles.container}>
      <View style={styles.alignCenter}>
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
        <View>
          {smartSymbol?.({
            width: 100,
            height: 100,
          })}
        </View>
        <Text
          style={[
            styles.temperatureText,
            { color: colors.primaryText },
          ]}>{`${temperaturePrefix}${nextHourForecast.temperature}°`}</Text>
      </View>
      <View style={[styles.row, styles.justifyEnd, styles.withMarginBottom]}>
        <View style={styles.feelsLikeRow}>
          <Text
            style={[
              styles.text,
              styles.withMarginRight,
              { color: colors.hourListText },
            ]}>
            {t('feelsLike')}{' '}
            <Text
              style={[
                styles.bold,
                styles.feelsLikeText,
              ]}>{`${feelsLikePrefix}${nextHourForecast.feelsLike}°`}</Text>
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
        </View>
      </View>
      <View
        style={[
          styles.separator,
          styles.withMarginBottom,
          { backgroundColor: colors.border },
        ]}
      />
      <View style={styles.row}>
        <View style={styles.row}>
          <Icon
            name="wind-next-hour"
            width={28}
            height={28}
            style={[
              styles.withMarginRight,
              {
                transform: [
                  {
                    rotate: `${nextHourForecast.winddirection + 45 - 180}deg`,
                  },
                ],
              },
            ]}
          />
          <Text style={[styles.text, { color: colors.hourListText }]}>
            <Text
              style={styles.bold}>{`${nextHourForecast.windspeedms} `}</Text>
            m/s
          </Text>
        </View>
        <View style={styles.row}>
          <Icon
            name="precipitation"
            color={colors.hourListText}
            width={28}
            height={28}
          />
          <Text style={[styles.text, { color: colors.hourListText }]}>
            <Text style={styles.bold}>{`${nextHourForecast.precipitation1h
              .toFixed(1)
              .replace('.', ',')}`}</Text>{' '}
            mm
          </Text>
        </View>
        <View style={styles.row}>
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
  feelsLikeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
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
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  alignCenter: {
    alignItems: 'center',
  },
  separator: {
    width: '100%',
    height: 1,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
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
