import React from 'react';
import {
  createStackNavigator,
  type StackNavigationOptions,
} from '@react-navigation/stack';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import WeatherScreen from '@screens/WeatherScreen';
import SearchScreen from '@screens/SearchScreen';
import type { StackScreenListener } from './types';

export type WeatherStackScreenProps = {
  weatherOptions: StackNavigationOptions;
  searchOptions: StackNavigationOptions;
  nativeWeatherOptions: NativeStackNavigationOptions;
  nativeSearchOptions: NativeStackNavigationOptions;
  stackScreenListener: StackScreenListener;
};

const WeatherStack = createStackNavigator();

const WeatherStackScreen: React.FC<WeatherStackScreenProps> = ({
  weatherOptions,
  searchOptions,
  stackScreenListener,
}) => (
  <WeatherStack.Navigator>
    <WeatherStack.Screen
      name="StackWeather"
      component={WeatherScreen}
      options={weatherOptions}
    />
    <WeatherStack.Screen
      name="Search"
      component={SearchScreen}
      options={searchOptions}
      listeners={stackScreenListener}
    />
  </WeatherStack.Navigator>
);

export default WeatherStackScreen;
