import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { ActivityIndicator, View, Text, StyleSheet, ImageBackground, useWindowDimensions} from 'react-native';
import { useNavigation, NavigationProp, useTheme } from '@react-navigation/native';
import { LinearGradient } from 'react-native-linear-gradient';

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
import { getOverrideTextColor, weatherBackgroundGetter } from '@assets/images/backgrounds';

import { getFeelsLikeIconName, getGeolocation, getWindDirection } from '@utils/helpers';
import { CustomTheme, WHITE, BLACK } from '@assets/colors';

import Icon from '@assets/Icon';
import { Config } from '@config';
import {
  converter,
  toPrecision,
  getForecastParameterUnitTranslationKey,
} from '@utils/units';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { setCurrentLocation as setCurrentLocationAction } from '@store/location/actions';
import IconButton from '@components/common/IconButton';
import { WeatherStackParamList } from '@navigators/types';
import NextHoursForecast from './NextHoursForecast';
import { selectIsAuroraBorealisLikely } from '@store/observation/selector';
import { darkTheme } from '@assets/themes';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

const mapStateToProps = (state: State) => ({
  loading: selectLoading(state),
  nextHourForecast: selectNextHourForecast(state),
  timezone: selectTimeZone(state),
  units: selectUnits(state),
  location: selectCurrent(state),
  isAuroraBorealisLikely : selectIsAuroraBorealisLikely(state)
});

