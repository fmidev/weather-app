import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { ActivityIndicator, View, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import { State } from '@store/types';
import { selectLoading, selectNextHoursForecast } from '@store/forecast/selectors';
import HourForecast from './forecast/HourForecast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const mapStateToProps = (state: State) => ({
  loading: selectLoading(state),
  forecast: selectNextHoursForecast(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type NextHoursForecastProps = PropsFromRedux & {
  currentHour: number;
};

const NextHoursForecast: React.FC<NextHoursForecastProps> = ({
  loading,
  forecast,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  currentHour, // To force re-render when the hour changes
}) => {
  const HOUR_FORECAST_WIDTH = 70;
  const TIMESTEP_COUNT_FOR_PHONES = 12;
  const { t } = useTranslation('forecast');
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  if (loading || !forecast) {
    return (
      <View style={[styles.container]}>
        <ActivityIndicator accessibilityLabel={t('weather:loading')} />
      </View>
    );
  }

  const isWideDisplay = () => width > 500;
  const safeAreaWidth = width - insets.left - insets.right;
  const count = !isWideDisplay() ?
                TIMESTEP_COUNT_FOR_PHONES
                : Math.min(forecast.length - 1, Math.floor(safeAreaWidth / HOUR_FORECAST_WIDTH));

  const forceDark = forecast[0]?.smartSymbol && forecast[0]?.smartSymbol > 100 ? true : false;

  return isWideDisplay() ? (
    <View testID="next_hours_forecast" style={
      [styles.container, styles.row, { paddingLeft: insets.left, paddingRight: insets.right }]
    }>
      { forecast.slice(1, count + 1).map(item => (
        <HourForecast key={item.epochtime} timeStep={item} forceDark={forceDark} />)
      )}
    </View>
  ) : (
    <View testID="next_hours_forecast" style={
      [styles.container, styles.row, { paddingLeft: insets.left, paddingRight: insets.right }]
    }>
      <ScrollView
        testID="next_hours_forecast"
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        { forecast.slice(1, count + 1).map(item => (
          <HourForecast key={item.epochtime} timeStep={item} forceDark={forceDark} />)
        )}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    marginTop: -60,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
});

export default connector(NextHoursForecast);
