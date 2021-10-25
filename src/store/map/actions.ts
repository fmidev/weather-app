import { Dispatch } from 'redux';
import { getWMSLayerUrlsAndBounds } from '@utils/map';
import {
  MapLayers,
  MapActionTypes,
  UPDATE_SLIDER_TIME,
  UPDATE_SLIDER_STEP,
  ANIMATE_TO_AREA,
  UPDATE_MAP_LAYERS,
  INITIALIZE_OVERLAYS,
  UPDATE_ACTIVE_OVERLAY,
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

export const initializeOverlays = () => (
  dispatch: Dispatch<MapActionTypes>
) => {
  let overlays;
  getWMSLayerUrlsAndBounds()
    .then((overlayMap) => {
      if (overlayMap) {
        overlays = overlayMap;
        const activeId = overlayMap.keys().next().value;
        dispatch({ type: INITIALIZE_OVERLAYS, overlays });
        dispatch({ type: UPDATE_ACTIVE_OVERLAY, activeId });
      }
    })
    .catch((e) => console.error(e));
};

export const updateActiveOverlay = (id: number) => (
  dispatch: Dispatch<MapActionTypes>
) => dispatch({ type: UPDATE_ACTIVE_OVERLAY, activeId: id });
