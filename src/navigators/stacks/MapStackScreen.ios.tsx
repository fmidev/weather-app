import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Announcements from '@components/announcements/Announcements';
import MapScreen from '@screens/MapScreen';
import SearchScreen from '@screens/SearchScreen';
import { ScreenHeaderItemsContext, useScreenHeaderOptions } from '../ScreenHeaderItemsContext';
import type { MapStackScreenProps } from './MapStackScreen';

const MapStack = createNativeStackNavigator();

const MapWithAnnouncements = () => (
  <View style={styles.container}>
    <Announcements />
    <View style={styles.mapContainer}>
      <MapScreen />
    </View>
  </View>
);

const MapStackScreen: React.FC<MapStackScreenProps> = ({
  nativeMapOptions,
  nativeSearchOptions,
  stackScreenListener,
}) => {
  const { headerOptions, setItems } = useScreenHeaderOptions(nativeMapOptions);

  return (
    <ScreenHeaderItemsContext.Provider value={setItems}>
      <MapStack.Navigator>
        <MapStack.Screen
          name="StackMap"
          component={MapWithAnnouncements}
          options={headerOptions}
        />
        <MapStack.Screen
          name="Search"
          component={SearchScreen}
          options={nativeSearchOptions}
          listeners={stackScreenListener}
        />
      </MapStack.Navigator>
    </ScreenHeaderItemsContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { flex: 1, overflow: 'hidden' },
});

export default MapStackScreen;
