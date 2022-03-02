import { Region } from 'react-native-maps';

export const UPDATE_SLIDER_TIME = 'UPDATE_SLIDER_TIME';
export const ANIMATE_TO_AREA = 'ANIMATE_TO_AREA';
export const UPDATE_MAP_LAYERS = 'UPDATE_MAP_LAYERS';
export const UPDATE_OVERLAYS = 'UPDATE_OVERLAYS';
export const UPDATE_ACTIVE_OVERLAY = 'UPDATE_ACTIVE_OVERLAY';
export const UPDATE_REGION = 'UPDATE_REGION';

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

interface InitializeOverlays {
  type: typeof UPDATE_OVERLAYS;
  overlays: Map<number, MapOverlay>;
}

interface UpdateActiveOverlay {
  type: typeof UPDATE_ACTIVE_OVERLAY;
  activeId: number;
}

interface UpdateRegion {
  type: typeof UPDATE_REGION;
  region: Region;
}

export type MapActionTypes =
  | UpdateSliderTime
  | AnimateToArea
  | UpdateMapLayers
  | InitializeOverlays
  | UpdateActiveOverlay
  | UpdateRegion;

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
  customParameters?: { [key: string]: number | string };
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
}

export interface MapState {
  mapLayers: MapLayers;
  sliderTime: number;
  animateToArea: boolean;
  overlays: Map<number, MapOverlay> | undefined;
  activeOverlay: number | undefined;
  region: Region;
}
