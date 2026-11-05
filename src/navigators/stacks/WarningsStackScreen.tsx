import React from 'react';
import {
  createStackNavigator,
  type StackNavigationOptions,
} from '@react-navigation/stack';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import WarningsScreen from '@screens/WarningsScreen';
import SearchScreen from '@screens/SearchScreen';
import type { StackScreenListener } from './types';

export type WarningsStackScreenProps = {
  warningsOptions: StackNavigationOptions;
  searchOptions: StackNavigationOptions;
  nativeWarningsOptions: NativeStackNavigationOptions;
  nativeSearchOptions: NativeStackNavigationOptions;
  stackScreenListener: StackScreenListener;
};

const WarningsStack = createStackNavigator();

const WarningsStackScreen: React.FC<WarningsStackScreenProps> = ({
  warningsOptions,
  searchOptions,
  stackScreenListener,
}) => (
  <WarningsStack.Navigator>
    <WarningsStack.Screen
      name="StackWarnings"
      component={WarningsScreen}
      options={warningsOptions}
      initialParams={{ day: 0 }}
    />
    <WarningsStack.Screen
      name="Search"
      component={SearchScreen}
      options={searchOptions}
      listeners={stackScreenListener}
    />
  </WarningsStack.Navigator>
);

export default WarningsStackScreen;
