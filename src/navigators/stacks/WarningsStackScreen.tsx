import React from 'react';
import { createStackNavigator, type StackNavigationOptions } from '@react-navigation/stack'

import WarningsScreen from '@screens/WarningsScreen';
import SearchScreen from '@screens/SearchScreen';
import type { StackScreenListener } from './types';

type WarningsStackScreenProps = {
  warningsOptions: StackNavigationOptions;
  searchOptions: StackNavigationOptions;
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
