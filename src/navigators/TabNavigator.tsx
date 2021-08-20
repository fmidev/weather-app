import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  AppState,
  Appearance,
  Platform,
  AppStateStatus,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import Permissions, { PERMISSIONS } from 'react-native-permissions';
import { useTranslation } from 'react-i18next';
import SplashScreen from 'react-native-splash-screen';

import PlaceholderScreen from '../screens/PlaceHolderScreen';
import OthersScreen from '../screens/OthersScreen';
import MapScreen from '../screens/MapScreen';
import WeatherScreen from '../screens/WeatherScreen';
import SymbolsScreen from '../screens/SymbolsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SearchScreen from '../screens/SearchScreen';
import AboutScreen from '../screens/AboutScreen';

import Icon from '../components/Icon';
import HeaderButton from '../components/HeaderButton';

import { State } from '../store/types';
import { selectTheme } from '../store/settings/selectors';
import { setCurrentLocation as setCurrentLocationAction } from '../store/general/actions';
import CommonHeaderTitle from '../components/CommonHeaderTitle';

import { initSettings as initSettingsAction } from '../store/settings/actions';

import { getGeolocation } from '../utils/helpers';
import { lightTheme, darkTheme } from './themes';
import {
  TabParamList,
  OthersStackParamList,
  MapStackParamList,
  ForecastStackParamList,
} from './types';

const mapStateToProps = (state: State) => ({
  theme: selectTheme(state),
});

