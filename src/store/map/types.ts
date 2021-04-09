export const UPDATE_SLIDER_TIME = 'UPDATE_SLIDER_TIME';
export const UPDATE_SLIDER_STEP = 'UPDATE_SLIDER_STEP';
export const ANIMATE_TO_AREA = 'ANIMATE_TO_AREA';
export const UPDATE_MAP_LAYERS = 'UPDATE_MAP_LAYERS';

interface UpdateSliderTime {
  type: typeof UPDATE_SLIDER_TIME;
  time: number;
}

interface UpdateSliderStep {
  type: typeof UPDATE_SLIDER_STEP;
  step: number;
}

interface AnimateToArea {
  type: typeof ANIMATE_TO_AREA;
  animate: boolean;
}

interface UpdateMapLayers {
  type: typeof UPDATE_MAP_LAYERS;
  layers: MapLayers;
}

export type MapActionTypes =
  | UpdateSliderTime
  | UpdateSliderStep
  | AnimateToArea
  | UpdateMapLayers;

export interface MapLayers {
  userLocation: boolean;
  weather: boolean;
  radar: boolean;
}

export interface MapState {
  mapLayers: MapLayers;
  sliderTime: number;
  sliderStep: 15 | 30 | 60;
  animateToArea: boolean;
}
