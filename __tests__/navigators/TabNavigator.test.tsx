import React from 'react';
import { Appearance, AppState } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

import TabNavigator from '../../src/navigators/TabNavigator';
import { MacContentSizeProvider } from '../../src/components/common/MacContentSizeContext';
import { sendMatomoEvents } from '@utils/matomo';

const originalAppState = AppState.currentState;
const mockConfigGet = jest.fn();
const mockFetchAnnouncements = jest.fn();
const mockGetGeolocation = jest.fn();
const mockI18nOn = jest.fn();
const mockI18nOff = jest.fn();
const mockLaunchArgumentsValue = jest.fn();
const mockNavigationDispatch = jest.fn();
const mockRBSheetClose = jest.fn();
const mockRBSheetOpen = jest.fn();
const mockSetCurrentLocation = jest.fn();
const mockSetNavigationTab = jest.fn();
const mockTabScreens = jest.fn();
const mockTrackMatomoEvent = jest.fn();
const mockSetNavigationBarTheme = jest.fn();
const mockWarningsTabIcon = jest.fn();
const mockWeatherStack = jest.fn();
const mockMapStack = jest.fn();
const mockWarningsStack = jest.fn();
let mockTranslationReady = true;
let mockVerticalBarLayout = false;

jest.mock('@utils/hooks', () => ({
  ...jest.requireActual('@utils/hooks'),
  usesVerticalBarLayout: () => mockVerticalBarLayout,
}));

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/settings/selectors', () => ({
  selectTheme: jest.fn(),
}));

jest.mock('@store/location/actions', () => ({
  setCurrentLocation: jest.fn(() => ({ type: 'SET_CURRENT_LOCATION' })),
}));

jest.mock('@store/announcements/actions', () => ({
  fetchAnnouncements: jest.fn(() => ({ type: 'FETCH_ANNOUNCEMENTS' })),
}));

jest.mock('@store/navigation/selectors', () => ({
  selectInitialTab: jest.fn(),
  selectDidLaunchApp: jest.fn(),
  selectTermsOfUseAccepted: jest.fn(),
}));

jest.mock('@store/navigation/actions', () => ({
  setNavigationTab: jest.fn((tab: string) => ({
    type: 'SET_NAVIGATION_TAB',
    payload: tab,
  })),
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('react-native-launch-arguments', () => ({
  LaunchArguments: {
    value: (...args: any[]) => mockLaunchArgumentsValue(...args),
  },
}));

jest.mock('@react-navigation/native', () => {
  const ReactActual = require('react');
  return {
    CommonActions: {
      navigate: (name: string) => ({ type: 'NAVIGATE', payload: { name } }),
    },
    NavigationContainer: ({ children, onReady, onStateChange, theme }: any) => {
      const didCallReady = ReactActual.useRef(false);
      ReactActual.useEffect(() => {
        if (!didCallReady.current) {
          didCallReady.current = true;
          onReady?.();
        }
      }, []);
      const { Pressable, Text, View } = require('react-native');
      return (
        <View testID="navigation-container" data-theme-dark={theme?.dark}>
          <Pressable
            testID="navigation-state-change"
            onPress={() =>
              onStateChange?.({
                index: 1,
                routeNames: ['Weather', 'Map', 'Warnings', 'Others'],
              })
            }>
            <Text>state</Text>
          </Pressable>
          {children}
        </View>
      );
    },
    useNavigationContainerRef: () => ({
      getCurrentRoute: () => ({ name: 'Weather' }),
      navigate: jest.fn(),
      dispatch: mockNavigationDispatch,
    }),
  };
});

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => {
    const { Pressable, Text, View } = require('react-native');
    return {
      Navigator: ({ children, initialRouteName }: any) => (
        <View testID="tab-navigator">
          <Text>{`initial:${initialRouteName}`}</Text>
          {children}
        </View>
      ),
      Screen: (props: any) => {
        mockTabScreens(props);
        const icon = props.options?.tabBarIcon?.({
          color: '#123456',
          size: 24,
        });
        const content =
          typeof props.children === 'function' ? props.children() : null;
        return (
          <Pressable
            testID={props.options?.tabBarButtonTestID || `tab-${props.name}`}
            accessibilityLabel={props.options?.tabBarAccessibilityLabel}
            onPress={() => props.listeners?.tabPress?.()}>
            <Text>{props.name}</Text>
            {icon}
            {content}
          </Pressable>
        );
      },
    };
  },
}));

