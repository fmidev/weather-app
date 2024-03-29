import { Region } from 'react-native-maps';

export const UPDATE_SLIDER_TIME = 'UPDATE_SLIDER_TIME';
export const ANIMATE_TO_AREA = 'ANIMATE_TO_AREA';
export const UPDATE_MAP_LAYERS = 'UPDATE_MAP_LAYERS';
export const UPDATE_OVERLAYS = 'UPDATE_OVERLAYS';
export const UPDATE_OVERLAYS_SUCCESS = 'UPDATE_OVERLAYS_SUCCESS';
export const UPDATE_OVERLAYS_ERROR = 'UPDATE_OVERLAYS_ERROR';
export const UPDATE_ACTIVE_OVERLAY = 'UPDATE_ACTIVE_OVERLAY';
export const UPDATE_REGION = 'UPDATE_REGION';
export const UPDATE_SELECTED_CALLOUT = 'UPDATE_SELECTED_CALLOUT';

interface UpdateSliderTime {
  type: typeof UPDATE_SLIDER_TIME;
  time: number;
}

interface AnimateToArea {
  type: typeof ANIMATE_TO_AREA;
  animate: boolean;
}

interface UpdateMapLayers {
  type: typeof UPDATE_MAP_LAYERS;
  layers: MapLayers;
}

interface UpdateOverlays {
  type: typeof UPDATE_OVERLAYS;
}
interface UpdateOverlaysSuccess {
  type: typeof UPDATE_OVERLAYS_SUCCESS;
  overlays: Map<number, MapOverlay>;
}

interface UpdateOverlaysError {
  type: typeof UPDATE_OVERLAYS_ERROR;
  error: Error;
}

interface UpdateActiveOverlay {
  type: typeof UPDATE_ACTIVE_OVERLAY;
  activeId: number;
}

interface UpdateRegion {
  type: typeof UPDATE_REGION;
  region: Region;
}

interface UpdateSelectedCallout {
  type: typeof UPDATE_SELECTED_CALLOUT;
  selectedCallout: string | undefined;
}

export type MapActionTypes =
  | UpdateSliderTime
  | AnimateToArea
  | UpdateMapLayers
  | UpdateOverlays
  | UpdateOverlaysSuccess
  | UpdateOverlaysError
  | UpdateActiveOverlay
  | UpdateRegion
  | UpdateSelectedCallout;

export interface MapLayers {
  location: boolean;
  weather: boolean;
  radar: boolean;
}

export interface Layer {
  url: string | undefined;
  start?: string;
  end?: string;
  styles: string | { dark: string; light: string };
}

export interface TimeseriesLayer {
  start?: string;
  end?: string;
}

export type WeatherData = {
  epochtime: number;
  [param: string]: number;
};

export type TimeseriesData = {
  [latlon: string]: {
    [population: string]: {
      [name: string]: WeatherData[];
    };
  };
};

export interface MapOverlay {
  type: 'WMS' | 'Timeseries';
  observation?: Layer | TimeseriesLayer;
  forecast?: Layer | TimeseriesLayer;
  data?: TimeseriesData[];
  step: number;
  tileSize?: number;
}

export interface Error {
  code: number;
  message: string;
}

export interface MapState {
  mapLayers: MapLayers;
  sliderTime: number;
  animateToArea: boolean;
  overlays: Map<number, MapOverlay> | undefined;
  overlaysError: boolean | Error | string;
  activeOverlay: number | undefined;
  region: Region;
  selectedCallout: string | undefined;
}
