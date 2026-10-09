import React from 'react';
import type { ReactTestInstance } from 'react-test-renderer';
import { StyleSheet, Text, View } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import MapLayersBottomSheet from '../../src/components/map/sheets/MapLayersBottomSheet';

const mockSelectActiveOverlay = jest.fn((state: any) => state.mock.activeOverlay);
const mockSelectMapLayers = jest.fn((state: any) => state.mock.mapLayers);
const mockSelectAnimationSpeed = jest.fn((state: any) => state.mock.animationSpeed);
const mockUpdateMapLayers = jest.fn((...args: any[]) => ({
  type: 'MAP/UPDATE_MAP_LAYERS',
  payload: args[0],
}));
const mockTrackMatomoEvent = jest.fn();
const mockWindowDimensions = jest.fn();
const mockSafeAreaInsets = jest.fn();
const mockCloseButton = jest.fn((props) => (
  <Text testID={props.testID} accessibilityLabel={props.accessibilityLabel}>
    close
  </Text>
));

jest.mock('@store/map/selectors', () => ({
  selectActiveOverlay: (state: any) => mockSelectActiveOverlay(state),
  selectMapLayers: (state: any) => mockSelectMapLayers(state),
  selectAnimationSpeed: (state: any) => mockSelectAnimationSpeed(state),
}));

jest.mock('@store/map/actions', () => ({
  updateMapLayers: (...args: any[]) => mockUpdateMapLayers(...args),
  updateActiveOverlay: jest.fn(() => ({ type: 'MAP/UPDATE_ACTIVE_OVERLAY' })),
  updateAnimationSpeed: jest.fn(() => ({ type: 'MAP/UPDATE_ANIMATION_SPEED' })),
}));

jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: (...args: any[]) => mockTrackMatomoEvent(...args),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => mockSafeAreaInsets(),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      text: '#111111',
      hourListText: '#333333',
      border: '#d9d9d9',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'map:layersBottomSheet:closeAccessibilityLabel': 'Close map layers',
        'map:layersBottomSheet:locationTitle': 'Location',
        'map:layersBottomSheet:locationHint': 'Show own location',
        'map:layersBottomSheet:hideLocationAccessibilityHint': 'Hide current location',
        'map:layersBottomSheet:showLocationAccessibilityHint': 'Show current location',
        'map:layersBottomSheet:animationSpeedTitle': 'Animation speed',
        'map:layersBottomSheet:mapLayersTitle': 'Map layers',
      };
      return translations[key] ?? key;
    },
  }),
}));

jest.mock('@components/common/CloseButton', () => ({
  __esModule: true,
  default: (props: any) => mockCloseButton(props),
}));

jest.mock('@components/map/ui/SpeedSelector', () => ({
  __esModule: true,
  default: () => {
    const { Text: MockText } = require('react-native');
    return <MockText testID="speed-selector">speed</MockText>;
  },
}));

jest.mock('@components/map/ui/LayerSelector', () => ({
  __esModule: true,
  default: ({ onClose }: any) => {
    const { Text: MockText } = require('react-native');
    return (
      <MockText testID="layer-selector" onPress={onClose}>
        layers
      </MockText>
    );
  },
}));

const createStore = (state: any) => ({
  getState: () => state,
  dispatch: jest.fn(),
  subscribe: () => () => {},
});

const parentViewStyle = (node: ReactTestInstance) => {
  let parent = node.parent;
  while (parent && parent.type !== View) parent = parent.parent;
  expect(parent).not.toBeNull();
  return StyleSheet.flatten(parent!.props.style);
};

