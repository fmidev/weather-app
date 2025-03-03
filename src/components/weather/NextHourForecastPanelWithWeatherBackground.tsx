import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { ActivityIndicator, View, Text, StyleSheet, BackgroundImage } from 'react-native';
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
import { selectUnits } from '@store/settings/selectors';
import { weatherBackgroundGetter } from '@assets/images/backgrounds';

import { getFeelsLikeIconName, getWindDirection } from '@utils/helpers';
import { CustomTheme, GRAY_1 } from '@assets/colors';

import Icon from '@components/common/Icon';
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

const NextHourForecastPanelWithWeatherBackground: React.FC<NextHourForecastPanelProps> = ({
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
  const weatherBackground = weatherBackgroundGetter(
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
      <BackgroundImage source={require('../../images/backgrounds/light/1.jpg')} resizeMode="cover">
        <Text style={styles.text}>
          Testing
        </Text>
      </BackgroundImage>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 44,
    minHeight: 440,
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

export default connector(NextHourForecastPanelWithWeatherBackground);
