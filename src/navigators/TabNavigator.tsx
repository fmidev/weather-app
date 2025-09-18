/* eslint-disable react/no-unstable-nested-components */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Appearance,
  Platform,
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
import { LaunchArguments } from 'react-native-launch-arguments';

import OthersScreen from '@screens/OthersScreen';
import MapScreen from '@screens/MapScreen';
import WeatherScreen from '@screens/WeatherScreen';
import FeedbackScreen from '@screens/FeedbackScreen';
import SettingsScreen from '@screens/SettingsScreen';
import SearchScreen from '@screens/SearchScreen';
import AboutScreen from '@screens/AboutScreen';
import AccessibilityScreen from '@screens/AccessibilityScreen';
import WarningsScreen from '@screens/WarningsScreen';
import SetupScreen from '@screens/SetupScreen';
import OnboardingScreen from '@screens/OnboardingScreen';

import SearchInfoBottomSheet from '@components/search/SearchInfoBottomSheet';

import Icon from '@assets/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import HeaderButton from '@components/common/HeaderButton';
import CommonHeaderTitle from '@components/common/CommonHeaderTitle';
import HeaderIcon from '@components/common/HeaderIcon';

import { State } from '@store/types';
import { selectTheme } from '@store/settings/selectors';
import { setCurrentLocation as setCurrentLocationAction } from '@store/location/actions';
import { fetchAnnouncements as fetchAnnouncementsAction } from '@store/announcements/actions';
import { getGeolocation } from '@utils/helpers';
import {
  PRIMARY_BLUE,
  WHITE,
  HEADER_DARK,
  GRAY_1,
  TRANSPARENT,
  SHADOW_DARK,
  SHADOW_LIGHT,
} from '@assets/colors';
import {
  selectInitialTab,
  selectDidLaunchApp,
  selectTermsOfUseAccepted,
} from '@store/navigation/selectors';
import {
  setNavigationTab as setNavigationTabAction,
  setDidLaunchApp as setDidLaunchAppAction,
} from '@store/navigation/actions';
import { NavigationTabValues, NavigationTab } from '@store/navigation/types';
import TermsAndConditionsScreen from '@screens/TermsAndConditionsScreen';
import ErrorComponent from '@components/common/ErrorComponent';

import { Config } from '@config';
import { lightTheme, darkTheme } from '../assets/themes';
import {
  TabParamList,
  OthersStackParamList,
  MapStackParamList,
  WeatherStackParamList,
  LaunchArgs,
} from './types';
import WarningsTabIcon from './WarningsTabIcon';

const mapStateToProps = (state: State) => ({
  initialTab: selectInitialTab(state),
  theme: selectTheme(state),
  didLaunchApp: selectDidLaunchApp(state),
  termsOfUseAccepted: selectTermsOfUseAccepted(state),
});

