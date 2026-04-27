import reducer from '@store/map/reducer';
import * as actions from '@store/map/actions';
import * as selectors from '@store/map/selectors';
import * as types from '@store/map/types';

const mockConfigGet = jest.fn();
const mockGetOverlayData = jest.fn();

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('@utils/map', () => ({
  getOverlayData: (...args: any[]) => mockGetOverlayData(...args),
}));

describe('map reducer', () => {
  const initial: types.MapState = {
    mapLayers: {
      location: true,
      weather: true,
      radar: false,
    },
    sliderTime: 0,
    animateToArea: false,
    overlays: undefined,
    overlaysError: false,
    activeOverlay: undefined,
    region: { latitude: 0, longitude: 0, longitudeDelta: 0, latitudeDelta: 0 },
    selectedCallout: undefined,
    animationSpeed: 80,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfigGet.mockReturnValue({
      layers: [{ id: 42 }],
    });
  });

  it('should handle ANIMATE_TO_AREA', () => {
    expect(
      reducer(undefined, {
        type: types.ANIMATE_TO_AREA,
        animate: true,
      })
    ).toEqual({
      ...initial,
      animateToArea: true,
    });
  });

  it('should handle UPDATE_SLIDER_TIME', () => {
    expect(
      reducer(initial, {
        type: types.UPDATE_SLIDER_TIME,
        time: 1618208990,
      })
    ).toEqual({ ...initial, sliderTime: 1618208990 });
  });

  it('should handle UPDATE_MAP_LAYERS', () => {
    expect(
      reducer(initial, {
        type: types.UPDATE_MAP_LAYERS,
        layers: {
          location: true,
          weather: true,
          radar: false,
        },
      })
    ).toEqual({
      ...initial,
      mapLayers: {
        location: true,
        weather: true,
        radar: false,
      },
    });
  });

  it('should handle INITIALIZE_OVERLAYS', () => {
    const overlayMap = new Map([[1, dummyOverlay]]);

    expect(
      reducer({ ...initial, sliderTime: 123 }, {
        type: types.UPDATE_OVERLAYS_SUCCESS,
        overlays: overlayMap,
      })
    ).toEqual({
      ...initial,
      overlays: overlayMap,
      sliderTime: 0,
    });
  });

  it('should handle UPDATE_OVERLAYS and UPDATE_OVERLAYS_ERROR', () => {
    expect(
      reducer({ ...initial, overlaysError: 'failed' }, {
        type: types.UPDATE_OVERLAYS,
      })
    ).toEqual({
      ...initial,
      overlaysError: false,
    });

    expect(
      reducer({ ...initial, overlays: new Map([[1, dummyOverlay]]), sliderTime: 100 }, {
        type: types.UPDATE_OVERLAYS_ERROR,
        error: { code: 500, message: 'failed' },
      })
    ).toEqual({
      ...initial,
      overlays: undefined,
      overlaysError: { code: 500, message: 'failed' },
      sliderTime: 0,
    });
  });

  it('should handle UPDATE_ACTIVE_OVERLAY, UPDATE_REGION and UPDATE_ANIMATION_SPEED', () => {
    const region = {
      latitude: 60,
      latitudeDelta: 1,
      longitude: 24,
      longitudeDelta: 1,
    };

    expect(
      reducer({ ...initial, sliderTime: 50 }, {
        type: types.UPDATE_ACTIVE_OVERLAY,
        activeId: 3,
      })
    ).toEqual({
      ...initial,
      activeOverlay: 3,
      sliderTime: 0,
    });

    expect(
      reducer(initial, {
        type: types.UPDATE_REGION,
        region,
      })
    ).toEqual({
      ...initial,
      region,
    });

    expect(
      reducer(initial, {
        type: types.UPDATE_ANIMATION_SPEED,
        speed: 120,
      })
    ).toEqual({
      ...initial,
      animationSpeed: 120,
    });
  });

  it('should handle UPDATE_SELECTED_CALLOUT', () => {
    expect(
      reducer(initial, {
        type: types.UPDATE_SELECTED_CALLOUT,
        selectedCallout: 'Test',
      })
    ).toEqual({
      ...initial,
      selectedCallout: 'Test',
    });
  });

  it('selects map state and default active overlay from config', () => {
    const overlayMap = new Map([[42, dummyOverlay]]);
    const state = {
      map: {
        ...initial,
        overlays: overlayMap,
        overlaysError: false,
        selectedCallout: 'callout',
      },
    } as any;

    expect(selectors.selectSliderTime(state)).toBe(0);
    expect(selectors.selectAnimateToArea(state)).toBe(false);
    expect(selectors.selectMapLayers(state)).toBe(initial.mapLayers);
    expect(selectors.selectDisplayLocation(state)).toBe(true);
    expect(selectors.selectActiveOverlay(state)).toBe(42);
    expect(selectors.selectOverlay(state)).toBe(dummyOverlay);
    expect(selectors.selectOverlaysError(state)).toBe(false);
    expect(selectors.selectRegion(state)).toEqual(initial.region);
    expect(selectors.selectSelectedCallout(state)).toBe('callout');
    expect(selectors.selectAnimationSpeed(state)).toBe(80);
  });

  it('selects explicitly active overlay over config default', () => {
    const overlayMap = new Map([
      [1, dummyOverlay],
      [2, { ...dummyOverlay, step: 2 }],
    ]);
    const state = {
      map: {
        ...initial,
        activeOverlay: 2,
        overlays: overlayMap,
      },
    } as any;

    expect(selectors.selectActiveOverlay(state)).toBe(2);
    expect(selectors.selectOverlay(state)).toEqual({ ...dummyOverlay, step: 2 });
  });

  it('dispatches synchronous map actions', () => {
    const dispatch = jest.fn();
    const layers = { location: false, radar: true, weather: true };
    const region = {
      latitude: 60,
      latitudeDelta: 1,
      longitude: 24,
      longitudeDelta: 1,
    };

    actions.updateSliderTime(123)(dispatch);
    actions.setAnimateToArea(true)(dispatch);
    actions.updateMapLayers(layers)(dispatch);
    actions.updateActiveOverlay(5)(dispatch);
    actions.updateRegion(region)(dispatch);
    actions.updateSelectedCallout('callout')(dispatch);
    actions.updateAnimationSpeed(100)(dispatch);

    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_SLIDER_TIME,
      time: 123,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.ANIMATE_TO_AREA,
      animate: true,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_MAP_LAYERS,
      layers,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_ACTIVE_OVERLAY,
      activeId: 5,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_REGION,
      region,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_SELECTED_CALLOUT,
      selectedCallout: 'callout',
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_ANIMATION_SPEED,
      speed: 100,
    });
  });

  it('dispatches overlay update success and error actions', async () => {
    const dispatch = jest.fn();
    const overlayMap = new Map([[1, dummyOverlay]]);
    mockGetOverlayData.mockResolvedValueOnce(overlayMap);

    actions.updateOverlays(1, 'maplibre')(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({ type: types.UPDATE_OVERLAYS });
    expect(mockGetOverlayData).toHaveBeenCalledWith(1, 'maplibre');
    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_OVERLAYS_SUCCESS,
      overlays: overlayMap,
    });

    const error = { code: 500, message: 'failed' };
    mockGetOverlayData.mockRejectedValueOnce(error);
    actions.updateOverlays(2, 'react-native-maps')(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_OVERLAYS_ERROR,
      error,
    });
  });
});

const dummyOverlay = {
  forecast: {
    start: '2021-01-01T01:00:00Z',
    styles: '',
    url: 'example.test.forecast',
  } as types.Layer,
  observation: {
    styles: { dark: '', light: 'style' },
    url: 'example.test.observation',
  } as types.Layer,
  step: 1,
  type: 'WMS',
} as types.MapOverlay;

const flushPromises = () => new Promise(process.nextTick);
