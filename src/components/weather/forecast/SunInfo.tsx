import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';
import moment from 'moment';

import { State } from '@store/types';
import { selectLoading, selectNextHourForecast } from '@store/forecast/selectors';

const mapStateToProps = (state: State) => ({
  loading: selectLoading(state),
  forecast: selectNextHourForecast(state),
});

const connector = connect(mapStateToProps, {});

type SunInfoProps = ConnectedProps<typeof connector>;

const SunInfo: React.FC<SunInfoProps> = ({loading, forecast}) => {
  const { t } = useTranslation('forecast');

  if (loading || !forecast) return null;

  const sunrise = moment(`${forecast.sunrise}Z`);
  const sunset = moment(`${forecast.sunset}Z`);
  const timeFormat = 'HH:mm';

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('sunRises')} {sunrise.format(timeFormat)}</Text>
      <Text style={styles.text}>{t('sunSets')} {sunset.format(timeFormat)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  text: {
    fontSize: 20,
  }
});

export default connector(SunInfo);