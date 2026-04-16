import { Dispatch } from 'redux';
import { getOverlayData } from '@utils/map';
import { Region } from 'react-native-maps';
import {
  MapLayers,
  MapOverlay,
  MapActionTypes,
  Error,
  UPDATE_SLIDER_TIME,
  ANIMATE_TO_AREA,
  UPDATE_MAP_LAYERS,
  UPDATE_OVERLAYS,
  UPDATE_OVERLAYS_SUCCESS,
  UPDATE_OVERLAYS_ERROR,
  UPDATE_ACTIVE_OVERLAY,
  UPDATE_REGION,
  UPDATE_SELECTED_CALLOUT,
  UPDATE_ANIMATION_SPEED,
} from './types';
import type { MapLibrary } from '@store/settings/types';

export const updateSliderTime =
  (time: number) => (dispatch: Dispatch<MapActionTypes>) => {
    dispatch({ type: UPDATE_SLIDER_TIME, time });
  };

export const setAnimateToArea =
  (animate: boolean) => (dispatch: Dispatch<MapActionTypes>) => {
    dispatch({ type: ANIMATE_TO_AREA, animate });
  };

export const updateMapLayers =
  (layers: MapLayers) => (dispatch: Dispatch<MapActionTypes>) => {
    dispatch({ type: UPDATE_MAP_LAYERS, layers });
  };

export const updateOverlays =
  (activeOverlay: number, library: MapLibrary) => (dispatch: Dispatch<MapActionTypes>) => {
    let overlays;
    dispatch({ type: UPDATE_OVERLAYS });
    getOverlayData(activeOverlay, library)
      .then((overlayMap: Map<number, MapOverlay> | undefined) => {
        if (overlayMap) {
          overlays = overlayMap;
          dispatch({ type: UPDATE_OVERLAYS_SUCCESS, overlays });
        }
      })
      .catch((error: Error) => {
        dispatch({ type: UPDATE_OVERLAYS_ERROR, error });
      });
  };

export const updateActiveOverlay =
  (id: number) => (dispatch: Dispatch<MapActionTypes>) =>
    dispatch({ type: UPDATE_ACTIVE_OVERLAY, activeId: id });

export const updateRegion =
  (region: Region) => (dispatch: Dispatch<MapActionTypes>) =>
    dispatch({ type: UPDATE_REGION, region });

export const updateSelectedCallout =
  (selectedCallout: string | undefined) =>
  (dispatch: Dispatch<MapActionTypes>) =>
    dispatch({ type: UPDATE_SELECTED_CALLOUT, selectedCallout });

export const updateAnimationSpeed =
  (speed: number) => (dispatch: Dispatch<MapActionTypes>) => {
    dispatch({ type: UPDATE_ANIMATION_SPEED, speed });
  };
