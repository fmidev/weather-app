import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import TabNavigator from '../../src/navigators/TabNavigator';

const mockConfigGet = jest.fn();
const mockFetchAnnouncements = jest.fn();
const mockGetGeolocation = jest.fn();
const mockI18nOn = jest.fn();
const mockI18nOff = jest.fn();
const mockLaunchArgumentsValue = jest.fn();
const mockRBSheetClose = jest.fn();
const mockRBSheetOpen = jest.fn();
const mockSetCurrentLocation = jest.fn();
const mockSetNavigationTab = jest.fn();
const mockTabScreens = jest.fn();
const mockTrackMatomoEvent = jest.fn();
const mockWarningsTabIcon = jest.fn();
let mockTranslationReady = true;

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
  default: ({ icon, onPress, testID }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable testID={testID || `header-button-${icon}`} onPress={onPress}>
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
  default: () => {
    const { Text } = require('react-native');
    return <Text testID="map-stack">map</Text>;
  },
}));

jest.mock('../../src/navigators/stacks/WeatherStackScreen', () => ({
  __esModule: true,
  default: () => {
    const { Text } = require('react-native');
    return <Text testID="weather-stack">weather</Text>;
  },
}));

jest.mock('../../src/navigators/stacks/WarningsStackScreen', () => ({
  __esModule: true,
  default: () => {
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
    mockConfigGet.mockReset();
    mockFetchAnnouncements.mockClear();
    mockGetGeolocation.mockClear();
    mockI18nOn.mockClear();
    mockI18nOff.mockClear();
    mockLaunchArgumentsValue.mockReset();
    mockRBSheetClose.mockClear();
    mockRBSheetOpen.mockClear();
    mockSetCurrentLocation.mockClear();
    mockSetNavigationTab.mockClear();
    mockTabScreens.mockClear();
    mockTrackMatomoEvent.mockClear();
    mockWarningsTabIcon.mockClear();
    mockTranslationReady = true;

    mockLaunchArgumentsValue.mockReturnValue({});
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'warnings') return { enabled: true };
      if (key === 'onboardingWizard') return { enabled: true };
      if (key === 'weather') return { layout: 'default' };
      return {};
    });
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
