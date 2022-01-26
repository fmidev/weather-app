import React, { useCallback, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useTheme, useIsFocused } from '@react-navigation/native';

import { State } from '@store/types';
import { selectCurrent } from '@store/location/selector';

import { fetchForecast as fetchForecastAction } from '@store/forecast/actions';
import { fetchObservation as fetchObservationAction } from '@store/observation/actions';

import NextHourForecastPanel from '@components/weather/NextHourForecastPanel';
import ForecastPanel from '@components/weather/ForecastPanel';
import ObservationPanel from '@components/weather/ObservationPanel';

import { CustomTheme } from '@utils/colors';

import { Config } from '@config';
import { useReloader } from '@utils/reloader';

const mapStateToProps = (state: State) => ({
  location: selectCurrent(state),
});

const mapDispatchToProps = {
  fetchForecast: fetchForecastAction,
  fetchObservation: fetchObservationAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type WeatherScreenProps = PropsFromRedux;

const WeatherScreen: React.FC<WeatherScreenProps> = ({
  fetchForecast,
  fetchObservation,
  location,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const isFocused = useIsFocused();
  const [forecastUpdated, setForecastUpdated] = useState<number>(Date.now());
  const [observationUpdated, setObservationUpdated] = useState<number>(
    Date.now()
  );
  const { shouldReload } = useReloader();

  const weatherConfig = Config.get('weather');

  const updateForecast = useCallback(() => {
    const geoid = location.id;
    fetchForecast({ geoid }, [geoid]);
    setForecastUpdated(Date.now());
  }, [fetchForecast, location, setForecastUpdated]);

  const updateObservation = useCallback(() => {
    if (weatherConfig.observation.enabled) {
      fetchObservation({ geoid: location.id }, location.country);
      setObservationUpdated(Date.now());
    }
  }, [fetchObservation, location, weatherConfig.observation.enabled]);

  useEffect(() => {
    const now = Date.now();
    const observationUpdateTime =
      observationUpdated +
      (weatherConfig.observation.updateInterval ?? 5) * 60 * 1000;
    const forecastUpdateTime =
      forecastUpdated +
      (weatherConfig.forecast.updateInterval ?? 5) * 60 * 1000;

    if (isFocused) {
      if (now > forecastUpdateTime || shouldReload > forecastUpdateTime) {
        updateForecast();
      }
      if (now > observationUpdateTime || shouldReload > observationUpdateTime) {
        updateObservation();
      }
    }
  }, [
    isFocused,
    forecastUpdated,
    observationUpdated,
    shouldReload,
    weatherConfig,
    updateForecast,
    updateObservation,
  ]);

  useEffect(() => {
    updateForecast();
    updateObservation();
  }, [location, updateForecast, updateObservation]);
  return (
    <SafeAreaView>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.screenBackground }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <NextHourForecastPanel />
        <ForecastPanel />
        <ObservationPanel />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: '100%',
    paddingHorizontal: 12,
  },
  contentContainer: {
    paddingTop: 12,
    paddingBottom: 20,
  },
});

export default connector(WeatherScreen);
