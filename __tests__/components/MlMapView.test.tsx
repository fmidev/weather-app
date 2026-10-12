import React from 'react';
import { Text } from 'react-native';
import { act, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import MlMapView from '../../src/components/map/maps/MlMapView';
import getMapStyle from '@network/MapStyleApi';
import type { StyleSpecification } from '@maplibre/maplibre-react-native';

jest.mock('@network/MapStyleApi', () => ({ __esModule: true, default: jest.fn() }));
const mockGetMapStyle = jest.mocked(getMapStyle);
const mockAppearance = { dark: false, language: 'en' };
const baseStyle: StyleSpecification = {
  version: 8,
  sources: { vector: { type: 'vector', url: 'https://maps.example/tiles.json' } },
  layers: [{ id: 'earth', type: 'fill', source: 'vector', 'source-layer': 'earth' }],
};
const overlayStyle: StyleSpecification = {
  ...baseStyle,
  layers: [
    { id: 'roads', type: 'line', source: 'vector', 'source-layer': 'roads' },
    { id: 'places', type: 'symbol', source: 'vector', 'source-layer': 'places' },
  ],
};

const mockSelectCurrent = jest.fn((state: any) => state.mock.currentLocation);
const mockSelectTimeZone = jest.fn((state: any) => state.mock.timezone);
const mockSelectDisplayLocation = jest.fn((state: any) => state.mock.displayLocation);
const mockSelectOverlay = jest.fn((state: any) => state.mock.overlay);
const mockSelectActiveOverlay = jest.fn((state: any) => state.mock.activeOverlay);
const mockSelectAnimateToArea = jest.fn((state: any) => state.mock.animateToArea ?? false);
const mockSetAnimateToArea = jest.fn((animate: boolean) => ({ type: 'ANIMATE_TO_AREA', animate }));
const mockSelectSessionId = jest.fn((state: any) => state.mock.sessionId);
const mockUpdateOverlays = jest.fn((...args: any[]) => ({
  type: 'MAP/UPDATE_OVERLAYS',
  payload: { overlayId: args[0], library: args[1] },
}));
const mockTrackMatomoEvent = jest.fn();
const mockGetDistance = jest.fn();
const mockUseIsFocused = jest.fn();
const mockUseReloader = jest.fn();
const mockConfigGet = jest.fn();
const mockAddHeader = jest.fn();
const mockRemoveHeader = jest.fn();
const mockWMSOverlay = jest.fn((props) => (
  <Text testID={`wms-overlay-${props.library}`}>wms</Text>
));
const mockTimeseriesOverlay = jest.fn((props) => (
  <Text testID={`timeseries-overlay-${props.library}`}>timeseries</Text>
));
const mockMapControls = jest.fn<any, any[]>(() => (
  <Text testID="map-controls">controls</Text>
));

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
  selectAnimateToArea: (state: any) => mockSelectAnimateToArea(state),
}));

jest.mock('@store/settings/selectors', () => ({
  selectSessionId: (state: any) => mockSelectSessionId(state),
}));

jest.mock('@store/map/actions', () => ({
  updateOverlays: (...args: any[]) => mockUpdateOverlays(...args),
  updateRegion: jest.fn(() => ({ type: 'MAP/UPDATE_REGION' })),
  updateSelectedCallout: jest.fn(() => ({ type: 'MAP/UPDATE_SELECTED_CALLOUT' })),
  setAnimateToArea: (animate: boolean) => mockSetAnimateToArea(animate),
}));

jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: (...args: any[]) => mockTrackMatomoEvent(...args),
}));

jest.mock('geolib', () => ({
  getDistance: (...args: any[]) => mockGetDistance(...args),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    dark: mockAppearance.dark,
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
      language: mockAppearance.language,
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
    TransformRequestManager: {
      addHeader: (...args: any[]) => mockAddHeader(...args),
      removeHeader: (...args: any[]) => mockRemoveHeader(...args),
    },
  };
});

const createStore = (state: any) => ({
  getState: () => state,
  dispatch: jest.fn(),
  subscribe: () => () => {},
});

