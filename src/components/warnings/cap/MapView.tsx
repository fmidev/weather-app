import { Config } from '@config';
import { useTheme } from '@react-navigation/native';
import { CustomTheme, GRAY_8 } from '@utils/colors';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Map from 'react-native-maps';
import DaySelectorList from './DaySelectorList';
import WarningTypeFiltersList from './WarningTypeFiltersList';

const INITIAL_REGION = {
  latitude: 64.62582958724917,
  longitude: 25.738316179155703,
  latitudeDelta: 12.605611795457705,
  longitudeDelta: 15.729689156090728,
};

const MapView = ({ dates }: { dates: { weekday: string; date: string }[] }) => {
  const { dark } = useTheme() as CustomTheme;
  const capViewSettings = Config.get('warnings')?.capViewSettings;

  return (
    <View
      style={
        (styles.mapContainer, { height: capViewSettings?.mapHeight ?? 400 })
      }>
      <Map
        accessibilityElementsHidden
        initialRegion={INITIAL_REGION}
        onRegionChangeComplete={() => {}}
        userInterfaceStyle={dark ? 'dark' : 'light'}
        mapType="standard"
        zoomEnabled={false}
      />
      <DaySelectorList dates={dates} />
      <WarningTypeFiltersList />
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    backgroundColor: GRAY_8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MapView;