const mapDispatchToProps = {
  setCurrentLocation: setCurrentLocationAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

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
  setCurrentLocation,
  isAuroraBorealisLikely,
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
  const { width} = useWindowDimensions();

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
  const bottomInfoRowMarginTop = 90 - insets.top - paddingTop;
  const defaultUnits = Config.get('settings').units;
  const temperatureUnit =
    units?.temperature.unitAbb ?? defaultUnits.temperature;
  const windUnit = units?.wind.unitAbb ?? defaultUnits.wind;
  const precipitationUnit =
    units?.precipitation.unitAbb ?? defaultUnits.precipitation;

  const currentTime = moment.unix(nextHourForecast.epochtime);
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

  let smartSymbol = nextHourForecast?.smartSymbol ?? 0;

  // Don't show night weather background before sunset

  const sunset = moment(`${nextHourForecast.sunset}Z`);

  if (moment().isBefore(sunset) && nextHourForecast?.sunsetToday === 1 && smartSymbol > 100) {
    smartSymbol = smartSymbol - 100; // Convert to day variant
  }

  // Either show UV or precipitation
  const showUv = nextHourForecast.precipitation1h === 0 || dark;

  const auroraBorealis = smartSymbol && smartSymbol > 100
                          && nextHourForecast?.totalCloudCover && nextHourForecast?.totalCloudCover <= 50
                          && isAuroraBorealisLikely;
  const isWideDisplay = () => width > 500;
  const weatherBackground = weatherBackgroundGetter(
    auroraBorealis ? 'aurora' : smartSymbol.toString(),
    isWideDisplay(),
  );
  const overrideTextColor = getOverrideTextColor(smartSymbol.toString(), isWideDisplay(), smartSymbol > 100);
  const forceDark = !!(smartSymbol && smartSymbol > 100);
  const textColor = forceDark || overrideTextColor === 'white' ? WHITE :  colors.primaryText;
  const shadowTextColor = forceDark || dark || overrideTextColor === 'white' ? BLACK : WHITE;
  const gradientColors = dark ? ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 1)']
                          : ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)'];
  const iconButtonBackground = forceDark || overrideTextColor === 'white' ?
    darkTheme.colors.weatherButtonBackground: colors.weatherButtonBackground;

  return (
    <>
      <ImageBackground
        source={weatherBackground}
        resizeMode="cover"
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.gradient}
        />
        <SafeAreaView style={[styles.container, { paddingTop: paddingTop }]} >
          <View style={[styles.row]}>
            <IconButton
              testID="locate_button"
              icon="locate"
              accessibilityLabel={t('navigation:locate')}
              iconColor={textColor}
              backgroundColor={iconButtonBackground}
              onPress={() => {
                getGeolocation(setCurrentLocation, t);
              }}
              circular
            />
            <View style={styles.locationTextContainer} accessible accessibilityRole="header">
              <AccessibleTouchableOpacity
                onPress={() => { navigation.navigate('Search') }}
                accessibilityLabel={t('navigation:search')}
              >
                <Text
                  style={[
                    styles.largeText,
                    styles.bold,
                    styles.shadowText,
                    { color: textColor, textShadowColor: shadowTextColor },
                  ]}>
                  {`${location.name}${location.area ? `, ${location.area}` : ''}`}
                </Text>
              </AccessibleTouchableOpacity>
            </View>
            <IconButton
              testID="search_button"
              icon="search"
              accessibilityLabel={t('navigation:search')}
              iconColor={textColor}
              backgroundColor={iconButtonBackground}
              onPress={() => {
                navigation.navigate('Search')
              }}
              circular
            />
          </View>
          <View style={[styles.alignCenter, styles.forecastVerticalSpace]}>
            <Text style={[
              styles.text,
              styles.centeredText,
              styles.shadowText,
              { color: textColor, textShadowColor: shadowTextColor }]}
            >
              {t(`symbols:${smartSymbol.toString() }`)}
            </Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.row, styles.alignStart]} accessible>
              <Text
                style={[
                  styles.temperatureText,
                  styles.shadowText,
                  { color: textColor, textShadowColor: shadowTextColor }
                ]}>
                {numericOrDash(temperatureValue)}
              </Text>
              <Text
                style={[styles.unitText, styles.shadowText, { color: textColor, textShadowColor: shadowTextColor }]}
                accessibilityLabel={`${numericOrDash(temperatureValue)} ${t(
                  getForecastParameterUnitTranslationKey(`°${temperatureUnit}`)
                )} `}>
                °{temperatureUnit}
              </Text>
            </View>
          </View>
          <View style={[
            styles.row, styles.justifySpaceBetween, styles.bottomInfoRow,
              { borderBottomColor: colors.border, marginTop: bottomInfoRowMarginTop }
          ]}>
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
                        styles.shadowText,
                        { color: textColor, textShadowColor: shadowTextColor },
                      ]}>
                      {numericOrDash(windSpeedValue)}
                    </Text>
                    <Text style={[
                      styles.text,
                      styles.shadowText,
                      { color: textColor, textShadowColor: shadowTextColor }
                    ]}>
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
                  style={[styles.text, styles.shadowText, { color: textColor, textShadowColor: shadowTextColor }]}
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
                  <Text style={[styles.bold, styles.shadowText, {textShadowColor: shadowTextColor}]}>{`${
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
                style={[styles.text, styles.shadowText, { color: textColor, textShadowColor: shadowTextColor }]}
                accessibilityLabel={t('params.uvCumulated', {
                  value: numericOrDash(nextHourForecast.uvCumulated?.toString()),
                })}>
                {'UV '}
                <Text style={[styles.bold, styles.shadowText, {textShadowColor: shadowTextColor}]}>
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
                      styles.shadowText,
                      styles.withMarginRight,
                      { color: textColor, textShadowColor: shadowTextColor },
                    ]}>
                    {t('feelsLike')}{' '}
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
  shadowText: {
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bold: {
    fontFamily: 'Roboto-Bold',
  },
  temperatureText: {
    fontSize: 72,
    fontFamily: 'Roboto-Light',
  },
  bottomInfoRow: {
    marginBottom: 11,
    paddingBottom: 10,
  },
  feelsLikeIcon: {
    marginTop: -20,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  gradient: {
    height: 100,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
});

export default connector(NextHourForecastPanelWithWeatherBackground);
