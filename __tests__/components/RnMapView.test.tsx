import React from 'react';
import { Platform, Text } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import RnMapView from '../../src/components/map/maps/RnMapView';

const mockSelectCurrent = jest.fn((state: any) => state.mock.currentLocation);
const mockSelectTimeZone = jest.fn((state: any) => state.mock.timezone);
const mockSelectDisplayLocation = jest.fn((state: any) => state.mock.displayLocation);
const mockSelectOverlay = jest.fn((state: any) => state.mock.overlay);
const mockSelectActiveOverlay = jest.fn((state: any) => state.mock.activeOverlay);
const mockUpdateOverlays = jest.fn((overlayId: number, library: string) => ({
  type: 'MAP/UPDATE_OVERLAYS',
  payload: { overlayId, library },
}));
const mockUpdateRegion = jest.fn((region: any) => ({
  type: 'MAP/UPDATE_REGION',
  payload: region,
}));
const mockUpdateSelectedCallout = jest.fn((value: string | undefined) => ({
  type: 'MAP/UPDATE_SELECTED_CALLOUT',
  payload: value,
}));
const mockTrackMatomoEvent = jest.fn();
const mockGetDistance = jest.fn();
const mockUseIsFocused = jest.fn();
const mockUseReloader = jest.fn();
const mockConfigGet = jest.fn();
const mockWMSOverlay = jest.fn((props) => (
  <Text testID={`wms-overlay-${props.library}`}>wms</Text>
));
const mockTimeseriesOverlay = jest.fn(() => (
  <Text testID="timeseries-overlay">timeseries</Text>
));
const mockMapMarker = jest.fn(() => <Text testID="map-marker">marker</Text>);
const mockMapControls = jest.fn(() => <Text testID="map-controls">controls</Text>);

const mockMapRefApi = {
  animateToRegion: jest.fn(),
  getCamera: jest.fn(),
  animateCamera: jest.fn(),
};

let lastMapProps: any;

jest.mock('@store/location/selector', () => ({
  selectCurrent: (state: any) => mockSelectCurrent(state),
  selectTimeZone: (state: any) => mockSelectTimeZone(state),
}));

jest.mock('@store/map/selectors', () => ({
  selectDisplayLocation: (state: any) => mockSelectDisplayLocation(state),
  selectOverlay: (state: any) => mockSelectOverlay(state),
  selectActiveOverlay: (state: any) => mockSelectActiveOverlay(state),
}));

jest.mock('@store/map/actions', () => ({
  updateOverlays: (...args: any[]) => mockUpdateOverlays(...args),
  updateRegion: (...args: any[]) => mockUpdateRegion(...args),
  updateSelectedCallout: (...args: any[]) => mockUpdateSelectedCallout(...args),
}));

jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: (...args: any[]) => mockTrackMatomoEvent(...args),
}));

jest.mock('geolib', () => ({
  getDistance: (...args: any[]) => mockGetDistance(...args),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    dark: false,
  }),
  useIsFocused: () => mockUseIsFocused(),
}));

