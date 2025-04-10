import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { ActivityIndicator, View, Text, StyleSheet, ImageBackground} from 'react-native';
import { useNavigation, NavigationProp, useTheme } from '@react-navigation/native';
import moment from 'moment-timezone';
import 'moment/locale/fi';
import 'moment/locale/sv';
import 'moment/locale/en-gb';
import 'moment/locale/es';
import { useTranslation } from 'react-i18next';

import { State } from '@store/types';

import {
  selectLoading,
  selectNextHourForecast,
} from '@store/forecast/selectors';
import { selectTimeZone, selectCurrent } from '@store/location/selector';
import { selectUnits } from '@store/settings/selectors';
import { weatherBackgroundGetter } from '@assets/images/backgrounds';

import { getFeelsLikeIconName, getGeolocation, getWindDirection } from '@utils/helpers';
import { CustomTheme, WHITE } from '@assets/colors';

import Icon from '@components/common/Icon';
import { Config } from '@config';
import {
  converter,
  toPrecision,
  getForecastParameterUnitTranslationKey,
} from '@utils/units';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { setCurrentLocation } from '@store/location/actions';
import IconButton from '@components/common/IconButton';
import { WeatherStackParamList } from '@navigators/types';
import NextHoursForecast from './NextHoursForecast';

const mapStateToProps = (state: State) => ({
  loading: selectLoading(state),
  nextHourForecast: selectNextHourForecast(state),
  timezone: selectTimeZone(state),
  units: selectUnits(state),
  location: selectCurrent(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type NextHourForecastPanelProps = PropsFromRedux & {
  currentHour: number;
};

const NextHourForecastPanelWithWeatherBackground: React.FC<NextHourForecastPanelProps> = ({
  loading,
  nextHourForecast,
  timezone,
  units,
  location,
  currentHour, // To force re-render when the hour changes
}) => {
  const { t, i18n } = useTranslation('forecast');
  const locale = i18n.language;
  const decimalSeparator = locale === 'en' ? '.' : ',';
  const { colors, dark } = useTheme() as CustomTheme;
  useEffect(() => {
    moment.tz.setDefault(timezone);
  }, [timezone]);

  const navigation = useNavigation<NavigationProp<WeatherStackParamList>>()
  const insets = useSafeAreaInsets();

  if (loading || !nextHourForecast) {
    return (
      <View style={[styles.container, styles.column]}>
        <ActivityIndicator accessibilityLabel={t('weather:loading')} />
      </View>
    );
  }

  const activeParameters = Config.get('weather').forecast.data.flatMap(
    ({ parameters }) => parameters
  );

  const paddingTop = insets.top === 0 ? 32 : 8;
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

  // Either show UV or precipitation
  const showUv = nextHourForecast.precipitation1h === 0 || dark;

  const textColor = nextHourForecast.smartSymbol && nextHourForecast.smartSymbol > 100 ? WHITE :  colors.primaryText;

  return (
    <>
      <ImageBackground
        source={weatherBackground}
        resizeMode="cover"
      >
      <SafeAreaView style={[styles.container, { paddingTop: paddingTop }]} >
          <View style={[styles.row]} accessible accessibilityRole="header">
            <IconButton
              testID="locate_button"
              icon="locate"
              accessibilityLabel=""
              iconColor={textColor}
              backgroundColor={colors.inputBackground}
              onPress={() => {
                getGeolocation(setCurrentLocation, t);
              }}
              circular
            />
            <View style={styles.locationTextContainer} accessible>
              <Text
                style={[
                  styles.largeText,
                  styles.bold,
                  { color: textColor },
                ]}>
                {`${location.name}${location.area ? `, ${location.area}` : ''}`}
              </Text>
            </View>
            <IconButton
              testID="search_button"
              icon="search"
              accessibilityLabel=""
              iconColor={textColor}
              backgroundColor={colors.inputBackground}
              onPress={() => {
                navigation.navigate('Search')
              }}
              circular
            />
          </View>
          <View style={[styles.alignCenter, styles.forecastVerticalSpace]}>
            <Text style={[styles.text, styles.centeredText, { color: textColor }]}>
              {t(`symbols:${nextHourForecast?.smartSymbol?.toString() }`)}
            </Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.row, styles.alignStart]} accessible>
              <Text
                style={[styles.temperatureText, { color: textColor }]}>
                {numericOrDash(temperatureValue)}
              </Text>
              <Text
                style={[styles.unitText, { color: textColor }]}
                accessibilityLabel={`${numericOrDash(temperatureValue)} ${t(
                  getForecastParameterUnitTranslationKey(`°${temperatureUnit}`)
                )} `}>
                °{temperatureUnit}
              </Text>
            </View>
          </View>
          <View style={[styles.row, styles.justifySpaceBetween, styles.bottomInfoRow, { borderBottomColor: colors.border }]}>
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
            { !showUv && activeParameters.includes('precipitation1h') && (
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
                  <Text style={styles.bold}>{`${
                    precipitationValue?.replace('.', decimalSeparator) ||
                    (0).toFixed(1).replace('.', decimalSeparator)
                  }`}</Text>
                  {` ${precipitationUnit}`}
                </Text>
              </>
            )}
          </View>
          <View style={styles.row}>
            { showUv && activeParameters.includes('uvCumulated') && (
              <Text
                style={[styles.text, { color: textColor }]}
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
                    {t('feelsLike').toLowerCase()}{' '}
                    <Text>
                      {numericOrDash(feelsLikeValue)}
                    </Text>
                    <Text>°</Text>
                  </Text>
                </View>
                <Icon
                  name={getFeelsLikeIconName(
                    nextHourForecast,
                    currentTime.toObject()
                  )}
                  style={styles.feelsLikeIcon}
                  height={40}
                  width={40}
                  color={textColor}
                />
              </View>
            )}
        </View>
      </SafeAreaView>
    </ImageBackground>
    <NextHoursForecast currentHour={currentHour} />
  </>
);
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    height: 370,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  locationTextContainer: {
    flex: 1,
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -24,
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
  forecastVerticalSpace: {
    marginVertical: 15,
  },
  alignCenter: {
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  largeText: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  unitText: {
    fontSize: 24,
    fontFamily: 'Roboto-Regular',
    paddingTop: 12,
  },
  centeredText: {
    textAlign: 'center',
  },
  bold: {
    fontFamily: 'Roboto-Bold',
  },
  temperatureText: {
    fontSize: 72,
    fontFamily: 'Roboto-Light',
  },
  bottomInfoRow: {
    marginTop: 20,
    marginBottom: 11,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  feelsLikeIcon: {
    marginTop: -20,
  }
});

export default connector(NextHourForecastPanelWithWeatherBackground);
