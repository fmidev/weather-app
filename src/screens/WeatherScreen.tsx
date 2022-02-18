import React, { useCallback, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import { State } from '@store/types';
import { selectCurrent } from '@store/location/selector';

import { fetchForecast as fetchForecastAction } from '@store/forecast/actions';
import { fetchObservation as fetchObservationAction } from '@store/observation/actions';
import { fetchWarnings as fetchWarningsAction } from '@store/warnings/actions';

import GradientWrapper from '@components/weather/GradientWrapper';
import NextHourForecastPanel from '@components/weather/NextHourForecastPanel';
import ForecastPanel from '@components/weather/ForecastPanel';
import ObservationPanel from '@components/weather/ObservationPanel';
import WarningsPanelSlim from '@components/warnings/WarningsPanelSlim';

import { Config } from '@config';
import { useReloader } from '@utils/reloader';

const mapStateToProps = (state: State) => ({
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
    fetchForecast({ geoid }, [geoid]);
    setForecastUpdated(Date.now());
  }, [fetchForecast, location, setForecastUpdated]);

  const updateObservation = useCallback(() => {
    if (weatherConfig.observation.enabled) {
      fetchObservation({ geoid: location.id }, location.country);
      setObservationUpdated(Date.now());
    }
  }, [fetchObservation, location, weatherConfig.observation.enabled]);

  const updateWarnings = useCallback(() => {
    if (warningsConfig.enabled && warningsConfig.apiUrl[location.country]) {
      fetchWarnings(location);
      setWarningsUpdated(Date.now());
    }
  }, [fetchWarnings, location, warningsConfig]);

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

  return (
    <SafeAreaView>
      <GradientWrapper>
        <ScrollView
          style={[styles.container]}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}>
          <NextHourForecastPanel />
          <WarningsPanelSlim />
          <ForecastPanel />
          <ObservationPanel />
        </ScrollView>
      </GradientWrapper>
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