jest.mock('react-native-raw-bottom-sheet', () => {
  const ReactActual = require('react');
  return {
    __esModule: true,
    default: ReactActual.forwardRef(({ children }: any, ref: any) => {
      ReactActual.useImperativeHandle(ref, () => ({
        close: mockRBSheetClose,
        open: mockRBSheetOpen,
      }));
      const { View } = require('react-native');
      return <View testID="search-info-rbsheet">{children}</View>;
    }),
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    ready: mockTranslationReady,
    t: (key: string) => key,
    i18n: {
      on: (...args: any[]) => mockI18nOn(...args),
      off: (...args: any[]) => mockI18nOff(...args),
    },
  }),
}));

jest.mock('@utils/helpers', () => ({
  getGeolocation: (...args: any[]) => mockGetGeolocation(...args),
}));

jest.mock('@utils/matomo', () => ({
  sendMatomoEvents: jest.fn(),
  trackMatomoEvent: (...args: any[]) => mockTrackMatomoEvent(...args),
}));

jest.mock('@utils/navigationBar', () => ({
  setNavigationBarTheme: (...args: any[]) => mockSetNavigationBarTheme(...args),
}));

jest.mock('@components/common/ScalableIcon', () => ({
  __esModule: true,
  default: ({ name }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

jest.mock('@components/common/AccessibleTouchableOpacity', () => ({
  __esModule: true,
  default: ({ children, onPress, ...props }: any) => {
    const { Pressable } = require('react-native');
    return (
      <Pressable onPress={onPress} {...props}>
        {children}
      </Pressable>
    );
  },
}));

jest.mock('@components/common/HeaderButton', () => ({
  __esModule: true,
  default: ({ icon, onPress, testID, accessibilityLabel, accessibilityHint }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable
        testID={testID || `header-button-${icon}`}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        onPress={onPress}>
        <Text>{icon}</Text>
      </Pressable>
    );
  },
}));

jest.mock('@components/common/CommonHeaderTitle', () => ({
  __esModule: true,
  default: () => {
    const { Text } = require('react-native');
    return <Text testID="common-header-title">location</Text>;
  },
}));

jest.mock('@components/announcements/AnnouncementsHeader', () => ({
  __esModule: true,
  default: () => {
    const { Text } = require('react-native');
    return <Text testID="announcements-header">announcements</Text>;
  },
}));

jest.mock('@components/common/HeaderBackImage', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@components/common/HeaderTitle', () => ({
  __esModule: true,
  default: ({ title }: any) => {
    const { Text } = require('react-native');
    return <Text>{title}</Text>;
  },
}));

jest.mock('@components/common/ErrorComponent', () => ({
  __esModule: true,
  default: ({ navReady, currentRoute }: any) => {
    const { Text } = require('react-native');
    return (
      <Text testID="error-component">
        {`${navReady}-${currentRoute?.name || 'none'}`}
      </Text>
    );
  },
}));

jest.mock('@components/search/SearchInfoBottomSheet', () => ({
  __esModule: true,
  default: ({ onClose }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable testID="search-info-sheet" onPress={onClose}>
        <Text>search info</Text>
      </Pressable>
    );
  },
}));

jest.mock('../../src/navigators/stacks/MapStackScreen', () => ({
  __esModule: true,
  default: (props: any) => {
    mockMapStack(props);
    const { Text } = require('react-native');
    return <Text testID="map-stack">map</Text>;
  },
}));

jest.mock('../../src/navigators/stacks/WeatherStackScreen', () => ({
  __esModule: true,
  default: (props: any) => {
    mockWeatherStack(props);
    const { Text } = require('react-native');
    return <Text testID="weather-stack">weather</Text>;
  },
}));

