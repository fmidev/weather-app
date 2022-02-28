/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect, useRef } from 'react';
import {
  AppState,
  Appearance,
  Platform,
  AppStateStatus,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  View,
} from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createStackNavigator,
  StackNavigationOptions,
  StackNavigationProp,
} from '@react-navigation/stack';
import type { NavigationState } from '@react-navigation/routers';
import RBSheet from 'react-native-raw-bottom-sheet';

import Permissions, { PERMISSIONS } from 'react-native-permissions';
import { useTranslation } from 'react-i18next';
import SplashScreen from 'react-native-splash-screen';

import OthersScreen from '@screens/OthersScreen';
import MapScreen from '@screens/MapScreen';
import WeatherScreen from '@screens/WeatherScreen';
import SymbolsScreen from '@screens/SymbolsScreen';
import SettingsScreen from '@screens/SettingsScreen';
import SearchScreen from '@screens/SearchScreen';
import AboutScreen from '@screens/AboutScreen';
import WarningsScreen from '@screens/WarningsScreen';

import SearchInfoBottomSheet from '@components/search/SearchInfoBottomSheet';

import Icon from '@components/common/Icon';
import HeaderButton from '@components/common/HeaderButton';
import CommonHeaderTitle from '@components/common/CommonHeaderTitle';

import { State } from '@store/types';
import { selectTheme } from '@store/settings/selectors';
import { setCurrentLocation as setCurrentLocationAction } from '@store/location/actions';
import { getGeolocation } from '@utils/helpers';

import {
  PRIMARY_BLUE,
  WHITE,
  GRAY_1,
  TRANSPARENT,
  SHADOW_DARK,
  SHADOW_LIGHT,
} from '@utils/colors';
import { selectInitialTab } from '@store/navigation/selectors';
import { setNavigationTab as setNavigationTabAction } from '@store/navigation/actions';
import { NavigationTabValues, NavigationTab } from '@store/navigation/types';
import { lightTheme, darkTheme } from './themes';
import {
  TabParamList,
  OthersStackParamList,
  MapStackParamList,
  WeatherStackParamList,
} from './types';

const mapStateToProps = (state: State) => ({
  initialTab: selectInitialTab(state),
  theme: selectTheme(state),
});

