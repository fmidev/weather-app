import React, { useCallback, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import moment from 'moment';
import 'moment/locale/fi';
import { useTheme, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { WeatherStackParamList } from '@navigators/types';

import { State } from '@store/types';
import { selectCurrent } from '@store/location/selector';
import { selectForecast } from '@store/forecast/selectors';
import { fetchForecast as fetchForecastAction } from '@store/forecast/actions';
import { fetchObservation as fetchObservationAction } from '@store/observation/actions';

import WarningsPanel from '@components/weather/WarningsPanel';
import ForecastPanel from '@components/weather/ForecastPanel';
import ObservationPanel from '@components/weather/ObservationPanel';

import { CustomTheme } from '@utils/colors';
import { TimestepData } from '@store/forecast/types';

import { Config } from '@config';
import { useReloader } from '@utils/reloader';

const mapStateToProps = (state: State) => ({
  forecast: selectForecast(state),
  location: selectCurrent(state),
});

const mapDispatchToProps = {
  fetchForecast: fetchForecastAction,
  fetchObservation: fetchObservationAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type WeatherScreenProps = {
  navigation: StackNavigationProp<WeatherStackParamList, 'Weather'>;
} & PropsFromRedux;

const WeatherScreen: React.FC<WeatherScreenProps> = ({
  forecast,
  fetchForecast,
  fetchObservation,
  location,
  navigation,
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
    fetchObservation({ geoid: location.id }, location.country);
    setObservationUpdated(Date.now());
  }, [fetchObservation, location]);

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

  const forecastByDay = forecast.reduce(
    (acc: { [key: string]: any }, curr: TimestepData) => {
      const day = moment.unix(curr.epochtime).format('D.M.');
      if (acc[day]) {
        return { ...acc, [day]: acc[day].concat(curr) };
      }
      return { ...acc, [day]: [curr] };
    },
    {}
  );

  const headerLevelForecast: TimestepData[] =
    forecastByDay &&
    Object.keys(forecastByDay).map((key: string, index: number) => {
      const weatherDataArr = forecastByDay[key];
      if (weatherDataArr.length >= 16) {
        return weatherDataArr[15];
      }
      return index === 0
        ? weatherDataArr[0]
        : weatherDataArr[weatherDataArr.length - 1];
    });

  const warningsHeaders5Days = headerLevelForecast.slice(0, 5).map((day) => {
    const dayMoment = moment.unix(day.epochtime);
    return dayMoment.format('ddd D.M.');
  });

  return (
    <SafeAreaView>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.screenBackground }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <WarningsPanel
          headers={warningsHeaders5Days}
          onNavigate={() => navigation.getParent()?.navigate('Warnings')}
        />
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
