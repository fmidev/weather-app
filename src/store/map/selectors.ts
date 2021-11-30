import { Selector, createSelector } from 'reselect';
import { Config } from '@config';
import { State } from '../types';
import { MapState, MapLayers, MapOverlay } from './types';

const selectMapDomain: Selector<State, MapState> = (state) => state.map;

export const selectSliderTime = createSelector<State, MapState, number>(
  selectMapDomain,
  (map) => map.sliderTime
);

export const selectSliderStep = createSelector<State, MapState, number>(
  selectMapDomain,
  (map) => {
    if (map.sliderStep) {
      return map.sliderStep;
    }
    if (map.overlays) {
      const firstId = map.overlays.keys().next().value;
      const activeLayer = Config.get('map').layers.find(
        (l) => l.id === firstId
      );
      const timeStep = activeLayer?.times.timeStep;
      return timeStep || 0;
    }
    return 0;
  }
);

export const selectAnimateToArea = createSelector<State, MapState, boolean>(
  selectMapDomain,
  (map) => map.animateToArea
);

export const selectMapLayers = createSelector<State, MapState, MapLayers>(
  selectMapDomain,
  (map) => map.mapLayers
);

export const selectDisplayLocation = createSelector<State, MapLayers, boolean>(
  selectMapLayers,
  (layers) => layers.location
);

export const selectActiveOverlay = createSelector<
  State,
  MapState,
  number | undefined
>(selectMapDomain, (map) => {
  if (map.activeOverlay) {
    return map.activeOverlay;
  }
  if (map.overlays) {
    return map.overlays.keys().next().value;
  }
  return undefined;
});

export const selectOverlay = createSelector<
  State,
  MapState,
  number | undefined,
  MapOverlay | undefined
>([selectMapDomain, selectActiveOverlay], (map, activeOverlay) => {
  if (map.overlays && activeOverlay) {
    return map.overlays.get(activeOverlay);
  }
  return undefined;
});
