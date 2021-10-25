import moment from 'moment';
import reducer from '../../src/store/map/reducer';
import * as types from '../../src/store/map/types';

describe('map reducer', () => {
  const sliderTime = moment.utc().startOf('hour').unix();
  const initial: types.MapState = {
    mapLayers: {
      location: false,
      weather: true,
      radar: false,
    },
    sliderTime,
    sliderStep: 60,
    animateToArea: false,
    overlays: undefined,
    activeOverlay: 0,
  };

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

  it('should handle UPDATE_SLIDER_STEP', () => {
    expect(
      reducer(initial, {
        type: types.UPDATE_SLIDER_STEP,
        step: 15,
      })
    ).toEqual({ ...initial, sliderStep: 15 });
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
    const dummyOverlay = {
      observation: {
        url: 'example.test.observation',
        bounds: {
          bottomLeft: [12, 13],
          bottomRight: [12, 16],
          topLeft: [14, 13],
          topRight: [14, 16],
        },
      },
      forecast: {
        url: 'example.test.forecast',
        bounds: {
          bottomLeft: [12, 13],
          bottomRight: [12, 16],
          topLeft: [14, 13],
          topRight: [14, 16],
        },
        start: '2021-01-01T01:00:00Z',
      },
    } as types.MapOverlay;

    const overlayMap = new Map([[1, dummyOverlay]]);

    expect(
      reducer(initial, {
        type: types.INITIALIZE_OVERLAYS,
        overlays: overlayMap,
      })
    ).toEqual({
      ...initial,
      overlays: overlayMap,
    });
  });
});
