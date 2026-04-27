import React from 'react';
import { render } from '@testing-library/react-native';

import MapStackScreen from '../../src/navigators/stacks/MapStackScreen';
import WeatherStackScreen from '../../src/navigators/stacks/WeatherStackScreen';
import WarningsStackScreen from '../../src/navigators/stacks/WarningsStackScreen';
import OthersStackScreen from '../../src/navigators/stacks/OthersStackScreen';
import SetupStackScreen from '../../src/navigators/stacks/SetupStackScreen';

const mockStackScreens = jest.fn();
const mockHeaderTitle = jest.fn();
const mockSetupScreen = jest.fn();
const mockTermsAndConditionsScreen = jest.fn();

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/navigation/selectors', () => ({
  selectDidLaunchApp: jest.fn(),
  selectTermsOfUseAccepted: jest.fn(),
}));

jest.mock('@store/navigation/actions', () => ({
  setDidLaunchApp: jest.fn(() => ({ type: 'SET_DID_LAUNCH_APP' })),
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => {
    const { View, Text } = require('react-native');
    return {
      Navigator: ({ children, initialRouteName, screenOptions }: any) => (
        <View
          testID="stack-navigator"
          data-initial-route={initialRouteName}
          data-gesture-enabled={screenOptions?.gestureEnabled}>
          {initialRouteName ? <Text>{`initial:${initialRouteName}`}</Text> : null}
          {children}
        </View>
      ),
      Screen: (props: any) => {
        mockStackScreens(props);
        const headerTitle =
          typeof props.options?.headerTitle === 'function'
            ? props.options.headerTitle()
            : null;
        const renderedChildren =
          typeof props.children === 'function'
            ? props.children({ navigation: { goBack: jest.fn() } })
            : null;
        return (
          <View testID={`stack-screen-${props.name}`}>
            <Text>{props.name}</Text>
            {headerTitle}
            {renderedChildren}
            {props.initialParams ? (
              <Text>{`initialParams:${JSON.stringify(props.initialParams)}`}</Text>
            ) : null}
          </View>
        );
      },
    };
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@components/common/HeaderIcon', () => ({
  __esModule: true,
  default: () => {
    const { Text } = require('react-native');
    return <Text testID="header-icon">icon</Text>;
  },
}));

jest.mock('@components/common/HeaderTitle', () => ({
  __esModule: true,
  default: (props: any) => {
    mockHeaderTitle(props);
    const { Text } = require('react-native');
    return <Text testID={`header-title-${props.title}`}>{props.title}</Text>;
  },
}));

jest.mock('@screens/MapScreen', () => 'MapScreen');
jest.mock('@screens/SearchScreen', () => 'SearchScreen');
jest.mock('@screens/WeatherScreen', () => 'WeatherScreen');
jest.mock('@screens/WarningsScreen', () => 'WarningsScreen');
jest.mock('@screens/OthersScreen', () => 'OthersScreen');
jest.mock('@screens/AboutScreen', () => 'AboutScreen');
jest.mock('@screens/SettingsScreen', () => 'SettingsScreen');
jest.mock('@screens/AccessibilityScreen', () => 'AccessibilityScreen');
jest.mock('@screens/FeedbackScreen', () => 'FeedbackScreen');
jest.mock('@screens/OnboardingScreen', () => 'OnboardingScreen');
jest.mock('@screens/SetupScreen', () => ({
  __esModule: true,
  default: (props: any) => {
    mockSetupScreen(props);
    const { Text } = require('react-native');
    return <Text testID="setup-screen">setup</Text>;
  },
}));
jest.mock('@screens/TermsAndConditionsScreen', () => ({
  __esModule: true,
  default: (props: any) => {
    mockTermsAndConditionsScreen(props);
    const { Text } = require('react-native');
    return <Text testID="terms-screen">terms</Text>;
  },
}));

describe('navigator stack screens', () => {
  beforeEach(() => {
    mockStackScreens.mockClear();
    mockHeaderTitle.mockClear();
    mockSetupScreen.mockClear();
    mockTermsAndConditionsScreen.mockClear();
  });

  it('renders map stack with map and search screens', () => {
    render(
      <MapStackScreen
        mapOptions={{ title: 'map' } as any}
        searchOptions={{ title: 'search' } as any}
        stackScreenListener={jest.fn() as any}
      />
    );

    expect(mockStackScreens).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'StackMap', options: { title: 'map' } })
    );
    expect(mockStackScreens).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Search', options: { title: 'search' } })
    );
  });

  it('renders weather and warnings stacks with search screen', () => {
    render(
      <>
        <WeatherStackScreen
          weatherOptions={{ title: 'weather' } as any}
          searchOptions={{ title: 'search' } as any}
          stackScreenListener={jest.fn() as any}
        />
        <WarningsStackScreen
          warningsOptions={{ title: 'warnings' } as any}
          searchOptions={{ title: 'search' } as any}
          stackScreenListener={jest.fn() as any}
        />
      </>
    );

    expect(mockStackScreens).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'StackWeather' })
    );
    expect(mockStackScreens).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'StackWarnings',
        initialParams: { day: 0 },
      })
    );
  });

  it('renders others stack titles using translations', () => {
    const view = render(
      <OthersStackScreen
        commonHeaderOptions={{ headerTintColor: 'blue' } as any}
        useDarkTheme
        stackScreenListener={jest.fn() as any}
      />
    );

    expect(view.getByTestId('header-icon')).toBeTruthy();
    expect(view.getByTestId('header-title-navigation:about')).toBeTruthy();
    expect(view.getByTestId('header-title-navigation:settings')).toBeTruthy();
    expect(mockHeaderTitle).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'navigation:about',
        isDark: true,
      })
    );
  });

  it('renders setup stack and passes setup props', () => {
    const setDidLaunchApp = jest.fn();
    const view = render(
      <SetupStackScreen
        didLaunchApp
        termsOfUseAccepted={false}
        setDidLaunchApp={setDidLaunchApp}
        commonHeaderOptions={{ headerTintColor: 'blue' } as any}
        useDarkTheme={false}
      />
    );

    expect(view.getByText('initial:SetupScreen')).toBeTruthy();
    expect(mockSetupScreen).toHaveBeenCalledWith(
      expect.objectContaining({
        setUpDone: setDidLaunchApp,
        termsOfUseChanged: true,
      })
    );
    expect(mockTermsAndConditionsScreen).toHaveBeenCalledWith(
      expect.objectContaining({
        showCloseButton: true,
      })
    );
    expect(view.getByTestId('header-title-setUp:termsAndConditions')).toBeTruthy();
  });
});
