import { Severity, WarningType } from '@store/warnings/types';
import { GRAYISH_BLUE, WHITE } from '@utils/colors';
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import WarningSymbol from '../WarningsSymbol';

const warningTypes: { severity: Severity; type: WarningType }[] = [
  { severity: 'Extreme', type: 'coldWeather' },
  { severity: 'Severe', type: 'coldWeather' },
  { severity: 'Moderate', type: 'coldWeather' },
  { severity: 'Extreme', type: 'flooding' },
  { severity: 'Severe', type: 'flooding' },
  { severity: 'Moderate', type: 'flooding' },
  { severity: 'Extreme', type: 'forestFireWeather' },
  { severity: 'Severe', type: 'forestFireWeather' },
  { severity: 'Moderate', type: 'forestFireWeather' },
];

const WarningTypeFiltersList = () => (
  <ScrollView
    style={styles.row}
    horizontal
    showsHorizontalScrollIndicator={false}>
    {warningTypes.slice(0).map(({ severity, type }) => (
      <View style={styles.filterButton}>
        <WarningSymbol severity={severity} type={type} />
      </View>
    ))}
    <View style={styles.filterButton}>
      <WarningSymbol severity="Severe" type="coldWeather" />
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  filterButton: {
    backgroundColor: WHITE,
    padding: 8,
    borderRadius: 7,
    marginRight: 12,
    borderWidth: 1,
    borderColor: GRAYISH_BLUE,
  },
});

export default WarningTypeFiltersList;
