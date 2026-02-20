import React from 'react';
import { createStackNavigator, type StackNavigationOptions } from '@react-navigation/stack';

import MapScreen from '@screens/MapScreen';
import SearchScreen from '@screens/SearchScreen';
import type { StackScreenListener } from './types';

type MapStackScreenProps = {
  mapOptions: StackNavigationOptions;
  searchOptions: StackNavigationOptions;
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
