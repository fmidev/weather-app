import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import 'moment/locale/fi';
import { useTheme } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { WeatherStackParamList } from '@navigators/types';

import { State } from '@store/types';
import { selectGeoid } from '@store/location/selector';
import { fetchForecast as fetchForecastAction } from '@store/forecast/actions';

import WarningsPanel from '@components/weather/WarningsPanel';
import ForecastPanel from '@components/weather/ForecastPanel';
import ObservationPanel from '@components/weather/ObservationPanel';

import { CustomTheme } from '@utils/colors';

const mapStateToProps = (state: State) => ({
  geoid: selectGeoid(state),
});

const mapDispatchToProps = {
  fetchForecast: fetchForecastAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type WeatherScreenProps = {
  navigation: StackNavigationProp<WeatherStackParamList, 'Weather'>;
} & PropsFromRedux;

const WeatherScreen: React.FC<WeatherScreenProps> = ({
  fetchForecast,
  geoid,
  navigation,
}) => {
  const { colors } = useTheme() as CustomTheme;

  useEffect(() => {
    fetchForecast({ geoid }, [geoid]);
  }, [geoid, fetchForecast]);

  return (
    <SafeAreaView>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.screenBackground }]}
        showsVerticalScrollIndicator={false}>
        <WarningsPanel
          headers={['Pe 24.9.', 'La 25.9.', 'Su 26.9.', 'Ma 27.9.', 'Ti 28.9.']}
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