const configureStyleOverlay = () => {
  const originalConfig = mockConfigGet.getMockImplementation()!;
  mockConfigGet.mockImplementation((key: string) => (key === 'map' ? {
    ...originalConfig(key),
    baseMap: { url: 'https://maps.example/', lightStyle: 'base_light_{lang}.json', darkStyle: 'base_dark_{lang}.json' },
    overlayMap: { url: 'https://maps.example/', lightStyle: 'overlay_light_{lang}.json', darkStyle: 'overlay_dark_{lang}.json' },
  } : originalConfig(key)));
};
const renderStyleMap = () => {
  const store = createStore({ mock: {
    currentLocation: { lat: 60.17, lon: 24.94 }, displayLocation: false,
    overlay: { type: 'WMS', step: 60 }, activeOverlay: undefined,
    timezone: 'Europe/Helsinki', sessionId: 123,
  } });
  const element = () => <Provider store={store as any}>
    <MlMapView infoSheetRef={{ current: null }} mapLayersSheetRef={{ current: null }} />
  </Provider>;
  const screen = render(element());
  return { ...screen, refresh: () => screen.rerender(element()) };
};

describe('MlMapView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppearance.dark = false;
    mockAppearance.language = 'en';
    mockGetMapStyle.mockImplementation(async (url) => (url.includes('/overlay_') ? overlayStyle : baseStyle));
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

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('dispatches overlay update and renders WMS overlay after style is ready', async () => {
    const store = createStore({
      mock: {
        currentLocation: { lat: 60.1699, lon: 24.9384 },
        displayLocation: true,
        overlay: { type: 'WMS', step: 60 },
        activeOverlay: 3,
        timezone: 'Europe/Helsinki',
        sessionId: 1234567,
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
    expect(mockAddHeader).toHaveBeenCalledWith({
      id: 'smartmet-session-cookie',
      match: '(?i)(?:[?&])request=GetMap(?:&|$)',
      name: 'Cookie',
      value: 'smartmet-session-id=1234567',
    });
    expect(mockAddHeader).toHaveBeenCalledTimes(1);

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

  it('adds source-specific API keys only to matching WMS GetMap requests', () => {
    const mapConfig = {
      updateInterval: 5,
      sources: {
        smartmet: 'https://data.fmi.fi/api',
        geoserver: 'https://wms.fmi.fi/geoserver',
      },
      fmiApiKey: {
        smartmet: 'smartmet-key',
        geoserver: 'geoserver-key',
      },
      baseMap: {
        url: 'https://maps.example/',
        darkStyle: 'dark',
        lightStyle: 'light',
      },
    };
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'map') return mapConfig;
      if (key === 'location') {
        return { default: { lat: 60.1699, lon: 24.9384 } };
      }
      return {};
    });

    const store = createStore({
      mock: {
        currentLocation: undefined,
        displayLocation: false,
        overlay: undefined,
        activeOverlay: undefined,
        timezone: 'Europe/Helsinki',
        sessionId: 1234567,
      },
    });
    const { unmount } = render(
      <Provider store={store as any}>
        <MlMapView
          infoSheetRef={{ current: null }}
          mapLayersSheetRef={{ current: null }}
        />
      </Provider>
    );

    const headers = mockAddHeader.mock.calls.map(([header]) => header);
    expect(headers).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'fmi-apikey-smartmet',
        name: 'fmi-apikey',
        value: 'smartmet-key',
      }),
      expect.objectContaining({
        id: 'fmi-apikey-geoserver',
        name: 'fmi-apikey',
        value: 'geoserver-key',
      }),
    ]));

    const smartmetHeader = headers.find(({ id }) => id === 'fmi-apikey-smartmet');
    const geoserverHeader = headers.find(({ id }) => id === 'fmi-apikey-geoserver');
    const matches = (header: { match: string }, url: string) =>
      new RegExp(header.match.replace(/^\(\?i\)/, ''), 'i').test(url);

    expect(matches(smartmetHeader, 'https://data.fmi.fi/api/wms?service=WMS&request=GetMap')).toBe(true);
    expect(matches(smartmetHeader, 'https://wms.fmi.fi/geoserver/wms?request=GetMap')).toBe(false);
    expect(matches(smartmetHeader, 'https://data.fmi.fi/api/wms?request=GetCapabilities')).toBe(false);
    expect(matches(smartmetHeader, 'https://dataXfmiXfi/api/wms?request=GetMap')).toBe(false);
    expect(matches(geoserverHeader, 'https://wms.fmi.fi/geoserver/wms?REQUEST=GETMAP')).toBe(true);
    expect(matches(geoserverHeader, 'https://data.fmi.fi/api/wms?request=GetMap')).toBe(false);

    unmount();
    expect(mockRemoveHeader).toHaveBeenCalledWith('fmi-apikey-smartmet');
    expect(mockRemoveHeader).toHaveBeenCalledWith('fmi-apikey-geoserver');
  });

  it('updates overlays when the update interval has elapsed', () => {
    jest
      .spyOn(Date, 'now')
      .mockReturnValueOnce(1_000_000)
      .mockReturnValueOnce(1_000_000)
      .mockReturnValue(1_060_000);
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'map') {
        return {
          updateInterval: 1,
          baseMap: {
            url: 'https://maps.example/',
            darkStyle: 'dark',
            lightStyle: 'light',
          },
        };
      }
      if (key === 'location') {
        return { default: { lat: 60.1699, lon: 24.9384 } };
      }
      return {};
    });

    const store = createStore({
      mock: {
        currentLocation: undefined,
        displayLocation: false,
        overlay: { type: 'WMS', step: 60 },
        activeOverlay: 3,
        timezone: 'Europe/Helsinki',
        sessionId: 1234567,
      },
    });

    render(
      <Provider store={store as any}>
        <MlMapView
          infoSheetRef={{ current: null }}
          mapLayersSheetRef={{ current: null }}
        />
      </Provider>
    );

    expect(mockUpdateOverlays).toHaveBeenCalledTimes(2);
    expect(mockUpdateOverlays).toHaveBeenLastCalledWith(3, 'maplibre');
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
        sessionId: 1234567,
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

    const controlsProps = mockMapControls.mock.calls.at(-1)?.[0] as any;
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

  it('removes the WMS session cookie header on unmount', () => {
    const store = createStore({
      mock: {
        currentLocation: { lat: 60.1699, lon: 24.9384 },
        displayLocation: true,
        overlay: undefined,
        activeOverlay: undefined,
        timezone: 'Europe/Helsinki',
        sessionId: 7654321,
      },
    });

    const { unmount } = render(
      <Provider store={store as any}>
        <MlMapView
          infoSheetRef={{ current: null }}
          mapLayersSheetRef={{ current: null }}
        />
      </Provider>
    );

    unmount();

    expect(mockRemoveHeader).toHaveBeenCalledWith('smartmet-session-cookie');
  });

  it('uses the base URL directly without overlayMap and does not fetch JSON styles', () => {
    renderStyleMap();
    expect(lastMapProps.mapStyle).toBe('https://maps.example/light');
    expect(mockGetMapStyle).not.toHaveBeenCalled();
    act(() => lastMapProps.onDidFinishLoadingStyle());
    expect(mockWMSOverlay).toHaveBeenLastCalledWith(expect.objectContaining({ beforeId: 'places_region' }));
  });

  it('combines base and overlay layers and inserts WMS below every overlay layer after style loading', async () => {
    configureStyleOverlay();
    const screen = renderStyleMap();
    act(() => lastMapProps.onDidFinishLoadingStyle());
    expect(screen.queryByTestId('wms-overlay-maplibre')).toBeNull();
    await act(async () => {});
    await waitFor(() => expect(lastMapProps.mapStyle.layers?.map((layer: any) => layer.id)).toEqual(['earth', 'roads', 'places']));
    expect(mockGetMapStyle).toHaveBeenCalledWith('https://maps.example/base_light_en.json');
    expect(mockGetMapStyle).toHaveBeenCalledWith('https://maps.example/overlay_light_en.json');
    expect(screen.queryByTestId('wms-overlay-maplibre')).toBeNull();
    act(() => lastMapProps.onDidFinishLoadingStyle());
    expect(mockWMSOverlay).toHaveBeenLastCalledWith(expect.objectContaining({ beforeId: 'roads' }));
    expect(Object.keys(lastMapProps.mapStyle.sources)).toEqual(['vector']);
  });

  it('reloads themed and localized styles without resetting the camera and waits for each new style', async () => {
    configureStyleOverlay();
    const screen = renderStyleMap();
    await act(async () => {});
    await waitFor(() => expect(lastMapProps.mapStyle.layers).toBeDefined());
    await act(async () => {
      lastMapProps.onDidFinishLoadingStyle();
      lastMapProps.onDidFinishRenderingFrameFully();
    });
    const initialCamera = lastMapProps.children[0].props.initialViewState;
    const initialFlyCount = mockCameraRefApi.flyTo.mock.calls.length;
    const initialStyle = lastMapProps.mapStyle;
    mockAppearance.dark = true;
    mockAppearance.language = 'fi';
    screen.refresh();
    expect(screen.queryByTestId('wms-overlay-maplibre')).toBeNull();
    await act(async () => {});
    await waitFor(() => expect(lastMapProps.mapStyle).not.toBe(initialStyle));
    expect(mockGetMapStyle).toHaveBeenCalledWith('https://maps.example/base_dark_fi.json');
    expect(mockGetMapStyle).toHaveBeenCalledWith('https://maps.example/overlay_dark_fi.json');
    expect(lastMapProps.children[0].props.initialViewState).toBe(initialCamera);
    expect(mockCameraRefApi.flyTo).toHaveBeenCalledTimes(initialFlyCount);
    expect(screen.queryByTestId('wms-overlay-maplibre')).toBeNull();
    act(() => lastMapProps.onDidFinishLoadingStyle());
    expect(screen.getByTestId('wms-overlay-maplibre')).toBeTruthy();
  });

  it('ignores an old style request completing after a newer locale has loaded', async () => {
    configureStyleOverlay();
    let resolveOld!: (style: StyleSpecification) => void;
    mockGetMapStyle.mockReturnValueOnce(new Promise((resolve) => { resolveOld = resolve; }));
    const screen = renderStyleMap();
    mockAppearance.language = 'fi';
    screen.refresh();
    await act(async () => {});
    await waitFor(() => expect(lastMapProps.mapStyle.layers).toBeDefined());
    const latestStyle = lastMapProps.mapStyle;
    await act(async () => resolveOld({ ...baseStyle, layers: [{ id: 'old-base', type: 'background' }] }));
    expect(lastMapProps.mapStyle).toBe(latestStyle);
    expect(lastMapProps.mapStyle.layers[0].id).toBe('earth');
  });

  it.each(['overlay', 'base'])('falls back to the base map and keeps WMS usable after %s loading fails', async (failed) => {
    configureStyleOverlay();
    mockGetMapStyle.mockImplementation(async (url) => {
      if (url.includes(`/${failed}_`)) throw new Error('Style unavailable');
      return url.includes('/overlay_') ? overlayStyle : baseStyle;
    });
    renderStyleMap();
    await act(async () => {});
    expect(lastMapProps.mapStyle).toEqual(failed === 'overlay' ? baseStyle : 'https://maps.example/base_light_en.json');
    act(() => lastMapProps.onDidFinishLoadingStyle());
    expect(mockWMSOverlay).toHaveBeenLastCalledWith(expect.objectContaining({ beforeId: failed === 'overlay' ? null : 'places_region' }));
  });

  it('falls back to the base map when global style resources cannot be merged', async () => {
    configureStyleOverlay();
    mockGetMapStyle.mockImplementation(async (url) => (url.includes('/overlay_')
      ? { ...overlayStyle, glyphs: 'https://other.example/fonts/{fontstack}/{range}.pbf' }
      : { ...baseStyle, glyphs: 'https://maps.example/fonts/{fontstack}/{range}.pbf' }));
    renderStyleMap();
    await act(async () => {});
    expect(lastMapProps.mapStyle.layers.map((layer: any) => layer.id)).toEqual(['earth']);
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith('Error', 'Map', expect.stringContaining('Map style merge failed'));
    act(() => lastMapProps.onDidFinishLoadingStyle());
    expect(mockWMSOverlay).toHaveBeenLastCalledWith(expect.objectContaining({ beforeId: null }));
  });

  it('returns to the base URL when overlayMap is removed', async () => {
    configureStyleOverlay();
    const screen = renderStyleMap();
    await act(async () => {});
    expect(lastMapProps.mapStyle.layers).toHaveLength(3);
    act(() => lastMapProps.onDidFinishLoadingStyle());
    const previousConfig = mockConfigGet.getMockImplementation()!;
    mockConfigGet.mockImplementation((key: string) => ({ ...previousConfig(key), ...(key === 'map' ? { overlayMap: undefined } : {}) }));
    screen.refresh();
    expect(lastMapProps.mapStyle).toBe('https://maps.example/base_light_en.json');
    expect(screen.queryByTestId('wms-overlay-maplibre')).toBeNull();
    act(() => lastMapProps.onDidFinishLoadingStyle());
    expect(mockWMSOverlay).toHaveBeenLastCalledWith(expect.objectContaining({ beforeId: 'places_region' }));
    expect(mockGetMapStyle).toHaveBeenCalledTimes(2);
  });

  it('ignores styles completing after the map unmounts', async () => {
    configureStyleOverlay();
    let resolveStyle!: (style: StyleSpecification) => void;
    mockGetMapStyle.mockReturnValueOnce(new Promise((resolve) => { resolveStyle = resolve; }));
    const screen = renderStyleMap();
    const initialProps = lastMapProps;
    screen.unmount();
    await act(async () => resolveStyle(baseStyle));
    expect(lastMapProps).toBe(initialProps);
    expect(mockWMSOverlay).not.toHaveBeenCalled();
  });

  it.each(['overlay load failure', 'merge failure', 'empty overlay'])(
    'retains the base label boundary after %s', async (scenario) => {
      configureStyleOverlay();
      const labeledBase: StyleSpecification = {
        ...baseStyle,
        glyphs: 'https://maps.example/fonts/{fontstack}/{range}.pbf',
        layers: [...baseStyle.layers, {
          id: 'places_region', type: 'symbol', source: 'vector', 'source-layer': 'places',
        }],
      };
      mockGetMapStyle.mockImplementation(async (url) => {
        if (!url.includes('/overlay_')) return labeledBase;
        if (scenario === 'overlay load failure') throw new Error('Style unavailable');
        if (scenario === 'merge failure') return { ...overlayStyle, glyphs: 'https://other.example/fonts/{fontstack}/{range}.pbf' };
        return { version: 8, sources: {}, layers: [] };
      });
      renderStyleMap();
      await act(async () => {});
      act(() => lastMapProps.onDidFinishLoadingStyle());
      expect(mockWMSOverlay).toHaveBeenLastCalledWith(expect.objectContaining({ beforeId: 'places_region' }));
    }
  );

  it('centers repeated requests at the unchanged location once each and consumes them', async () => {
    const state = { mock: {
      currentLocation: { lat: 60.17, lon: 24.94 }, displayLocation: false,
      overlay: undefined, activeOverlay: undefined, timezone: 'Europe/Helsinki', sessionId: 123,
      animateToArea: false,
    } };
    const element = () => <Provider store={createStore(state) as any}>
      <MlMapView infoSheetRef={{ current: null }} mapLayersSheetRef={{ current: null }} />
    </Provider>;
    const screen = render(element());
    await act(async () => lastMapProps.onDidFinishRenderingFrameFully());
    mockCameraRefApi.flyTo.mockClear();

    for (let request = 0; request < 2; request += 1) {
      state.mock.animateToArea = true;
      screen.rerender(element());
      expect(mockSetAnimateToArea).toHaveBeenLastCalledWith(false);
      state.mock.animateToArea = false;
      screen.rerender(element());
      expect(mockCameraRefApi.flyTo).toHaveBeenCalledTimes(request + 1);
    }
    expect(mockCameraRefApi.flyTo).toHaveBeenLastCalledWith({ center: [24.94, 60.17], zoom: 8, duration: 1000 });
  });

  it('waits until the map is ready and focused before consuming a center request', async () => {
    mockUseIsFocused.mockReturnValue(false);
    const state = { mock: {
      currentLocation: { lat: 60.17, lon: 24.94 }, displayLocation: false,
      overlay: undefined, activeOverlay: undefined, timezone: 'Europe/Helsinki', sessionId: 123,
      animateToArea: true,
    } };
    const element = () => <Provider store={createStore(state) as any}>
      <MlMapView infoSheetRef={{ current: null }} mapLayersSheetRef={{ current: null }} />
    </Provider>;
    const screen = render(element());
    expect(mockSetAnimateToArea).not.toHaveBeenCalled();
    mockUseIsFocused.mockReturnValue(true);
    screen.rerender(element());
    expect(mockCameraRefApi.flyTo).not.toHaveBeenCalled();
    await act(async () => lastMapProps.onDidFinishRenderingFrameFully());
    expect(mockCameraRefApi.flyTo).toHaveBeenCalledTimes(1);
    expect(mockSetAnimateToArea).toHaveBeenCalledWith(false);
  });
});
