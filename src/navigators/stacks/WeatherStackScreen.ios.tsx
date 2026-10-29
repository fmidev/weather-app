import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WeatherScreen from '@screens/WeatherScreen';
import SearchScreen from '@screens/SearchScreen';
import { ScreenHeaderItemsContext, useScreenHeaderOptions } from '../ScreenHeaderItemsContext';
import type { WeatherStackScreenProps } from './WeatherStackScreen';

const WeatherStack = createNativeStackNavigator();

const WeatherStackScreen: React.FC<WeatherStackScreenProps> = ({
  nativeWeatherOptions,
  nativeSearchOptions,
  stackScreenListener,
}) => {
  const { headerOptions, setItems } = useScreenHeaderOptions(nativeWeatherOptions);

  return (
    <ScreenHeaderItemsContext.Provider value={setItems}>
      <WeatherStack.Navigator>
        <WeatherStack.Screen
          name="StackWeather"
          component={WeatherScreen}
          options={headerOptions}
        />
        <WeatherStack.Screen
          name="Search"
          component={SearchScreen}
          options={nativeSearchOptions}
          listeners={stackScreenListener}
        />
      </WeatherStack.Navigator>
    </ScreenHeaderItemsContext.Provider>
  );
};

export default WeatherStackScreen;
