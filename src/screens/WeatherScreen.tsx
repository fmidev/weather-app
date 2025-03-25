import React, { useCallback, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import { State } from '@store/types';
import { selectCurrent } from '@store/location/selector';
import { selectAnnouncements } from '@store/announcements/selectors';

import { fetchForecast as fetchForecastAction } from '@store/forecast/actions';
import { fetchObservation as fetchObservationAction } from '@store/observation/actions';
import { fetchWarnings as fetchWarningsAction } from '@store/warnings/actions';

import GradientWrapper from '@components/weather/GradientWrapper';
import NextHourForecastPanel from '@components/weather/NextHourForecastPanel';
import NextHourForecastPanelWithWeatherBackground from '@components/weather/NextHourForecastPanelWithWeatherBackground';
import ForecastPanel from '@components/weather/ForecastPanel';
import ForecastPanelWithVerticalLayout from '@components/weather/ForecastPanelWithVerticalLayout';
import ObservationPanel from '@components/weather/ObservationPanel';
import SunAndMoonPanel from '@components/weather/SunAndMoonPanel';

import { Config } from '@config';
import { useReloader } from '@utils/reloader';
import Announcements from '@components/announcements/Announcements';

const mapStateToProps = (state: State) => ({
  announcements: selectAnnouncements(state),
  location: selectCurrent(state),
});

const mapDispatchToProps = {
  fetchForecast: fetchForecastAction,
  fetchObservation: fetchObservationAction,
  fetchWarnings: fetchWarningsAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type WeatherScreenProps = PropsFromRedux;

const WeatherScreen: React.FC<WeatherScreenProps> = ({
  fetchForecast,
  fetchObservation,
  fetchWarnings,
  location,
  announcements,
}) => {
  const isFocused = useIsFocused();
  const [forecastUpdated, setForecastUpdated] = useState<number>(Date.now());
  const [observationUpdated, setObservationUpdated] = useState<number>(
    Date.now()
  );
  const [warningsUpdated, setWarningsUpdated] = useState<number>(Date.now());
  const { shouldReload } = useReloader();

  const { weather: weatherConfig, warnings: warningsConfig } = Config.getAll();

  const updateForecast = useCallback(() => {
    const geoid = location.id;
    const forecastLocation = geoid
      ? { geoid }
      : { latlon: `${location.lat},${location.lon}` };

    fetchForecast(forecastLocation, geoid ? [geoid] : []);
    setForecastUpdated(Date.now());
    // Using location.lat and location.lon instead of location saves some updates
  }, [
    fetchForecast,
    location.id,
    location.lat,
    location.lon,
    setForecastUpdated,
  ]);

  const updateObservation = useCallback(() => {
    if (weatherConfig.observation.enabled) {
      const observationLocation = location.id
        ? { geoid: location.id }
        : { latlon: `${location.lat},${location.lon}` };

      fetchObservation(observationLocation, location.country);
      setObservationUpdated(Date.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fetchObservation,
    location.id,
    location.lat,
    location.lon,
    weatherConfig.observation.enabled,
  ]);

  const updateWarnings = useCallback(() => {
    if (warningsConfig.enabled && warningsConfig.apiUrl[location.country]) {
      fetchWarnings(location);
      setWarningsUpdated(Date.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchWarnings, location.lat, location.lon, warningsConfig]);

  useEffect(() => {
    const now = Date.now();
    const observationUpdateTime =
      observationUpdated +
      (weatherConfig.observation.updateInterval ?? 5) * 60 * 1000;
    const forecastUpdateTime =
      forecastUpdated +
      (weatherConfig.forecast.updateInterval ?? 5) * 60 * 1000;
    const warningsUpdateTime =
      warningsUpdated + (warningsConfig.updateInterval ?? 5) * 60 * 1000;

    if (isFocused) {
      if (now > forecastUpdateTime || shouldReload > forecastUpdateTime) {
        updateForecast();
      }
      if (now > observationUpdateTime || shouldReload > observationUpdateTime) {
        updateObservation();
      }
      if (now > warningsUpdateTime || shouldReload > warningsUpdateTime) {
        updateWarnings();
      }
    }
  }, [
    isFocused,
    forecastUpdated,
    observationUpdated,
    warningsUpdated,
    shouldReload,
    weatherConfig,
    warningsConfig,
    updateForecast,
    updateObservation,
    updateWarnings,
  ]);

  useEffect(() => {
    updateForecast();
    updateObservation();
    updateWarnings();
  }, [location, updateForecast, updateObservation, updateWarnings]);

  const currentHour = new Date().getHours();

  return weatherConfig.layout === 'fmi' ? (
      <View testID="weather_view">
        <ScrollView
          testID="weather_scrollview"
          style={[styles.container]}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={announcements && [0]}>
          <Announcements style={styles.announcements} />
          <NextHourForecastPanelWithWeatherBackground currentHour={currentHour} />
          <SunAndMoonPanel />
          <ForecastPanelWithVerticalLayout currentHour={currentHour}/>
          <ObservationPanel />
        </ScrollView>
      </View>
    ) : (
    <GradientWrapper>
      <View testID="weather_view">
        <ScrollView
          testID="weather_scrollview"
          style={[styles.container]}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={announcements && [0]}>
          <Announcements style={styles.announcements} />
          <NextHourForecastPanel currentHour={currentHour} />
          <ForecastPanel currentHour={currentHour}/>
          <ObservationPanel />
        </ScrollView>
      </View>
    </GradientWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: '100%',
  },
  contentContainer: {
    ...Platform.select({
      android: {
        paddingBottom: 28,
      },
    }),
  },
  announcements: {
    elevation: 10,
  },
});

export default connector(WeatherScreen);