const mapDispatchToProps = {
  setCurrentLocation: setCurrentLocationAction,
  setNavigationTab: setNavigationTabAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & {};

const Tab = createBottomTabNavigator<TabParamList>();
const MapStack = createStackNavigator();
const WeatherStack = createStackNavigator();
const OthersStack = createStackNavigator<OthersStackParamList>();
const WarningsStack = createStackNavigator();

const Navigator: React.FC<Props> = ({
  setCurrentLocation,
  setNavigationTab,
  theme,
  initialTab,
}) => {
  const { t, ready } = useTranslation(['navigation', 'placeholder'], {
    useSuspense: false,
  });
  const searchInfoSheetRef = useRef() as React.MutableRefObject<RBSheet>;
  const isDark = (currentTheme: string): boolean =>
    currentTheme === 'dark' ||
    (currentTheme === 'automatic' && Appearance.getColorScheme() === 'dark');

  const [useDarkTheme, setUseDarkTheme] = useState<boolean>(isDark(theme));

  // hide splash screen only when theme is known to avoid weird behavior
  useEffect(() => {
    if (theme && !!ready) {
      SplashScreen.hide();
    }
  }, [theme, ready]);

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

  const handleAppStateChange = (state: AppStateStatus) => {
    if (state === 'active') {
      setUseDarkTheme(isDark(theme));
    }
  };

  const navigationTabChanged = (state: NavigationState | undefined) => {
    const navigationTab = state?.routeNames[state?.index] as NavigationTab;
    if (Number.isInteger(NavigationTabValues[navigationTab])) {
      setNavigationTab(navigationTab);
    }
  };

  useEffect(() => {
    setUseDarkTheme(isDark(theme));
    const appStateSubscriber = AppState.addEventListener(
      'change',
      handleAppStateChange
    );
    return () => appStateSubscriber.remove();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  const HeaderBackImage = ({ tintColor }: { tintColor: string }) => (
    <View style={styles.headerBackImage}>
      <Icon
        name="arrow-back"
        style={[{ color: tintColor }]}
        width={26}
        height={26}
      />
    </View>
  );

  const CommonHeaderOptions: StackNavigationOptions = {
    headerTintColor: useDarkTheme ? WHITE : PRIMARY_BLUE,
    headerStyle: {
      ...styles.header,
      shadowColor: useDarkTheme ? SHADOW_DARK : SHADOW_LIGHT,
    },
    headerTitleAlign: 'center',
    headerBackImage: ({ tintColor }: { tintColor: string }) => (
      <HeaderBackImage tintColor={tintColor} />
    ),
    headerBackTitleVisible: false,
  };

  const LocationHeaderOptions = ({
    navigation,
  }: {
    navigation: StackNavigationProp<MapStackParamList | WeatherStackParamList>;
  }) => ({
    ...CommonHeaderOptions,
    headerLeft: () => (
      <HeaderButton
        title={t('navigation:locate')}
        accessibilityLabel={t('navigation:locateAccessibilityLabel')}
        icon="locate"
        onPress={() => getGeolocation(setCurrentLocation, t)}
      />
    ),
    headerTitle: () => (
      <CommonHeaderTitle onPress={() => navigation.navigate('Search')} />
    ),
    headerRight: () => (
      <HeaderButton
        title={t('navigation:search')}
        accessibilityLabel={t('navigation:searchAccessibilityLabel')}
        icon="search"
        onPress={() => navigation.navigate('Search')}
        right
      />
    ),
  });

  const SearchScreenOptions = {
    ...CommonHeaderOptions,
    headerBackTitleVisible: false,
    headerTitle: t('navigation:search'),
    headerRight: () => (
      <HeaderButton
        accessibilityLabel="Press to show info"
        icon="info"
        onPress={() => searchInfoSheetRef.current.open()}
      />
    ),
  };

  const MapStackScreen = () => (
    <MapStack.Navigator>
      <MapStack.Screen
        name="StackMap"
        component={MapScreen}
        options={LocationHeaderOptions}
      />
      <MapStack.Screen
        name="Search"
        component={SearchScreen}
        options={SearchScreenOptions}
      />
    </MapStack.Navigator>
  );

  const WeatherStackScreen = () => (
    <WeatherStack.Navigator>
      <WeatherStack.Screen
        name="StackWeather"
        component={WeatherScreen}
        options={LocationHeaderOptions}
      />
      <WeatherStack.Screen
        name="Search"
        component={SearchScreen}
        options={SearchScreenOptions}
      />
    </WeatherStack.Navigator>
  );

  const WarningsStackScreen = () => (
    <WarningsStack.Navigator>
      <WarningsStack.Screen
        name="StackWarnings"
        component={WarningsScreen}
        options={LocationHeaderOptions}
        initialParams={{ day: 0 }}
      />
      <WeatherStack.Screen
        name="Search"
        component={SearchScreen}
        options={SearchScreenOptions}
      />
    </WarningsStack.Navigator>
  );

  const OthersStackScreen = () => (
    <OthersStack.Navigator initialRouteName="StackOthers">
      <OthersStack.Screen
        name="StackOthers"
        component={OthersScreen}
        options={{
          ...CommonHeaderOptions,
          headerTitle: `${t('navigation:others')}`,
        }}
      />
      <OthersStack.Screen
        name="About"
        component={AboutScreen}
        options={{
          ...CommonHeaderOptions,
          headerTitle: `${t('navigation:about')}`,
        }}
      />
      <OthersStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          ...CommonHeaderOptions,
          headerTitle: `${t('navigation:settings')}`,
        }}
      />
      <OthersStack.Screen
        name="Symbols"
        component={SymbolsScreen}
        options={{
          ...CommonHeaderOptions,
          headerTitle: `${t('navigation:symbols')}`,
        }}
      />
    </OthersStack.Navigator>
  );

  // TODO: this is never shown as SplashScreen is visible with the condition
  // however, this prevents unnecessary child component rendering
  if (!ready || !theme) {
    return null;
  }

  return (
    <>
      <StatusBar
        backgroundColor={
          useDarkTheme
            ? darkTheme.colors.headerBackground
            : lightTheme.colors.headerBackground
        }
        barStyle={useDarkTheme ? 'light-content' : 'dark-content'}
      />

      <NavigationContainer
        onStateChange={navigationTabChanged}
        theme={useDarkTheme ? darkTheme : lightTheme}>
        <Tab.Navigator
          initialRouteName={initialTab}
          screenOptions={{
            tabBarActiveTintColor: useDarkTheme
              ? darkTheme.colors.tabBarActive
              : lightTheme.colors.tabBarActive,
            tabBarInactiveTintColor: useDarkTheme
              ? darkTheme.colors.tabBarInactive
              : lightTheme.colors.tabBarInactive,
            tabBarLabelStyle: styles.tabText,
            tabBarButton: ({ style, accessibilityState, ...rest }) => {
              const activeColor = useDarkTheme
                ? darkTheme.colors.tabBarActive
                : lightTheme.colors.tabBarActive;

              return (
                <TouchableOpacity
                  {...rest}
                  style={[
                    ...(style as StyleProp<ViewStyle>[]),
                    styles.tabItem,
                    {
                      borderTopColor: accessibilityState?.selected
                        ? activeColor
                        : TRANSPARENT,
                    },
                  ]}
                />
              );
            },
          }}>
          <Tab.Screen
            name="Map"
            component={MapStackScreen}
            options={{
              headerShown: false,
              tabBarTestID: 'navigation_map',
              tabBarLabel: `${t('navigation:map')}`,
              tabBarLabelStyle: styles.tabText,
              tabBarIcon: ({ color, size }) => (
                <Icon name="map" style={{ color }} width={size} height={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Weather"
            component={WeatherStackScreen}
            options={{
              headerShown: false,
              tabBarTestID: 'navigation_weather',
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
              headerShown: false,
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
              headerShown: false,
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
        <RBSheet
          ref={searchInfoSheetRef}
          height={700}
          closeOnDragDown
          customStyles={{
            container: {
              ...styles.sheetContainer,
              backgroundColor: useDarkTheme
                ? darkTheme.colors.headerBackground
                : lightTheme.colors.headerBackground,
            },
            draggableIcon: styles.draggableIcon,
          }}>
          <SearchInfoBottomSheet
            onClose={() => searchInfoSheetRef.current.close()}
          />
        </RBSheet>
      </NavigationContainer>
    </>
  );
};

const styles = StyleSheet.create({
  tabText: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
  },
  headerBackImage: {
    flex: 1,
    paddingVertical: 10,
    ...Platform.select({
      ios: {
        marginLeft: 22,
      },
    }),
  },
  sheetContainer: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  draggableIcon: {
    backgroundColor: GRAY_1,
    width: 65,
  },
  tabItem: {
    borderTopWidth: 3,
  },
  header: {
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 4,
    shadowOpacity: 1,
  },
});

export default connector(Navigator);
