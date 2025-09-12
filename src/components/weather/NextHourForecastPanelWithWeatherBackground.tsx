import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  ActivityIndicator, View, Text, StyleSheet, ImageBackground, useWindowDimensions, Platform
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

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
import { selectIsAuroraBorealisLikely } from '@store/forecast/selectors';
import { weatherBackgroundGetter } from '@assets/images/backgrounds';

import { formatAccessibleTemperature, getGeolocation } from '@utils/helpers';
import { WHITE } from '@assets/colors';

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
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import NextHourForecastBar from './forecast/NextHourForecastBar';
import i18n from '@i18n';

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
  const { t } = useTranslation('forecast');
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

  const safetyPadding = Platform.OS === 'android' ? 8 : 0;
  const paddingTop = insets.top === 0 ? 32 : safetyPadding;
  const paddingBottom = Platform.OS === 'android' ? 32 : 0;
  const defaultUnits = Config.get('settings').units;
  const temperatureUnit =
    units?.temperature.unitAbb ?? defaultUnits.temperature;

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

  let smartSymbol = nextHourForecast?.smartSymbol ?? 0;

  // Don't show night weather background before sunset

  const sunset = moment(`${nextHourForecast.sunset}Z`);

  if (moment().isBefore(sunset) && nextHourForecast?.sunsetToday === 1 && smartSymbol > 100) {
    smartSymbol = smartSymbol - 100; // Convert to day variant
  }

  const auroraBorealis = smartSymbol && smartSymbol > 100
                          && nextHourForecast?.totalCloudCover && nextHourForecast?.totalCloudCover <= 50
                          && isAuroraBorealisLikely;
  const isWideDisplay = () => width > 500;
  const weatherBackground = weatherBackgroundGetter(
    auroraBorealis ? 'aurora' : smartSymbol.toString(),
    isWideDisplay(),
  );
  const textColor = WHITE;
  const overlayColor = 'rgba(0,0,0,0.3)';

  return (
    <ImageBackground
      source={weatherBackground}
      resizeMode="cover"
      style={styles.backgroundImage}
    >
      { /* Gradient overlay for the background image */ }
      <LinearGradient
        colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.2)']}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.4)']}
        locations={[0.4024, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={[styles.container, { paddingTop: paddingTop, paddingBottom: paddingBottom }]} >
        <View style={[styles.row]}>
          <IconButton
            testID="locate_button"
            icon="locate"
            accessibilityLabel={t('navigation:locate')}
            iconColor={textColor}
            backgroundColor={overlayColor}
            onPress={() => {
              getGeolocation(setCurrentLocation, t, i18n.language);
            }}
            circular
          />
          <View style={styles.locationTextContainer}>
            <AccessibleTouchableOpacity
              onPress={() => { navigation.navigate('Search') }}
              accessibilityRole="button"
              accessibilityLabel={`${location.name}${location.area ? `, ${location.area}` : ''}, ${t('navigation:search')}`}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.locationText,
                  styles.largeText,
                  styles.bold,
                  { color: textColor },
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
            backgroundColor={overlayColor}
            onPress={() => {
              navigation.navigate('Search')
            }}
            circular
          />
        </View>
        <View style={[styles.alignCenter, styles.forecastVerticalSpace]}>
          <Text style={[styles.largeText, styles.centeredText, { color: textColor }]}>
            {t(`symbols:${smartSymbol.toString() }`)}
          </Text>
        </View>
        <View style={styles.row}>
          <View style={[styles.row, styles.alignStart]} accessible
            accessibilityLabel={`${formatAccessibleTemperature(temperatureValue, t)} ${t(
              getForecastParameterUnitTranslationKey(`°${temperatureUnit}`)
            )}`}>
            <Text
              style={[
                styles.temperatureText,
                { color: textColor }
              ]}>
              {numericOrDash(temperatureValue)}
            </Text>
            <Text
              style={[styles.unitText, { color: textColor }]}
              >
              °{temperatureUnit}
            </Text>
          </View>
        </View>
    </SafeAreaView>
    <View style={[styles.overlay, {backgroundColor: overlayColor}]}>
      <NextHourForecastBar forecast={nextHourForecast} wide={isWideDisplay()} />
      <NextHoursForecast currentHour={currentHour} />
    </View>
  </ImageBackground>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    height: 420,
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
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  forecastVerticalSpace: {
    marginVertical: 5,
  },
  alignCenter: {
    alignItems: 'center',
  },
  largeText: {
    fontSize: 18,
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
    fontWeight: 'bold',
  },
  temperatureText: {
    fontSize: 72,
    fontFamily: 'Roboto-Light',
  },
  backgroundImage: {
    flex: 1,
  },
  locationText: {
    paddingHorizontal: 16,
  },
  overlay: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: '100%',
    paddingVertical: 16
  },
});

export default connector(NextHourForecastPanelWithWeatherBackground);
