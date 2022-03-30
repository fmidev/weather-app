/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect, useRef } from 'react';
import {
  AppState,
  Appearance,
  Platform,
  AppStateStatus,
  StyleSheet,
  StatusBar,
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

import { useTranslation } from 'react-i18next';
import SplashScreen from 'react-native-splash-screen';

import OthersScreen from '@screens/OthersScreen';
import MapScreen from '@screens/MapScreen';
import WeatherScreen from '@screens/WeatherScreen';
import FeedbackScreen from '@screens/FeedbackScreen';
import SettingsScreen from '@screens/SettingsScreen';
import SearchScreen from '@screens/SearchScreen';
import AboutScreen from '@screens/AboutScreen';
import WarningsScreen from '@screens/WarningsScreen';
import SetupScreen from '@screens/SetupScreen';

import SearchInfoBottomSheet from '@components/search/SearchInfoBottomSheet';

import Icon from '@components/common/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
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
import {
  selectInitialTab,
  selectDidLaunchApp,
} from '@store/navigation/selectors';
import {
  setNavigationTab as setNavigationTabAction,
  setDidLaunchApp as setDidLaunchAppAction,
} from '@store/navigation/actions';
import { NavigationTabValues, NavigationTab } from '@store/navigation/types';
import TermsAndConditionsScreen from '@screens/TermsAndConditionsScreen';
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
  didLaunchApp: selectDidLaunchApp(state),
});

const mapDispatchToProps = {
  setCurrentLocation: setCurrentLocationAction,
  setNavigationTab: setNavigationTabAction,
  setDidLaunchApp: setDidLaunchAppAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & {};

const Tab = createBottomTabNavigator<TabParamList>();
const MapStack = createStackNavigator();
const WeatherStack = createStackNavigator();
const OthersStack = createStackNavigator<OthersStackParamList>();
const WarningsStack = createStackNavigator();
const SetupStack = createStackNavigator();

const Navigator: React.FC<Props> = ({
  setCurrentLocation,
  setNavigationTab,
  theme,
  initialTab,
  didLaunchApp,
  setDidLaunchApp,
}) => {
  const { t, ready } = useTranslation(['navigation', 'setUp'], {
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
    if (didLaunchApp) getGeolocation(setCurrentLocation, t, true);
  }, [didLaunchApp, setCurrentLocation, t]);

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
    headerBackAccessibilityLabel: t('navigation:backAccessibilityLabel'),
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
        accessibilityLabel={t('navigation:locate')}
        accessibilityHint={t('navigation:locateAccessibilityLabel')}
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
        accessibilityLabel={t('navigation:search')}
        accessibilityHint={t('navigation:searchAccessibilityLabel')}
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
        accessibilityLabel="info"
        accessibilityHint={t('navigation:searchInfoAccessibilityHint')}
        icon="info"
        onPress={() => searchInfoSheetRef.current.open()}
      />
    ),
  };

  /** Navigates back to initial route on blur */
  const stackScreenListener = ({ navigation }: { navigation: any }) => ({
    blur: () => {
      navigation.popToTop();
    },
  });

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
        listeners={stackScreenListener}
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
        listeners={stackScreenListener}
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
        listeners={stackScreenListener}
      />
    </WarningsStack.Navigator>
  );

  const OthersStackScreen = () => (
    <OthersStack.Navigator initialRouteName="StackOthers">
      <OthersStack.Screen
        name="StackOthers"
        component={OthersScreen}
        options={{
          headerShown: false,
        }}
      />
      <OthersStack.Screen
        name="About"
        component={AboutScreen}
        options={{
          ...CommonHeaderOptions,
          headerTitle: `${t('navigation:about')}`,
        }}
        listeners={stackScreenListener}
      />
      <OthersStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          ...CommonHeaderOptions,
          headerTitle: `${t('navigation:settings')}`,
        }}
        listeners={stackScreenListener}
      />
      <OthersStack.Screen
        name="TermsAndConditions"
        component={TermsAndConditionsScreen}
        options={{
          ...CommonHeaderOptions,
          headerTitle: `${t('navigation:termsAndConditions')}`,
        }}
      />
      <OthersStack.Screen
        name="GiveFeedback"
        component={FeedbackScreen}
        options={{
          ...CommonHeaderOptions,
          headerTitle: `${t('navigation:feedback')}`,
        }}
      />
    </OthersStack.Navigator>
  );

  const SetupStackScreen = () => (
    <SetupStack.Navigator initialRouteName="SetupScreen">
      <SetupStack.Screen
        name="SetupScreen"
        options={{
          headerShown: false,
        }}>
        {(props) => (
          <SetupScreen
            {...props}
            setUpDone={() => {
              setDidLaunchApp();
            }}
          />
        )}
      </SetupStack.Screen>
      <SetupStack.Screen
        name="TermsAndConditions"
        options={{
          ...CommonHeaderOptions,
          headerTintColor: PRIMARY_BLUE,
          headerStyle: {
            ...styles.header,
            shadowColor: SHADOW_LIGHT,
          },
          headerTitle: t('setUp:termsAndConditions'),
        }}>
        {({ navigation }) => (
          <TermsAndConditionsScreen
            showCloseButton
            onClose={() => navigation.goBack()}
          />
        )}
      </SetupStack.Screen>
    </SetupStack.Navigator>
  );

  // this is never shown as SplashScreen is visible with the condition
  // however, this prevents unnecessary child component rendering
  if (!ready || !theme) {
    return null;
  }

  if (!didLaunchApp) {
    return (
      <NavigationContainer theme={lightTheme}>
        <SetupStackScreen />
      </NavigationContainer>
    );
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
            tabBarHideOnKeyboard: true,
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
                <AccessibleTouchableOpacity
                  {...rest}
                  accessibilityRole="tab"
                  accessibilityState={accessibilityState}
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
            name="Weather"
            component={WeatherStackScreen}
            options={{
              tabBarAccessibilityLabel: `${t('navigation:weather')}, 1 ${t(
                'navigation:slash'
              )} 4 `,
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
            name="Map"
            component={MapStackScreen}
            options={{
              tabBarAccessibilityLabel: `${t('navigation:map')}, 2 ${t(
                'navigation:slash'
              )} 4`,
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
            name="Warnings"
            component={WarningsStackScreen}
            options={{
              tabBarAccessibilityLabel: `${t('navigation:warnings')}, 3 ${t(
                'navigation:slash'
              )} 4`,
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
              tabBarAccessibilityLabel: `${t('navigation:others')}, 4 ${t(
                'navigation:slash'
              )} 4`,
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
    elevation: 8,
  },
});

export default connector(Navigator);
