export const mockChangeLanguage = jest.fn();
export const mockConfigGet = jest.fn();
export const mockConfigGetAll = jest.fn();
export const mockGetGeolocation = jest.fn();
export const mockInitMatomo = jest.fn();
export const mockPermissionsCheckMultiple = jest.fn();
export const mockPermissionsOpenSettings = jest.fn();
export const mockPermissionsRequest = jest.fn();
export const mockSetItem = jest.fn();
export const mockTrackMatomoEvent = jest.fn();
export const mockUseFocusEffect = jest.fn((callback) => callback());
export const mockUseReloader = jest.fn();

export const mockState = {
  dark: false,
  focused: true,
  language: 'en',
};

export const resetScreenMocks = () => {
  jest.clearAllMocks();
  mockState.dark = false;
  mockState.focused = true;
  mockState.language = 'en';
  mockUseReloader.mockReturnValue({ shouldReload: 0 });
  mockPermissionsCheckMultiple.mockResolvedValue({
    'android.coarse': 'granted',
    'android.fine': 'granted',
    'ios.always': undefined,
    'ios.when_in_use': 'granted',
  });
  mockPermissionsOpenSettings.mockResolvedValue(undefined);
  mockPermissionsRequest.mockResolvedValue('granted');
  mockSetItem.mockResolvedValue(undefined);
  mockConfigGet.mockImplementation((key: string) => {
    if (key === 'feedback') {
      return {
        email: 'feedback@example.test',
        enabled: true,
        subject: { en: 'Feedback subject' },
      };
    }
    if (key === 'onboardingWizard') {
      return {
        backgroundImageProperties: undefined,
        languageSpecificLogo: true,
      };
    }
    if (key === 'settings') {
      return {
        excludeUnits: [],
        languages: ['en', 'fi'],
        markdown: {
          accessibility: false,
          aboutTheApplication: false,
          termsOfUse: false,
        },
        showUnitSettings: true,
        themes: { dark: true, light: true },
      };
    }
    if (key === 'socialMediaLinks') {
      return [
        {
          appUrl: 'mastodon://weather',
          icon: 'mastodon',
          name: 'Mastodon',
          url: 'https://social.example.test/weather',
        },
      ];
    }
    if (key === 'warnings') {
      return {
        apiUrl: { FI: 'https://warnings.example.test' },
        enabled: true,
        updateInterval: 7,
        useCapView: false,
      };
    }
    return {};
  });
  mockConfigGetAll.mockReturnValue({
    news: {
      enabled: true,
      updateInterval: 30,
    },
    warnings: {
      apiUrl: { FI: 'https://warnings.example.test' },
      enabled: true,
      updateInterval: 5,
    },
    weather: {
      forecast: { updateInterval: 5 },
      layout: 'fmi',
      meteorologist: { updateInterval: 10, url: 'https://met.example.test' },
      observation: { enabled: true, lazyLoad: false, updateInterval: 5 },
    },
  });
};

function mockTextComponent(testID: string) {
  return () => {
    const ReactActual = require('react');
    const { Text } = require('react-native');
    return ReactActual.createElement(Text, { testID }, testID);
  };
}

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
    getAll: (...args: any[]) => mockConfigGetAll(...args),
  },
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (...args: any[]) => mockUseFocusEffect(...args),
  useIsFocused: () => mockState.focused,
  useTheme: () => ({
    dark: mockState.dark,
    colors: {
      background: '#ffffff',
      border: '#dddddd',
      headerBackground: '#000000',
      hourListText: '#555555',
      inputBackground: '#eeeeee',
      inputButtonBackground: '#cccccc',
      primary: '#0066cc',
      primaryText: '#222222',
      screenBackground: '#f7f7f7',
      shadow: '#999999',
      text: '#111111',
    },
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => {
    const ReactActual = require('react');
    const { View } = require('react-native');
    return ReactActual.createElement(View, null, children);
  },
  useSafeAreaInsets: () => ({
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      changeLanguage: (...args: any[]) => mockChangeLanguage(...args),
      language: mockState.language,
    },
    t: (key: string, options?: any) =>
      options ? `${key}:${JSON.stringify(options)}` : key,
  }),
}));

