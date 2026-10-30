import React from 'react';
import {
  createStackNavigator,
  type StackNavigationOptions,
} from '@react-navigation/stack';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import MapScreen from '@screens/MapScreen';
import SearchScreen from '@screens/SearchScreen';
import type { StackScreenListener } from './types';

export type MapStackScreenProps = {
  mapOptions: StackNavigationOptions;
  searchOptions: StackNavigationOptions;
  nativeMapOptions: NativeStackNavigationOptions;
  nativeSearchOptions: NativeStackNavigationOptions;
  stackScreenListener: StackScreenListener;
};

const MapStack = createStackNavigator();

const MapStackScreen: React.FC<MapStackScreenProps> = ({
  mapOptions,
  searchOptions,
  stackScreenListener,
}) => (
  <MapStack.Navigator>
    <MapStack.Screen
      name="StackMap"
      component={MapScreen}
      options={mapOptions}
    />
    <MapStack.Screen
      name="Search"
      component={SearchScreen}
      options={searchOptions}
      listeners={stackScreenListener}
    />
  </MapStack.Navigator>
);

export default MapStackScreen;