describe('MapLayersBottomSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowDimensions.mockReturnValue({ width: 390, height: 844 });
    mockSafeAreaInsets.mockReturnValue({
      top: 12,
      right: 4,
      bottom: 0,
      left: 6,
    });
    jest.spyOn(require('react-native'), 'useWindowDimensions').mockImplementation(
      () => mockWindowDimensions()
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders close button, selectors and narrow layout content', () => {
    const store = createStore({
      mock: {
        activeOverlay: 3,
        mapLayers: { location: true, weather: true, radar: false },
        animationSpeed: 50,
      },
    });

    const onClose = jest.fn();
    const { getByText, getByTestId, getByA11yLabel, toJSON } = render(
      <Provider store={store as any}>
        <MapLayersBottomSheet onClose={onClose} />
      </Provider>
    );

    expect(getByTestId('map_layers_bottom_sheet')).toBeTruthy();
    expect(getByText('Location')).toBeTruthy();
    expect(getByText('Animation speed')).toBeTruthy();
    expect(getByText('Map layers')).toBeTruthy();
    expect(getByTestId('speed-selector')).toBeTruthy();
    expect(getByTestId('layer-selector')).toBeTruthy();
    expect(getByA11yLabel('Close map layers')).toBeTruthy();

    const tree = toJSON() as any;
    const styleArray = Array.isArray(tree.props.style)
      ? tree.props.style
      : [tree.props.style];
    const mergedStyle = Object.assign({}, ...styleArray);

    expect(mergedStyle.paddingLeft).toBe(6);
    expect(mergedStyle.paddingRight).toBe(4);
    expect(mergedStyle.paddingTop).toBe(8);
  });

  it.each([true, false])('updates location from the named switch and tracks the new value (initial value: %s)', (value) => {
    const store = createStore({
      mock: {
        activeOverlay: 3,
        mapLayers: { location: value, weather: true, radar: false },
        animationSpeed: 50,
      },
    });

    const { getByA11yLabel } = render(
      <Provider store={store as any}>
        <MapLayersBottomSheet onClose={() => {}} />
      </Provider>
    );

    const control = getByA11yLabel('Show own location');
    expect(control.props.accessibilityRole).toBe('switch');
    expect(control.props.accessibilityState.checked).toBe(value);
    expect(control.props.accessibilityHint).toBe(value ? 'Hide current location' : 'Show current location');
    fireEvent.press(control);

    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Map',
      `Show own location - ${!value}`
    );
    expect(mockUpdateMapLayers).toHaveBeenCalledWith({
      location: !value,
      weather: true,
      radar: false,
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'MAP/UPDATE_MAP_LAYERS',
      payload: {
        location: !value,
        weather: true,
        radar: false,
      },
    });
  });

  it('uses wide layout padding and column widths on large screens', () => {
    mockWindowDimensions.mockReturnValue({ width: 700, height: 1024 });

    const store = createStore({
      mock: {
        activeOverlay: 3,
        mapLayers: { location: false, weather: true, radar: false },
        animationSpeed: 50,
      },
    });

    const { getByTestId, toJSON } = render(
      <Provider store={store as any}>
        <MapLayersBottomSheet onClose={() => {}} />
      </Provider>
    );

    expect(getByTestId('map_layers_bottom_sheet')).toBeTruthy();

    const tree = toJSON() as any;
    const styleArray = Array.isArray(tree.props.style)
      ? tree.props.style
      : [tree.props.style];
    const mergedStyle = Object.assign({}, ...styleArray);

    expect(mergedStyle.paddingTop).toBe(12);
  });

  it.each([390, 700])('reserves the close button hit area above the first controls at width %s', (width) => {
    mockWindowDimensions.mockReturnValue({ width, height: 844 });
    const store = createStore({ mock: {
      activeOverlay: 3,
      mapLayers: { location: true, weather: true, radar: false },
      animationSpeed: 50,
    } });
    const { getByText, getByTestId } = render(
      <Provider store={store as any}>
        <MapLayersBottomSheet onClose={() => {}} />
      </Provider>
    );
    // Android's spatial Tab order must not put the close button and switch on the same row.
    const closeStyle = parentViewStyle(getByTestId('layers_bottom_sheet_close_button'));
    const locationHeaderStyle = parentViewStyle(getByText('Location'));
    expect(closeStyle.top).toBeGreaterThanOrEqual(0);
    expect(locationHeaderStyle.minHeight).toBeGreaterThanOrEqual(closeStyle.top + 44);
    if (width > 500) {
      const layersHeaderStyle = parentViewStyle(getByText('Map layers'));
      expect(layersHeaderStyle.minHeight).toBeGreaterThanOrEqual(closeStyle.top + 44);
    }
  });
});
