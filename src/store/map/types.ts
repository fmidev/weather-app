export const UPDATE_SLIDER_TIME = 'UPDATE_SLIDER_TIME';
export const UPDATE_SLIDER_STEP = 'UPDATE_SLIDER_STEP';
export const ANIMATE_TO_AREA = 'ANIMATE_TO_AREA';
export const UPDATE_MAP_LAYERS = 'UPDATE_MAP_LAYERS';
export const INITIALIZE_OVERLAYS = 'INITIALIZE_OVERLAYS';
export const UPDATE_ACTIVE_OVERLAY = 'UPDATE_ACTIVE_OVERLAY';
export const UPDATE_IS_OBSERVATION = 'UPDATE_IS_OBSERVATION';

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

interface InitializeOverlays {
  type: typeof INITIALIZE_OVERLAYS;
  overlays: Map<number, MapOverlay>;
}

interface UpdateActiveOverlay {
  type: typeof UPDATE_ACTIVE_OVERLAY;
  activeId: number;
}

interface UpdateIsObservation {
  type: typeof UPDATE_IS_OBSERVATION;
  value: boolean;
}

export type MapActionTypes =
  | UpdateSliderTime
  | UpdateSliderStep
  | AnimateToArea
  | UpdateMapLayers
  | InitializeOverlays
  | UpdateActiveOverlay
  | UpdateIsObservation;

export interface MapLayers {
  location: boolean;
  weather: boolean;
  radar: boolean;
}

export interface Layer {
  url: string | undefined;
  bounds: { [key: string]: [number, number] } | undefined;
  start?: string;
  end?: string;
}

export interface MapOverlay {
  observation?: Layer;
  forecast?: Layer;
}
export interface MapState {
  mapLayers: MapLayers;
  sliderTime: number;
  sliderStep: number;
  animateToArea: boolean;
  overlays: Map<number, MapOverlay> | undefined;
  activeOverlay: number;
  isObservation: boolean;
}
