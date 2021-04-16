import { Dispatch } from 'redux';
import {
  MapLayers,
  MapActionTypes,
  UPDATE_SLIDER_TIME,
  UPDATE_SLIDER_STEP,
  ANIMATE_TO_AREA,
  UPDATE_MAP_LAYERS,
} from './types';

export const updateSliderTime = (time: number) => (
  dispatch: Dispatch<MapActionTypes>
) => {
  dispatch({ type: UPDATE_SLIDER_TIME, time });
};

export const updateSliderStep = (step: number) => (
  dispatch: Dispatch<MapActionTypes>
) => {
  dispatch({ type: UPDATE_SLIDER_STEP, step });
};

export const setAnimateToArea = (animate: boolean) => (
  dispatch: Dispatch<MapActionTypes>
) => {
  dispatch({ type: ANIMATE_TO_AREA, animate });
};

export const updateMapLayers = (layers: MapLayers) => (
  dispatch: Dispatch<MapActionTypes>
) => {
  dispatch({ type: UPDATE_MAP_LAYERS, layers });
};