jest.mock('../../src/navigators/stacks/WarningsStackScreen', () => ({
  __esModule: true,
  default: (props: any) => {
    mockWarningsStack(props);
    const { Text } = require('react-native');
    return <Text testID="warnings-stack">warnings</Text>;
  },
}));

jest.mock('../../src/navigators/stacks/OthersStackScreen', () => ({
  __esModule: true,
  default: () => {
    const { Text } = require('react-native');
    return <Text testID="others-stack">others</Text>;
  },
}));

jest.mock('../../src/navigators/stacks/SetupStackScreen', () => ({
  __esModule: true,
  default: () => {
    const { Text } = require('react-native');
    return <Text testID="setup-stack">setup</Text>;
  },
}));

jest.mock('../../src/navigators/WarningsTabIcon', () => ({
  __esModule: true,
  default: function WarningsTabIconMock(props: any) {
    const ReactActual = require('react');
    mockWarningsTabIcon(props);
    ReactActual.useEffect(() => {
      props.updateWarningsSeverity(2);
    }, [props]);
    const { Text } = require('react-native');
    return <Text testID="warnings-tab-icon">warnings icon</Text>;
  },
}));

describe('TabNavigator', () => {
  beforeEach(() => {
    mockVerticalBarLayout = false;
    mockConfigGet.mockReset();
    mockFetchAnnouncements.mockClear();
    mockGetGeolocation.mockClear();
    mockI18nOn.mockClear();
    mockI18nOff.mockClear();
    mockLaunchArgumentsValue.mockReset();
    mockNavigationDispatch.mockClear();
    mockRBSheetClose.mockClear();
    mockRBSheetOpen.mockClear();
    mockSetCurrentLocation.mockClear();
    mockSetNavigationTab.mockClear();
    mockTabScreens.mockClear();
    mockTrackMatomoEvent.mockClear();
    mockSetNavigationBarTheme.mockClear();
    mockWarningsTabIcon.mockClear();
    mockWeatherStack.mockClear();
    mockMapStack.mockClear();
    mockWarningsStack.mockClear();
    jest.mocked(sendMatomoEvents).mockClear();
    mockTranslationReady = true;

    mockLaunchArgumentsValue.mockReturnValue({});
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'warnings') return { enabled: true };
      if (key === 'onboardingWizard') return { enabled: true };
      if (key === 'weather') return { layout: 'default' };
      return {};
    });
  });

  afterEach(() => {
    AppState.currentState = originalAppState;
    jest.restoreAllMocks();
  });

  it.each([null, undefined])('handles an initial app state of %s before backgrounding', (initialState) => {
    AppState.currentState = initialState;
    const listenerSpy = jest.spyOn(AppState, 'addEventListener');
    render(
      <TabNavigator
        initialTab="Weather"
        theme="light"
        didLaunchApp={false}
        termsOfUseAccepted={false}
        setCurrentLocation={mockSetCurrentLocation}
        setNavigationTab={mockSetNavigationTab}
        fetchAnnouncements={mockFetchAnnouncements}
      />
    );
    const listener = listenerSpy.mock.calls.find(([event]) => event === 'change')?.[1];
    expect(listener).toBeDefined();

    act(() => listener?.('background'));
    expect(sendMatomoEvents).not.toHaveBeenCalled();

    act(() => {
      listener?.('active');
      listener?.('background');
    });
    expect(sendMatomoEvents).toHaveBeenCalledTimes(1);
  });

  it('updates navigation bar icons when the app theme changes', () => {
    jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('dark');
    const props = {
      initialTab: 'Weather',
      didLaunchApp: false,
      termsOfUseAccepted: false,
      setCurrentLocation: mockSetCurrentLocation,
      setNavigationTab: mockSetNavigationTab,
      fetchAnnouncements: mockFetchAnnouncements,
    };
    const view = render(<TabNavigator {...props} theme="light" />);
    expect(mockSetNavigationBarTheme).toHaveBeenLastCalledWith(false);

    view.rerender(<TabNavigator {...props} theme="dark" />);
    expect(mockSetNavigationBarTheme).toHaveBeenLastCalledWith(true);

    view.rerender(<TabNavigator {...props} theme="light" />);
    expect(mockSetNavigationBarTheme).toHaveBeenLastCalledWith(false);
  });

  it.each(['light', 'dark'] as const)('uses Android header colors for native buttons in the %s theme', (theme) => {
    mockVerticalBarLayout = true;
    render(
      <TabNavigator
        initialTab="Map"
        theme={theme}
        didLaunchApp
        termsOfUseAccepted
        setCurrentLocation={mockSetCurrentLocation as any}
        setNavigationTab={mockSetNavigationTab as any}
        fetchAnnouncements={mockFetchAnnouncements as any}
      />
    );
    const expectedColor = (theme === 'dark' ? darkTheme : lightTheme).colors.text;
    const options = [
      mockMapStack.mock.calls.at(-1)![0].nativeMapOptions,
      mockWeatherStack.mock.calls.at(-1)![0].nativeWeatherOptions,
      mockWarningsStack.mock.calls.at(-1)![0].nativeWarningsOptions,
      mockWeatherStack.mock.calls.at(-1)![0].nativeSearchOptions,
    ];
    options.forEach((header) => {
      const props = { tintColor: header.headerTintColor };
      const items = [
        ...(header.unstable_headerLeftItems?.(props) ?? []),
        ...(header.unstable_headerRightItems?.(props) ?? []),
      ];
      expect(items.length).toBeGreaterThan(0);
      expect(items.every((item: any) => item.tintColor === expectedColor)).toBe(true);
    });
  });

  it('updates navigation bar icons with the system theme in automatic mode', () => {
    jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('light');
    const listenerSpy = jest.spyOn(Appearance, 'addChangeListener');
    render(
      <TabNavigator
        initialTab="Weather"
        theme="automatic"
        didLaunchApp={false}
        termsOfUseAccepted={false}
        setCurrentLocation={mockSetCurrentLocation as any}
        setNavigationTab={mockSetNavigationTab as any}
        fetchAnnouncements={mockFetchAnnouncements as any}
      />
    );
    expect(mockSetNavigationBarTheme).toHaveBeenLastCalledWith(false);

    act(() => {
      listenerSpy.mock.calls[0][0]({ colorScheme: 'dark' });
    });
    expect(mockSetNavigationBarTheme).toHaveBeenLastCalledWith(true);

    act(() => {
      listenerSpy.mock.calls[0][0]({ colorScheme: 'light' });
    });
    expect(mockSetNavigationBarTheme).toHaveBeenLastCalledWith(false);
  });

  it('returns null while translations or theme are not ready', () => {
    mockTranslationReady = false;

    const view = render(
      <TabNavigator
        initialTab="Weather"
        theme="light"
        didLaunchApp
        termsOfUseAccepted
        setCurrentLocation={mockSetCurrentLocation as any}
        setNavigationTab={mockSetNavigationTab as any}
        fetchAnnouncements={mockFetchAnnouncements as any}
      />
    );

    expect(view.toJSON()).toBeNull();
  });

  it('renders setup stack before onboarding is completed', () => {
    const view = render(
      <TabNavigator
        initialTab="Weather"
        theme="light"
        didLaunchApp={false}
        termsOfUseAccepted={false}
        setCurrentLocation={mockSetCurrentLocation as any}
        setNavigationTab={mockSetNavigationTab as any}
        fetchAnnouncements={mockFetchAnnouncements as any}
      />
    );

    expect(view.getByTestId('navigation-container')).toBeTruthy();
    expect(view.getByTestId('setup-stack')).toBeTruthy();
    expect(view.queryByTestId('tab-navigator')).toBeNull();
  });

  it('renders tabs, runs launch effects and tracks tab presses', () => {
    const view = render(
      <TabNavigator
        initialTab="Map"
        theme="light"
        didLaunchApp
        termsOfUseAccepted
        setCurrentLocation={mockSetCurrentLocation as any}
        setNavigationTab={mockSetNavigationTab as any}
        fetchAnnouncements={mockFetchAnnouncements as any}
      />
    );

    expect(view.getByTestId('tab-navigator')).toBeTruthy();
    expect(view.getByText('initial:Map')).toBeTruthy();
    expect(view.getByTestId('weather-stack')).toBeTruthy();
    expect(view.getByTestId('map-stack')).toBeTruthy();
    expect(view.getByTestId('warnings-stack')).toBeTruthy();
    expect(view.getByTestId('others-stack')).toBeTruthy();
    expect(mockGetGeolocation).toHaveBeenCalledWith(
      mockSetCurrentLocation,
      expect.any(Function),
      true
    );
    expect(mockFetchAnnouncements).toHaveBeenCalled();
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'Init',
      'Platform',
      expect.stringMatching(/^ios - /)
    );
    expect(mockI18nOn).toHaveBeenCalledWith(
      'languageChanged',
      expect.any(Function)
    );

    fireEvent.press(view.getByTestId('navigation_weather'));
    fireEvent.press(view.getByTestId('navigation_map'));
    fireEvent.press(view.getByTestId('navigation_warnings'));
    fireEvent.press(view.getByTestId('navigation_others'));

    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Navigation',
      'Weather'
    );
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Navigation',
      'Map'
    );
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Navigation',
      'Warnings'
    );
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Navigation',
      'Others'
    );

    fireEvent.press(view.getByTestId('navigation-state-change'));
    expect(mockSetNavigationTab).toHaveBeenCalledWith('Map');

    fireEvent.press(view.getByTestId('search-info-sheet'));
    expect(mockRBSheetClose).toHaveBeenCalledTimes(1);
  });

  it.each([false, true])('places map location actions for vertical bar layout %s', (verticalBarLayout) => {
    mockVerticalBarLayout = verticalBarLayout;
    render(
      <TabNavigator
        initialTab="Map"
        theme="light"
        didLaunchApp
        termsOfUseAccepted
        setCurrentLocation={mockSetCurrentLocation as any}
        setNavigationTab={mockSetNavigationTab as any}
        fetchAnnouncements={mockFetchAnnouncements as any}
      />
    );
    const { nativeMapOptions, nativeSearchOptions } = mockMapStack.mock.calls[0][0];
    expect(nativeMapOptions.headerShown).toBe(true);
    expect(nativeMapOptions.header).toBeUndefined();
    expect(nativeMapOptions.headerTitle).toEqual(expect.any(Function));
    expect(nativeSearchOptions.title).toBe('navigation:search');
    const leftItems = nativeMapOptions.unstable_headerLeftItems({});
    const rightItems = nativeMapOptions.unstable_headerRightItems?.({}) ?? [];
    expect(leftItems).toHaveLength(verticalBarLayout ? 2 : 1);
    expect(rightItems).toHaveLength(verticalBarLayout ? 0 : 1);
    const [locate, search] = [...leftItems, ...rightItems];
    mockGetGeolocation.mockClear();
    act(() => locate.onPress());
    expect(mockGetGeolocation).toHaveBeenCalledWith(mockSetCurrentLocation, expect.any(Function));
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith('User action', 'Map', 'Geolocation');
    act(() => search.onPress());
    expect(mockNavigationDispatch).toHaveBeenCalledWith({ type: 'NAVIGATE', payload: { name: 'Search' } });
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith('User action', 'Map', 'Open search - button');
  });

  it.each([false, true])('places warning location actions for vertical bar layout %s', (verticalBarLayout) => {
    mockVerticalBarLayout = verticalBarLayout;
    render(
      <TabNavigator
        initialTab="Warnings"
        theme="light"
        didLaunchApp
        termsOfUseAccepted
        setCurrentLocation={mockSetCurrentLocation as any}
        setNavigationTab={mockSetNavigationTab as any}
        fetchAnnouncements={mockFetchAnnouncements as any}
      />
    );
    const { warningsOptions, nativeWarningsOptions, nativeSearchOptions } = mockWarningsStack.mock.calls[0][0];
    expect(warningsOptions.header).toEqual(expect.any(Function));
    expect(nativeWarningsOptions.header).toBeUndefined();
    expect(nativeWarningsOptions.headerShown).toBe(true);
    expect(nativeWarningsOptions.headerTitle).toEqual(expect.any(Function));
    expect(nativeSearchOptions.title).toBe('navigation:search');
    const leftItems = nativeWarningsOptions.unstable_headerLeftItems?.({}) ?? [];
    const rightItems = nativeWarningsOptions.unstable_headerRightItems({});
    expect(leftItems).toHaveLength(verticalBarLayout ? 0 : 1);
    expect(rightItems).toHaveLength(verticalBarLayout ? 2 : 1);
    const [locate, search] = [...leftItems, ...rightItems];
    expect(locate).toEqual(expect.objectContaining({
      type: 'button',
      accessibilityLabel: 'navigation:locate',
      accessibilityHint: 'navigation:locateAccessibilityLabel',
      icon: { type: 'sfSymbol', name: 'dot.scope' },
    }));
    expect(search).toEqual(expect.objectContaining({
      type: 'button',
      accessibilityLabel: 'navigation:search',
      accessibilityHint: 'navigation:searchAccessibilityLabel',
      icon: { type: 'sfSymbol', name: 'magnifyingglass' },
    }));
    mockGetGeolocation.mockClear();
    act(() => locate.onPress());
    expect(mockGetGeolocation).toHaveBeenCalledWith(mockSetCurrentLocation, expect.any(Function));
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith('User action', 'Warnings', 'Geolocation');
    act(() => search.onPress());
    expect(mockNavigationDispatch).toHaveBeenCalledWith({ type: 'NAVIGATE', payload: { name: 'Search' } });
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith('User action', 'Warnings', 'Open search - button');
  });

  it.each(['default', 'vertical'])('provides native weather buttons without adding a JS header in the %s layout', (layout) => {
    mockVerticalBarLayout = true;
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'weather') return { layout };
      return { enabled: true };
    });
    render(
      <TabNavigator
        initialTab="Weather"
        theme="light"
        didLaunchApp
        termsOfUseAccepted
        setCurrentLocation={mockSetCurrentLocation as any}
        setNavigationTab={mockSetNavigationTab as any}
        fetchAnnouncements={mockFetchAnnouncements as any}
      />
    );
    const { weatherOptions, nativeWeatherOptions, nativeSearchOptions } = mockWeatherStack.mock.calls[0][0];
    expect(weatherOptions.headerShown).toBe(layout === 'vertical' ? false : undefined);
    expect(nativeWeatherOptions.headerShown).toBe(true);
    expect(nativeWeatherOptions.headerTransparent).toBe(layout === 'vertical');
    expect(typeof nativeWeatherOptions.headerTitle).toBe(layout === 'vertical' ? 'undefined' : 'function');
    expect(nativeWeatherOptions.headerRight).toBeUndefined();

    const [locate, search] = nativeWeatherOptions.unstable_headerRightItems({});
    expect(locate).toEqual(expect.objectContaining({
      type: 'button',
      icon: { type: 'sfSymbol', name: 'dot.scope' },
      label: 'navigation:locate',
      accessibilityLabel: 'navigation:locate',
      accessibilityHint: 'navigation:locateAccessibilityLabel',
    }));
    expect(search).toEqual(expect.objectContaining({
      type: 'button',
      icon: { type: 'sfSymbol', name: 'magnifyingglass' },
      label: 'navigation:search',
      accessibilityLabel: 'navigation:search',
      accessibilityHint: 'navigation:searchAccessibilityLabel',
    }));

    mockGetGeolocation.mockClear();
    act(() => locate.onPress());
    expect(mockGetGeolocation).toHaveBeenCalledTimes(1);
    expect(mockGetGeolocation).toHaveBeenCalledWith(mockSetCurrentLocation, expect.any(Function));
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith('User action', 'Weather', 'Geolocation');

    act(() => search.onPress());
    expect(mockNavigationDispatch).toHaveBeenCalledWith({
      type: 'NAVIGATE',
      payload: { name: 'Search' },
    });
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith('User action', 'Weather', 'Open search - button');

    const [info] = nativeSearchOptions.unstable_headerRightItems({});
    act(() => info.onPress());
    expect(mockRBSheetOpen).toHaveBeenCalledTimes(1);
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith('User action', 'Search', 'Open search info bottomsheet');
  });

  it.each(['default', 'vertical'])('shows native weather actions only with the sidebar in the %s layout', (layout) => {
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'weather') return { layout };
      return { enabled: true };
    });
    const navigator = (
      <TabNavigator
        initialTab="Weather"
        theme="light"
        didLaunchApp
        termsOfUseAccepted
        setCurrentLocation={mockSetCurrentLocation as any}
        setNavigationTab={mockSetNavigationTab as any}
        fetchAnnouncements={mockFetchAnnouncements as any}
      />
    );
    const view = render(navigator);
    const weatherOptions = () => mockWeatherStack.mock.calls.at(-1)![0].nativeWeatherOptions;
    expect(weatherOptions().unstable_headerRightItems).toBeUndefined();
    expect(weatherOptions().headerShown).toBe(layout !== 'vertical');

    mockVerticalBarLayout = true;
    view.rerender(React.cloneElement(navigator));
    expect(weatherOptions().unstable_headerRightItems({})).toHaveLength(2);
    expect(weatherOptions().headerShown).toBe(true);

    mockVerticalBarLayout = false;
    view.rerender(React.cloneElement(navigator));
    expect(weatherOptions().unstable_headerRightItems).toBeUndefined();
    expect(weatherOptions().headerShown).toBe(layout !== 'vertical');
  });

  it('waits for Mac detection before running launch effects', () => {
    const navigator = (
      <TabNavigator
        initialTab="Map"
        theme="light"
        didLaunchApp
        termsOfUseAccepted
        setCurrentLocation={mockSetCurrentLocation as any}
        setNavigationTab={mockSetNavigationTab as any}
        fetchAnnouncements={mockFetchAnnouncements as any}
      />
    );

    const view = render(
      <MacContentSizeProvider
        isRunningOnMac={false}
        isPlatformDetectionComplete={false}>
        {navigator}
      </MacContentSizeProvider>
    );

    expect(mockGetGeolocation).not.toHaveBeenCalled();
    expect(mockFetchAnnouncements).not.toHaveBeenCalled();
    expect(mockTrackMatomoEvent).not.toHaveBeenCalledWith(
      'Init',
      'Platform',
      expect.any(String)
    );

    view.rerender(
      <MacContentSizeProvider
        isRunningOnMac
        isPlatformDetectionComplete>
        {navigator}
      </MacContentSizeProvider>
    );

    expect(mockGetGeolocation).toHaveBeenCalledTimes(1);
    expect(mockFetchAnnouncements).toHaveBeenCalledTimes(1);
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'Init',
      'Platform',
      expect.stringMatching(/^MacOS - /)
    );
  });

  it('omits warnings tab when warnings are disabled', () => {
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'warnings') return { enabled: false };
      if (key === 'onboardingWizard') return { enabled: true };
      if (key === 'weather') return { layout: 'default' };
      return {};
    });

    const view = render(
      <TabNavigator
        initialTab="Weather"
        theme="light"
        didLaunchApp
        termsOfUseAccepted
        setCurrentLocation={mockSetCurrentLocation as any}
        setNavigationTab={mockSetNavigationTab as any}
        fetchAnnouncements={mockFetchAnnouncements as any}
      />
    );

    expect(view.queryByTestId('navigation_warnings')).toBeNull();
    expect(mockWarningsTabIcon).not.toHaveBeenCalled();
  });
});