jest.mock('react-native-marked', () => ({
  __esModule: true,
  default: ({ value }: any) => {
    const ReactActual = require('react');
    const { Text } = require('react-native');
    return ReactActual.createElement(Text, { testID: 'markdown' }, value);
  },
}));

jest.mock('@components/markdown/MarkdownRenderer', () => ({
  MarkdownRenderer: jest.fn().mockImplementation(() => ({
    setHeadingColor: jest.fn(),
    setTextColor: jest.fn(),
    setTranslationFunction: jest.fn(),
  })),
}));

jest.mock('@assets/markdown', () => ({
  accessibilityDocuments: {
    en: 'accessibility markdown en',
    fi: 'accessibility markdown fi',
  },
  aboutTheApplicationDocuments: {
    en: 'about markdown en',
    fi: 'about markdown fi',
  },
  termsOfUseDocuments: {
    en: 'terms markdown en',
    fi: 'terms markdown fi',
  },
}));

jest.mock('@components/others/AccessibilityStatement', () => ({
  __esModule: true,
  default: mockTextComponent('accessibility-statement'),
}));

jest.mock('@components/common/AppText', () => ({
  __esModule: true,
  default: require('react').forwardRef(({ children, ...props }: any, ref: any) => {
    const ReactActual = require('react');
    const { Text } = require('react-native');
    return ReactActual.createElement(Text, { ref, ...props }, children);
  }),
}));

jest.mock('@components/common/AccessibleTouchableOpacity', () => ({
  __esModule: true,
  default: ({ children, disabled, onPress, ...props }: any) => {
    const ReactActual = require('react');
    const { Pressable } = require('react-native');
    return ReactActual.createElement(
      Pressable,
      { disabled, onPress: disabled ? undefined : onPress, ...props },
      children
    );
  },
}));

jest.mock('@components/common/CloseButton', () => ({
  __esModule: true,
  default: ({ accessibilityLabel, onPress, testID }: any) => {
    const ReactActual = require('react');
    const { Pressable, Text } = require('react-native');
    return ReactActual.createElement(
      Pressable,
      { accessibilityLabel, onPress, testID },
      ReactActual.createElement(Text, null, 'close')
    );
  },
}));

jest.mock('@components/common/IconButton', () => ({
  __esModule: true,
  default: ({ icon, onPress }: any) => {
    const ReactActual = require('react');
    const { Pressable, Text } = require('react-native');
    return ReactActual.createElement(
      Pressable,
      { onPress, testID: `icon-button-${icon}` },
      ReactActual.createElement(Text, null, icon)
    );
  },
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: ({ name }: any) => {
    const ReactActual = require('react');
    const { Text } = require('react-native');
    return ReactActual.createElement(Text, { testID: `icon-${name}` }, name);
  },
}));

jest.mock('@components/common/ScalableIcon', () => ({
  __esModule: true,
  default: ({ name }: any) => {
    const ReactActual = require('react');
    const { Text } = require('react-native');
    return ReactActual.createElement(Text, { testID: `icon-${name}` }, name);
  },
}));

jest.mock('@utils/matomo', () => ({
  initMatomo: (...args: any[]) => mockInitMatomo(...args),
  trackMatomoEvent: (...args: any[]) => mockTrackMatomoEvent(...args),
}));

jest.mock('@utils/hooks', () => ({
  useOrientation: () => false,
}));

jest.mock('@utils/helpers', () => ({
  getGeolocation: (...args: any[]) => mockGetGeolocation(...args),
}));

jest.mock('@utils/async_storage', () => ({
  LOCALE: 'locale',
  setItem: (...args: any[]) => mockSetItem(...args),
}));

jest.mock('react-native-permissions', () => ({
  __esModule: true,
  default: {
    checkMultiple: (...args: any[]) => mockPermissionsCheckMultiple(...args),
    openSettings: (...args: any[]) => mockPermissionsOpenSettings(...args),
    request: (...args: any[]) => mockPermissionsRequest(...args),
  },
  PERMISSIONS: {
    ANDROID: {
      ACCESS_COARSE_LOCATION: 'android.coarse',
      ACCESS_FINE_LOCATION: 'android.fine',
    },
    IOS: {
      LOCATION_ALWAYS: 'ios.always',
      LOCATION_WHEN_IN_USE: 'ios.when_in_use',
    },
  },
  RESULTS: {
    BLOCKED: 'blocked',
    GRANTED: 'granted',
  },
}));

