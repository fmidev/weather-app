import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import moment from 'moment';
import 'moment/locale/fi';
import { useTheme } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { ForecastStackParamList } from '@navigators/types';

import { State } from '@store/types';
import { selectCurrent, selectGeoid } from '@store/location/selector';
import { selectForecast } from '@store/forecast/selectors';
import { fetchForecast as fetchForecastAction } from '@store/forecast/actions';

import WarningsPanel from '@components/weather/WarningsPanel';
import ForecastPanel from '@components/weather/ForecastPanel';
import ObservationPanel from '@components/weather/ObservationPanel';

import { CustomTheme } from '@utils/colors';
import { TimestepData } from '@store/forecast/types';

const mapStateToProps = (state: State) => ({
  forecast: selectForecast(state),
  currentLocation: selectCurrent(state),
  geoid: selectGeoid(state),
});

const mapDispatchToProps = {
  fetchForecast: fetchForecastAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type WeatherScreenProps = {
  navigation: StackNavigationProp<ForecastStackParamList, 'Forecast'>;
} & PropsFromRedux;

const WeatherScreen: React.FC<WeatherScreenProps> = ({
  forecast,
  fetchForecast,
  // currentLocation,
  geoid,
  navigation,
}) => {
  const { colors } = useTheme() as CustomTheme;

  useEffect(() => {
    fetchForecast({ geoid }, [geoid]);
  }, [geoid, fetchForecast]);

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
        showsVerticalScrollIndicator={false}>
        <WarningsPanel
          headers={warningsHeaders5Days}
          onNavigate={() =>
            navigation.dangerouslyGetParent()?.navigate('Warnings')
          }
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
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
});

export default connector(WeatherScreen);
