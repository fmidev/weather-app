import { GRAY_8 } from '@utils/colors';
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import DaySelectorList from './DaySelectorList';
import WarningTypeFiltersList from './WarningTypeFiltersList';

const MapView = () => (
  <View style={styles.mapContainer}>
    <Text>KARTTA</Text>
    <DaySelectorList />
    <WarningTypeFiltersList />
  </View>
);

const styles = StyleSheet.create({
  mapContainer: {
    backgroundColor: GRAY_8,
    height: 400,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MapView;
