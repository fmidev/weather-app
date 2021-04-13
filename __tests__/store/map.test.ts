import reducer from '../../src/store/map/reducer';
import * as types from '../../src/store/map/types';

describe('map reducer', () => {
  const initial: types.MapState = {
    mapLayers: {
      userLocation: false,
      weather: true,
      radar: false,
    },
    sliderTime: 0,
    sliderStep: 60,
    animateToArea: false,
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
          userLocation: true,
          weather: true,
          radar: false,
        },
      })
    ).toEqual({
      ...initial,
      mapLayers: {
        userLocation: true,
        weather: true,
        radar: false,
      },
    });
  });
});