const mapDispatchToProps = {
  setCurrentLocation: setCurrentLocationAction,
  setNavigationTab: setNavigationTabAction,
  setDidLaunchApp: setDidLaunchAppAction,
  fetchAnnouncements: fetchAnnouncementsAction,
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
  termsOfUseAccepted,
  setDidLaunchApp,
  fetchAnnouncements,
}) => {
  const { t, ready, i18n } = useTranslation(['navigation', 'setUp'], {
    useSuspense: false,
  });
  const searchInfoSheetRef = useRef() as React.MutableRefObject<RBSheet>;
  const isDark = (currentTheme: string | undefined): boolean =>
    currentTheme === 'dark' ||
    ((!currentTheme || currentTheme === 'automatic') &&
      Appearance.getColorScheme() === 'dark');

  const warningsEnabled = Config.get('warnings').enabled;
  const onboardingWizardEnabled = Config.get('onboardingWizard').enabled;
  const weatherLayout = Config.get('weather').layout;
  const [useDarkTheme, setUseDarkTheme] = useState<boolean>(isDark(theme));
  const [didChangeLanguage, setDidChangeLanguage] = useState<boolean>(false);
  const [warningsSeverity, setWarningsSeverity] = useState<number>(0);

  const launchArgs = LaunchArguments.value<LaunchArgs>();

  const handleLanguageChanged = useCallback(() => {
    setDidChangeLanguage(true);
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  useEffect(() => {
    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [handleLanguageChanged, i18n]);

  useEffect(() => {
    if (didLaunchApp && !didChangeLanguage) {
      getGeolocation(setCurrentLocation, t, true);
      fetchAnnouncements();
    }
  }, [
    didLaunchApp,
    setCurrentLocation,
    t,
    didChangeLanguage,
    fetchAnnouncements,
  ]);


  const navigationTabChanged = (state: NavigationState | undefined) => {
    const navigationTab = state?.routeNames[state?.index] as NavigationTab;
    if (Number.isInteger(NavigationTabValues[navigationTab])) {
      setNavigationTab(navigationTab);
    }
  };

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setUseDarkTheme(isDark(colorScheme || undefined));
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (theme !== 'automatic') {
      setUseDarkTheme(isDark(theme));
    }
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
    headerBackTestID: 'header-back',
    headerTintColor: useDarkTheme ? WHITE : PRIMARY_BLUE,
    headerTitleStyle: {
      fontFamily: 'Roboto-Bold',
    },
    headerStyle: {
      ...styles.header,
      shadowColor:
        useDarkTheme || Platform.OS === 'android' ? SHADOW_DARK : SHADOW_LIGHT,
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
        testID="search_header_button"
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
    path: 'search',
    headerBackTitleVisible: false,
    headerTitle: t('navigation:search'),
    headerRight: () => (
      <HeaderButton
        testID="search_header_info_button"
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
        options={ weatherLayout === 'fmi' ? { headerShown: false } : LocationHeaderOptions }
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
          ...CommonHeaderOptions,
          headerTitle: () => <HeaderIcon />,
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
        name="Accessibility"
        component={AccessibilityScreen}
        options={{
          ...CommonHeaderOptions,
          headerTitle: `${t('navigation:accessibility')}`,
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
    <SetupStack.Navigator
      initialRouteName={ didLaunchApp && !termsOfUseAccepted ? 'SetupScreen' : 'Onboarding' }
      screenOptions={{ gestureEnabled: false }}>
      <SetupStack.Screen
        name="Onboarding"
        options={{ headerShown: false }}
        component={OnboardingScreen}
      />
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
            termsOfUseChanged={ !termsOfUseAccepted }
          />
        )}
      </SetupStack.Screen>
      <SetupStack.Screen
        name="TermsAndConditions"
        options={{
          ...CommonHeaderOptions,
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

  if ((!didLaunchApp || !termsOfUseAccepted) && onboardingWizardEnabled && launchArgs?.e2e !== true) {
    return (
      <NavigationContainer theme={useDarkTheme ? darkTheme : lightTheme}>
        <SetupStackScreen />
      </NavigationContainer>
    );
  }

  const linking = {
    prefixes: ['fmiweather://'],
    config: {
      screens: {
        Weather: {
          screens: {
            Search: 'search',
          },
        },
      },
    },
  };

  return (
    <>
      <StatusBar
        backgroundColor={useDarkTheme ? HEADER_DARK : WHITE}
        barStyle={useDarkTheme ? 'light-content' : 'dark-content'}
      />
      <NavigationContainer
        onStateChange={navigationTabChanged}
        theme={useDarkTheme ? darkTheme : lightTheme}
        /*
        // @ts-ignore */
        linking={linking}>
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
          {warningsEnabled && (
            <Tab.Screen
              name="Warnings"
              component={WarningsStackScreen}
              options={{
                tabBarAccessibilityLabel: `${t('navigation:warnings')}, 3 ${t(
                  'navigation:slash'
                )} 4, ${t(
                  warningsSeverity > 0
                    ? 'warnings:hasWarnings'
                    : 'warnings:noWarnings'
                )}`,
                headerShown: false,
                tabBarTestID: 'navigation_warnings',
                tabBarLabel: `${t('navigation:warnings')}`,
                tabBarIcon: ({ color, size }) => (
                  <WarningsTabIcon
                    color={color}
                    size={size}
                    updateWarningsSeverity={setWarningsSeverity}
                  />
                ),
              }}
            />
          )}
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
        <ErrorComponent />
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