jest.mock('react-native-raw-bottom-sheet', () => {
  const ReactActual = require('react');
  return {
    __esModule: true,
    default: ReactActual.forwardRef(({ children, height }: any, ref: any) => {
      ReactActual.useImperativeHandle(ref, () => ({
        close: jest.fn(),
        open: jest.fn(),
      }));
      const { Text, View } = require('react-native');
      return ReactActual.createElement(
        View,
        { testID: 'rb-sheet' },
        ReactActual.createElement(Text, null, `height:${height}`),
        children
      );
    }),
  };
});

jest.mock('@assets/images', () => ({
  providerLogos: {
    en: {
      dark: 1,
      light: 2,
    },
  },
}));

jest.mock('@components/search/AreaList', () => ({
  __esModule: true,
  default: ({
    clearTitle,
    elements,
    onClear,
    onIconPress,
    onSelect,
    testID,
    title,
  }: any) => {
    const ReactActual = require('react');
    const { Pressable, Text, View } = require('react-native');
    return ReactActual.createElement(
      View,
      { testID: testID || `area-list-${title}` },
      ReactActual.createElement(Text, null, title),
      elements.map((element: any) =>
        ReactActual.createElement(
          View,
          { key: element.id },
          ReactActual.createElement(
            Pressable,
            { onPress: () => onSelect(element), testID: `select-${element.id}` },
            ReactActual.createElement(Text, null, element.name)
          ),
          ReactActual.createElement(
            Pressable,
            { onPress: () => onIconPress(element), testID: `icon-${element.id}` },
            ReactActual.createElement(Text, null, 'icon')
          )
        )
      ),
      clearTitle
        ? ReactActual.createElement(
            Pressable,
            { onPress: onClear, testID: `clear-${title}` },
            ReactActual.createElement(Text, null, clearTitle)
          )
        : null
    );
  },
}));

jest.mock('@utils/units', () => ({
  getUnitsHiddenInSettings: () => [],
  UNITS: [
    {
      parameterName: 'temperature',
      unitTypes: [
        { unit: 'celsius', unitAbb: 'C', unitId: 1 },
        { unit: 'fahrenheit', unitAbb: 'F', unitId: 2 },
      ],
    },
  ],
}));

jest.mock('@utils/reloader', () => ({
  useReloader: (...args: any[]) => mockUseReloader(...args),
}));

jest.mock('@store/location/selector', () => ({
  selectCurrent: jest.fn(),
  selectFavorites: jest.fn(),
  selectLoading: jest.fn(),
  selectRecent: jest.fn(),
  selectSearch: jest.fn(),
  selectStoredGeoids: jest.fn(),
}));

jest.mock('@store/location/actions', () => ({
  addFavorite: jest.fn(),
  deleteAllFavorites: jest.fn(),
  deleteAllRecentSearches: jest.fn(),
  deleteFavorite: jest.fn(),
  resetSearch: jest.fn(),
  searchLocation: jest.fn(),
  setCurrentLocation: jest.fn(),
  setLoading: jest.fn(),
  updateLocationsLocales: jest.fn(),
  updateRecentSearches: jest.fn(),
}));

jest.mock('@store/map/actions', () => ({
  setAnimateToArea: jest.fn(),
}));

jest.mock('@store/settings/selectors', () => ({
  selectClockType: jest.fn(),
  selectMapLibrary: jest.fn(),
  selectTheme: jest.fn(),
  selectUnits: jest.fn(),
}));

jest.mock('@store/settings/actions', () => ({
  updateClockType: jest.fn(),
  updateMapLibrary: jest.fn(),
  updateTheme: jest.fn(),
  updateUnits: jest.fn(),
}));

jest.mock('@store/warnings/actions', () => ({
  fetchCapWarnings: jest.fn(),
  fetchWarnings: jest.fn(),
}));

