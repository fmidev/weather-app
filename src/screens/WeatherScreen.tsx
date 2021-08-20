import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import { State } from '../store/types';
import { selectCurrentLocation, selectGeoid } from '../store/general/selectors';
import { selectForecast } from '../store/forecast/selectors';
import { fetchForecast as fetchForecastAction } from '../store/forecast/actions';

const mapStateToProps = (state: State) => ({
  forecast: selectForecast(state),
  currentLocation: selectCurrentLocation(state),
  geoid: selectGeoid(state),
});

const mapDispatchToProps = {
  fetchForecast: fetchForecastAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux;

const WeatherScreen: React.FC<Props> = ({ forecast, geoid, fetchForecast }) => {
  useEffect(() => {
    fetchForecast({ geoid }, [geoid]);
  }, [geoid, fetchForecast]);

  const renderforecast = () =>
    forecast.map(
      (step, index: number) =>
        index < 10 && (
          <Text key={step.epochtime} style={styles.text}>
            {step.epochtime} - {step.temperature}
          </Text>
        )
    );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Ladattu geoid: {geoid}</Text>
      {console.log({ forecast, geoid })}
      {renderforecast()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default connector(WeatherScreen);