const mapDispatchToProps = {
  initSettings: initSettingsAction,
  setCurrentLocation: setCurrentLocationAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & {
  initialColorScheme?: string | null;
};

const Tab = createBottomTabNavigator<TabParamList>();
const MapStack = createStackNavigator();
const ForecastStack = createStackNavigator();
const OthersStack = createStackNavigator<OthersStackParamList>();
const WarningsStack = createStackNavigator();

const Navigator: React.FC<Props> = ({
  initSettings,
  setCurrentLocation,
  initialColorScheme,
  theme,
}) => {
  const { t, ready } = useTranslation(['navigation', 'placeholder'], {
    useSuspense: false,
  });
  const [useDarkTheme, setUseDarkTheme] = useState<boolean>(
    initialColorScheme === 'dark'
  );

  useEffect(() => {
    initSettings();
  }, [initSettings]);

  // hide splash screen only when theme is known to avoid weird behavior
  useEffect(() => {
    if (theme) {
      SplashScreen.hide();
    }
  }, [theme]);

  useEffect(() => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_ALWAYS
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    Permissions.request(permission).then((result) => {
      if (result === Permissions.RESULTS.GRANTED) {
        console.log('location granted');
      }
    });
  }, []);

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAppStateChange = (state: AppStateStatus) => {
    if (state === 'active' && theme === 'automatic') {
      // getColorScheme() returns 'light' on iOS debug mode
      if (Appearance.getColorScheme() === 'dark') {
        setUseDarkTheme(true);
      } else {
        setUseDarkTheme(false);
      }
    }
  };

  useEffect(() => {
    if (theme === 'dark' && !useDarkTheme) {
      setUseDarkTheme(true);
    }
    if (theme === 'light' && useDarkTheme) {
      setUseDarkTheme(false);
    }
    if (theme === 'automatic') {
      if (Appearance.getColorScheme() === 'dark') {
        setUseDarkTheme(true);
      } else {
        setUseDarkTheme(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  if (!ready) return <ActivityIndicator size="large" />;

  const WarningsScreen = () => (
    <PlaceholderScreen text={`${t('placeholder:warnings')}`} testIndex={2} />
  );

  const NotificationsScreen = () => (
    <PlaceholderScreen
      text={`${t('placeholder:notifications')}`}
      testIndex={6}
    />
  );

  const CommonHeaderOptions = ({
    navigation,
  }: {
    navigation: StackNavigationProp<MapStackParamList | ForecastStackParamList>;
  }) => ({
    headerTitle: () => <CommonHeaderTitle />,

    headerStyle: {
      shadowColor: 'transparent',
    },
    headerRight: () => (
      <HeaderButton
        title="Haku"
        accessibilityLabel="Press to search"
        icon="search"
        onPress={() => navigation.navigate('Search')}
        right
      />
    ),
    headerLeft: () => (
      <HeaderButton
        title="Paikanna"
        accessibilityLabel="Press to locate"
        icon="locate"
        onPress={() => getGeolocation(setCurrentLocation, t)}
      />
    ),
  });

  const MapStackScreen = () => (
    <MapStack.Navigator>
      <MapStack.Screen
        name="Map"
        component={MapScreen}
        options={CommonHeaderOptions}
      />
      <MapStack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          headerBackTitleVisible: false,
          headerTitle: '',
          headerStyle: { shadowColor: 'transparent' },
          headerBackImage: ({ tintColor }) => (
            <Icon
              name="arrow-back"
              style={{ color: tintColor }}
              width={26}
              height={26}
            />
          ),
        }}
      />
    </MapStack.Navigator>
  );

  const ForecastStackScreen = () => (
    <ForecastStack.Navigator>
      <ForecastStack.Screen
        name="Forecast"
        component={WeatherScreen}
        options={CommonHeaderOptions}
      />
      <ForecastStack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          headerBackTitleVisible: false,
          headerTitle: '',
          headerStyle: { shadowColor: 'transparent' },
          headerBackImage: ({ tintColor }) => (
            <Icon
              name="arrow-back"
              style={{ color: tintColor }}
              width={26}
              height={26}
            />
          ),
        }}
      />
    </ForecastStack.Navigator>
  );

  const WarningsStackScreen = () => (
    <WarningsStack.Navigator>
      <WarningsStack.Screen
        name="Warnings"
        component={WarningsScreen}
        options={{ headerShown: false }}
      />
    </WarningsStack.Navigator>
  );

  const OthersStackScreen = () => (
    <OthersStack.Navigator initialRouteName="Others">
      <OthersStack.Screen
        name="Others"
        component={OthersScreen}
        options={{ headerTitle: `${t('navigation:others')}` }}
      />
      <OthersStack.Screen
        name="About"
        component={AboutScreen}
        options={{
          headerTitle: `${t('navigation:about')}`,
          headerBackImage: ({ tintColor }) => (
            <Icon
              name="arrow-back"
              style={{ color: tintColor }}
              width={26}
              height={26}
            />
          ),
        }}
      />
      <OthersStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: `${t('navigation:settings')}`,
          headerBackImage: ({ tintColor }) => (
            <Icon
              name="arrow-back"
              style={{ color: tintColor }}
              width={26}
              height={26}
            />
          ),
        }}
      />
      <OthersStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerTitle: `${t('navigation:notifications')}`,
          headerBackImage: ({ tintColor }) => (
            <Icon
              name="arrow-back"
              style={{ color: tintColor }}
              width={26}
              height={26}
            />
          ),
        }}
      />
      <OthersStack.Screen
        name="Symbols"
        component={SymbolsScreen}
        options={{
          headerTitle: `${t('navigation:symbols')}`,
          headerBackImage: ({ tintColor }) => (
            <Icon
              name="arrow-back"
              style={{ color: tintColor }}
              width={26}
              height={26}
            />
          ),
        }}
      />
    </OthersStack.Navigator>
  );

  return (
    <>
      {Platform.OS === 'android' && (
        <StatusBar
          backgroundColor={
            useDarkTheme
              ? darkTheme.colors.headerBackground
              : lightTheme.colors.headerBackground
          }
          barStyle={useDarkTheme ? 'light-content' : 'dark-content'}
        />
      )}
      <NavigationContainer theme={useDarkTheme ? darkTheme : lightTheme}>
        <Tab.Navigator
          initialRouteName="Map"
          tabBarOptions={{
            labelStyle: styles.tabText,
          }}>
          <Tab.Screen
            name="Map"
            component={MapStackScreen}
            options={{
              tabBarTestID: 'navigation_map',
              tabBarLabel: `${t('navigation:map')}`,
              tabBarIcon: ({ color, size }) => (
                <Icon name="map" style={{ color }} width={size} height={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Forecast"
            component={ForecastStackScreen}
            options={{
              tabBarTestID: 'navigation_forecast',
              tabBarLabel: `${t('navigation:weather')}`,
              tabBarIcon: ({ color, size }) => (
                <Icon
                  name="weather"
                  style={{ color }}
                  width={size}
                  height={size}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Warnings"
            component={WarningsStackScreen}
            options={{
              tabBarTestID: 'navigation_warnings',
              tabBarLabel: `${t('navigation:warnings')}`,
              tabBarIcon: ({ color, size }) => (
                <Icon
                  name="warnings"
                  style={{ color }}
                  width={size}
                  height={size}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Others"
            component={OthersStackScreen}
            options={{
              tabBarTestID: 'navigation_others',
              tabBarLabel: `${t('navigation:others')}`,
              tabBarIcon: ({ color, size }) => (
                <Icon
                  name="menu"
                  style={{ color }}
                  width={size}
                  height={size}
                />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
};

const styles = StyleSheet.create({
  tabText: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
  },
});

export default connector(Navigator);
