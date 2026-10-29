import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Announcements from '@components/announcements/Announcements';
import WarningsScreen from '@screens/WarningsScreen';
import SearchScreen from '@screens/SearchScreen';
import { ScreenHeaderItemsContext, useScreenHeaderOptions } from '../ScreenHeaderItemsContext';
import type { WarningsStackScreenProps } from './WarningsStackScreen';

const WarningsStack = createNativeStackNavigator();

const WarningsWithAnnouncements = () => (
  <View style={styles.container}>
    <Announcements />
    <WarningsScreen />
  </View>
);

const WarningsStackScreen: React.FC<WarningsStackScreenProps> = ({
  nativeWarningsOptions,
  nativeSearchOptions,
  stackScreenListener,
}) => {
  const { headerOptions, setItems } = useScreenHeaderOptions(nativeWarningsOptions);

  return (
    <ScreenHeaderItemsContext.Provider value={setItems}>
      <WarningsStack.Navigator>
        <WarningsStack.Screen
          name="StackWarnings"
          component={WarningsWithAnnouncements}
          options={headerOptions}
          initialParams={{ day: 0 }}
        />
        <WarningsStack.Screen
          name="Search"
          component={SearchScreen}
          options={nativeSearchOptions}
          listeners={stackScreenListener}
        />
      </WarningsStack.Navigator>
    </ScreenHeaderItemsContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default WarningsStackScreen;