jest.mock('@utils/reloader', () => ({
  useReloader: () => mockUseReloader(),
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('@components/map/layers/WMSOverlay', () => ({
  __esModule: true,
  default: (props: any) => mockWMSOverlay(props),
}));

jest.mock('@components/map/layers/TimeseriesOverlay', () => ({
  __esModule: true,
  default: (props: any) => mockTimeseriesOverlay(props),
}));

jest.mock('@components/map/layers/MapMarker', () => ({
  __esModule: true,
  default: (props: any) => mockMapMarker(props),
}));

jest.mock('@components/map/ui/MapControls', () => ({
  __esModule: true,
  default: (props: any) => mockMapControls(props),
}));

jest.mock('@utils/dark_map_style.json', () => ([]));

jest.mock('react-native-raw-bottom-sheet', () => 'RBSheet');

jest.mock('moment', () => ({
  tz: {
    setDefault: jest.fn(),
  },
}));

jest.mock('react-native-maps', () => {
  const MockReact = require('react');
  const { View } = require('react-native');

  const MapView = MockReact.forwardRef((props: any, ref: any) => {
    lastMapProps = props;
    MockReact.useImperativeHandle(ref, () => mockMapRefApi);
    return <View testID="rn-map">{props.children}</View>;
  });

  return {
    __esModule: true,
    default: MapView,
    Marker: ({ children }: any) => <View>{children}</View>,
  };
});

const createStore = (state: any) => ({
  getState: () => state,
  dispatch: jest.fn(),
  subscribe: () => () => {},
});

describe('RnMapView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    lastMapProps = undefined;
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'android',
    });
    mockMapRefApi.getCamera.mockResolvedValue({ zoom: 8 });
    mockUseIsFocused.mockReturnValue(true);
    mockUseReloader.mockReturnValue({ shouldReload: 0 });
    mockGetDistance.mockReturnValue(5000);
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'map') {
        return {
          updateInterval: 5,
        };
      }
      if (key === 'location') {
        return {
          default: { lat: 60.1699, lon: 24.9384 },
        };
      }
      return {};
    });
  });

  it('dispatches overlay update and renders WMS overlay with marker', () => {
    const store = createStore({
      mock: {
        currentLocation: { lat: 60.1699, lon: 24.9384 },
        displayLocation: true,
        overlay: { type: 'WMS', step: 60 },
        activeOverlay: 3,
        timezone: 'Europe/Helsinki',
      },
    });

    const infoSheetRef = { current: { open: jest.fn() } };
    const mapLayersSheetRef = { current: { open: jest.fn() } };

    render(
      <Provider store={store as any}>
        <RnMapView
          infoSheetRef={infoSheetRef as any}
          mapLayersSheetRef={mapLayersSheetRef as any}
        />
      </Provider>
    );

    expect(mockUpdateOverlays).toHaveBeenCalledWith(3, 'react-native-maps');
    expect(mockWMSOverlay).toHaveBeenCalledWith(
      expect.objectContaining({
        overlay: { type: 'WMS', step: 60 },
        library: 'react-native-maps',
      })
    );
    expect(mockMapMarker).toHaveBeenCalledWith(
      expect.objectContaining({
        coordinates: {
          latitude: 60.1699,
          longitude: 24.9384,
        },
      })
    );
    expect(mockMapRefApi.animateToRegion).toHaveBeenCalled();
  });

  it('handles region changes, map press and control callbacks', async () => {
    mockGetDistance.mockReturnValue(15000);

    const store = createStore({
      mock: {
        currentLocation: { lat: 60.1699, lon: 24.9384, country: 'FI' },
        displayLocation: false,
        overlay: { type: 'Timeseries', step: 60 },
        activeOverlay: 3,
        timezone: 'Europe/Helsinki',
      },
    });

    const infoSheetRef = { current: { open: jest.fn() } };
    const mapLayersSheetRef = { current: { open: jest.fn() } };

    render(
      <Provider store={store as any}>
        <RnMapView
          infoSheetRef={infoSheetRef as any}
          mapLayersSheetRef={mapLayersSheetRef as any}
        />
      </Provider>
    );

    act(() => {
      lastMapProps.onRegionChangeComplete({
        latitude: 60.5,
        longitude: 25.2,
        latitudeDelta: 1,
        longitudeDelta: 1,
      });
    });

    expect(mockUpdateRegion).toHaveBeenCalledWith({
      latitude: 60.5,
      longitude: 25.2,
      latitudeDelta: 1,
      longitudeDelta: 1,
    });

    act(() => {
      lastMapProps.onPress({
        nativeEvent: {
          action: 'press',
        },
      });
    });

    expect(mockUpdateSelectedCallout).toHaveBeenCalledWith(undefined);
    expect(mockTimeseriesOverlay).toHaveBeenCalledWith(
      expect.objectContaining({
        overlay: { type: 'Timeseries', step: 60 },
      })
    );

    const controlsProps = mockMapControls.mock.calls.at(-1)?.[0];
    expect(controlsProps.showRelocateButton).toBe(true);

    await act(async () => {
      controlsProps.onZoomIn();
    });
    expect(mockMapRefApi.animateCamera).toHaveBeenCalledWith({ zoom: 9 });

    await act(async () => {
      controlsProps.onZoomOut();
    });
    expect(mockMapRefApi.animateCamera).toHaveBeenCalledWith({ zoom: 7 });

    act(() => {
      controlsProps.onInfoPressed();
      controlsProps.onLayersPressed();
      controlsProps.relocate();
    });

    expect(infoSheetRef.current.open).toHaveBeenCalledTimes(1);
    expect(mapLayersSheetRef.current.open).toHaveBeenCalledTimes(1);
    expect(mockMapRefApi.animateToRegion).toHaveBeenCalledTimes(2);
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Map',
      'Open info panel'
    );
  });
});