jest.mock('@store/forecast/actions', () => ({
  fetchForecast: jest.fn(),
}));

jest.mock('@store/observation/actions', () => ({
  fetchObservation: jest.fn(),
  resetObservations: jest.fn(),
}));

jest.mock('@store/meteorologist/actions', () => ({
  fetchMeteorologistSnapshot: jest.fn(),
}));

jest.mock('@store/news/actions', () => ({
  fetchNews: jest.fn(),
}));

jest.mock('@store/announcements/selectors', () => ({
  selectAnnouncements: jest.fn(),
}));

jest.mock('@components/map/maps/MlMapView', () => ({
  __esModule: true,
  default: mockTextComponent('ml-map-view'),
}));

jest.mock('@components/map/maps/RnMapView', () => ({
  __esModule: true,
  default: mockTextComponent('rn-map-view'),
}));

jest.mock('@components/announcements/Announcements', () => ({
  __esModule: true,
  default: mockTextComponent('announcements'),
}));

jest.mock('@components/map/sheets/InfoBottomSheet', () => ({
  __esModule: true,
  default: mockTextComponent('info-bottom-sheet'),
}));

jest.mock('@components/map/sheets/MapLayersBottomSheet', () => ({
  __esModule: true,
  default: mockTextComponent('map-layers-bottom-sheet'),
}));

jest.mock('@components/warnings/WarningsWebViewPanel', () => ({
  __esModule: true,
  default: ({ updateInterval }: any) => {
    const ReactActual = require('react');
    const { Text } = require('react-native');
    return ReactActual.createElement(
      Text,
      { testID: 'warnings-web-view-panel' },
      `interval:${updateInterval}`
    );
  },
}));

jest.mock('@components/warnings/WarningsPanel', () => ({
  __esModule: true,
  default: mockTextComponent('warnings-panel'),
}));

jest.mock('@components/warnings/cap/CapWarningsView', () => ({
  __esModule: true,
  default: mockTextComponent('cap-warnings-view'),
}));

jest.mock('@components/weather/GradientWrapper', () => ({
  __esModule: true,
  default: ({ children }: any) => {
    const ReactActual = require('react');
    const { View } = require('react-native');
    return ReactActual.createElement(View, { testID: 'gradient-wrapper' }, children);
  },
}));

jest.mock('@components/weather/NextHourForecastPanel', () => ({
  __esModule: true,
  default: mockTextComponent('next-hour-forecast-panel'),
}));

jest.mock('@components/weather/NextHourForecastPanelWithWeatherBackground', () => ({
  __esModule: true,
  default: mockTextComponent('next-hour-weather-background-panel'),
}));

jest.mock('@components/weather/ForecastPanel', () => ({
  __esModule: true,
  default: mockTextComponent('forecast-panel'),
}));

jest.mock('@components/weather/ForecastPanelWithVerticalLayout', () => ({
  __esModule: true,
  default: mockTextComponent('forecast-panel-vertical'),
}));

jest.mock('@components/weather/ObservationPanel', () => ({
  __esModule: true,
  default: mockTextComponent('observation-panel'),
}));

jest.mock('@components/weather/SunAndMoonPanel', () => ({
  __esModule: true,
  default: mockTextComponent('sun-and-moon-panel'),
}));

jest.mock('@components/news/News', () => ({
  __esModule: true,
  default: mockTextComponent('news'),
}));

jest.mock('@components/warnings/WarningIconsPanel', () => ({
  __esModule: true,
  default: ({ gridLayout }: any) => {
    const ReactActual = require('react');
    const { Text } = require('react-native');
    return ReactActual.createElement(
      Text,
      { testID: 'warning-icons-panel' },
      gridLayout ? 'grid' : 'plain'
    );
  },
}));

jest.mock('@components/weather/MeteorologistSnapshot', () => ({
  __esModule: true,
  default: ({ gridLayout }: any) => {
    const ReactActual = require('react');
    const { Text } = require('react-native');
    return ReactActual.createElement(
      Text,
      { testID: 'meteorologist-snapshot' },
      gridLayout ? 'grid' : 'plain'
    );
  },
}));
