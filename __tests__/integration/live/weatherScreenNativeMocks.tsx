// Keep live-test application components, Redux, translations and API modules real.
// Replace native rendering/services that are unavailable in Jest.
import React from 'react';

export const mockNavigation = { navigate: jest.fn() };
export const mockFocus = { current: true };
export const mockTrackMatomoEvent = jest.fn();
export const mockRoute = { params: { day: 0 } };
export const mockRouteContext = React.createContext(mockRoute);
export const mockBottomSheetOpen = jest.fn();

jest.mock('react-native-launch-arguments', () => ({
  LaunchArguments: { value: () => ({}) },
}));

jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => mockFocus.current,
  useNavigation: () => mockNavigation,
  useRoute: () => require('react').useContext(mockRouteContext),
  useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]),
  useTheme: () => require('@assets/themes').lightTheme,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: require('react-native').View,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('react-native-linear-gradient', () => require('react-native').View);
jest.mock('@d11/react-native-fast-image', () => {
  const ReactActual = require('react');
  const { Image } = require('react-native');
  const FastImage = (props: unknown) => ReactActual.createElement(Image, props);
  FastImage.cacheControl = { immutable: 'immutable' };
  FastImage.resizeMode = { cover: 'cover' };
  return FastImage;
});
jest.mock('@assets/Icon', () => require('react-native').Text);
jest.mock('@assets/images', () => ({
  ...jest.requireActual('@assets/images'),
  weatherSymbolGetter: () => require('react-native').View,
}));
jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: (...args: unknown[]) => mockTrackMatomoEvent(...args),
}));

jest.mock('react-native-raw-bottom-sheet', () => {
  const ReactActual = require('react');
  // Closed sheets do not render their contents on the screen.
  return ReactActual.forwardRef((_props: unknown, ref: unknown) => {
    ReactActual.useImperativeHandle(ref, () => ({ open: mockBottomSheetOpen, close: jest.fn() }));
    return null;
  });
});

jest.mock('victory-native', () => {
  const { View } = require('react-native');
  return Object.fromEntries([
    'VictoryArea', 'VictoryAxis', 'VictoryBar', 'VictoryChart',
    'VictoryGroup', 'VictoryLabel', 'VictoryLine', 'VictoryScatter',
    'VictoryVoronoiContainer',
  ].map((name) => [name, View]));
});
