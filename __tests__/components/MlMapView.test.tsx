import React from 'react';
import { Text } from 'react-native';
import { act, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import MlMapView from '../../src/components/map/maps/MlMapView';

const mockSelectCurrent = jest.fn((state: any) => state.mock.currentLocation);
const mockSelectTimeZone = jest.fn((state: any) => state.mock.timezone);
const mockSelectDisplayLocation = jest.fn((state: any) => state.mock.displayLocation);
const mockSelectOverlay = jest.fn((state: any) => state.mock.overlay);
const mockSelectActiveOverlay = jest.fn((state: any) => state.mock.activeOverlay);
const mockUpdateOverlays = jest.fn((overlayId: number, library: string) => ({
  type: 'MAP/UPDATE_OVERLAYS',
  payload: { overlayId, library },
}));
const mockTrackMatomoEvent = jest.fn();
const mockGetDistance = jest.fn();
const mockUseIsFocused = jest.fn();
const mockUseReloader = jest.fn();
const mockConfigGet = jest.fn();
const mockWMSOverlay = jest.fn((props) => (
  <Text testID={`wms-overlay-${props.library}`}>wms</Text>
));
const mockTimeseriesOverlay = jest.fn((props) => (
  <Text testID={`timeseries-overlay-${props.library}`}>timeseries</Text>
));
const mockMapControls = jest.fn(() => <Text testID="map-controls">controls</Text>);

const mockMapRefApi = {
  getBounds: jest.fn(),
  getZoom: jest.fn(),
};

const mockCameraRefApi = {
  flyTo: jest.fn(),
  zoomTo: jest.fn(),
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
  updateRegion: jest.fn(() => ({ type: 'MAP/UPDATE_REGION' })),
  updateSelectedCallout: jest.fn(() => ({ type: 'MAP/UPDATE_SELECTED_CALLOUT' })),
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

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: 'en',
    },
  }),
}));

jest.mock('@components/map/layers/WMSOverlay', () => ({
  __esModule: true,
  default: (props: any) => mockWMSOverlay(props),
}));

jest.mock('@components/map/layers/TimeseriesOverlay', () => ({
  __esModule: true,
  default: (props: any) => mockTimeseriesOverlay(props),
}));

jest.mock('@components/map/ui/MapControls', () => ({
  __esModule: true,
  default: (props: any) => mockMapControls(props),
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: ({ name, size }: any) => {
    const { Text: MockText } = require('react-native');
    return <MockText testID={`icon-${name}`}>{size ?? 'icon'}</MockText>;
  },
}));

jest.mock('moment', () => ({
  tz: {
    setDefault: jest.fn(),
  },
}));

jest.mock('@maplibre/maplibre-react-native', () => {
  const MockReact = require('react');
  const { View } = require('react-native');

  const Map = MockReact.forwardRef((props: any, ref: any) => {
    lastMapProps = props;
    MockReact.useImperativeHandle(ref, () => mockMapRefApi);
    return (
      <View testID="maplibre-map">
        {props.children}
      </View>
    );
  });

  const Camera = MockReact.forwardRef((props: any, ref: any) => {
    MockReact.useImperativeHandle(ref, () => mockCameraRefApi);
    return <View testID="maplibre-camera">{props.children}</View>;
  });

  const ViewAnnotation = ({ children }: any) => (
    <View testID="view-annotation">{children}</View>
  );

  return {
    Map,
    Camera,
    ViewAnnotation,
  };
});

const createStore = (state: any) => ({
  getState: () => state,
  dispatch: jest.fn(),
  subscribe: () => () => {},
});

describe('MlMapView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    lastMapProps = undefined;
    mockMapRefApi.getBounds.mockResolvedValue([23, 59, 25, 61]);
    mockMapRefApi.getZoom.mockResolvedValue(8);
    mockUseIsFocused.mockReturnValue(true);
    mockUseReloader.mockReturnValue({ shouldReload: 0 });
    mockGetDistance.mockReturnValue(5000);
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'map') {
        return {
          updateInterval: 5,
          baseMap: {
            url: 'https://maps.example/',
            darkStyle: 'dark',
            lightStyle: 'light',
          },
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

  it('dispatches overlay update and renders WMS overlay after style is ready', async () => {
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
        <MlMapView
          infoSheetRef={infoSheetRef as any}
          mapLayersSheetRef={mapLayersSheetRef as any}
        />
      </Provider>
    );

    expect(mockUpdateOverlays).toHaveBeenCalledWith(3, 'maplibre');

    await act(async () => {
      lastMapProps.onDidFinishLoadingStyle();
      lastMapProps.onDidFinishRenderingFrameFully();
    });

    await waitFor(() => {
      expect(mockWMSOverlay).toHaveBeenCalledWith(
        expect.objectContaining({
          overlay: { type: 'WMS', step: 60 },
          library: 'maplibre',
        })
      );
    });
  });

  it('passes bounds to timeseries overlay and wires map controls actions', async () => {
    mockGetDistance.mockReturnValue(15000);

    const store = createStore({
      mock: {
        currentLocation: { lat: 60.1699, lon: 24.9384 },
        displayLocation: true,
        overlay: { type: 'Timeseries', step: 60 },
        activeOverlay: 3,
        timezone: 'Europe/Helsinki',
      },
    });

    const infoSheetRef = { current: { open: jest.fn() } };
    const mapLayersSheetRef = { current: { open: jest.fn() } };

    render(
      <Provider store={store as any}>
        <MlMapView
          infoSheetRef={infoSheetRef as any}
          mapLayersSheetRef={mapLayersSheetRef as any}
        />
      </Provider>
    );

    await act(async () => {
      lastMapProps.onDidFinishLoadingStyle();
      lastMapProps.onDidFinishRenderingFrameFully();
    });

    await act(async () => {
      lastMapProps.onRegionDidChange({
        nativeEvent: {
          zoom: 7,
          bounds: [23, 59, 25, 61],
          center: [25.2, 60.5],
        },
      });
    });

    expect(mockTimeseriesOverlay).toHaveBeenCalledWith(
      expect.objectContaining({
        overlay: { type: 'Timeseries', step: 60 },
        library: 'maplibre',
        mapBounds: [[25, 61], [23, 59]],
        zoom: 7,
      })
    );

    const controlsProps = mockMapControls.mock.calls.at(-1)?.[0];
    expect(controlsProps.showRelocateButton).toBe(true);

    await act(async () => {
      controlsProps.onZoomIn();
    });
    expect(mockCameraRefApi.zoomTo).toHaveBeenCalledWith(9);

    await act(async () => {
      controlsProps.relocate();
    });
    expect(mockCameraRefApi.flyTo).toHaveBeenCalledWith({
      center: [24.9384, 60.1699],
      zoom: 8,
      duration: 1000,
    });

    controlsProps.onInfoPressed();
    controlsProps.onLayersPressed();

    expect(infoSheetRef.current.open).toHaveBeenCalledTimes(1);
    expect(mapLayersSheetRef.current.open).toHaveBeenCalledTimes(1);
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Map',
      'Open info panel'
    );
  });
});
