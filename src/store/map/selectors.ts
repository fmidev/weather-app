import { Selector, createSelector } from 'reselect';
import { Config } from '@config';
import { State } from '../types';
import { MapState } from './types';

const selectMapDomain: Selector<State, MapState> = (state) => state.map;

export const selectSliderTime = createSelector(
  selectMapDomain,
  (map) => map.sliderTime
);

export const selectSliderStep = createSelector(selectMapDomain, (map) => {
  if (map.sliderStep) {
    return map.sliderStep;
  }
  if (map.overlays) {
    const firstId = map.overlays.keys().next().value;
    const activeLayer = Config.get('map').layers.find((l) => l.id === firstId);
    const timeStep = activeLayer?.times.timeStep;
    return timeStep || 0;
  }
  return 0;
});

export const selectAnimateToArea = createSelector(
  selectMapDomain,
  (map) => map.animateToArea
);

export const selectMapLayers = createSelector(
  selectMapDomain,
  (map) => map.mapLayers
);

export const selectDisplayLocation = createSelector(
  selectMapLayers,
  (layers) => layers.location
);

export const selectActiveOverlay = createSelector(selectMapDomain, (map) => {
  if (map.activeOverlay) {
    return map.activeOverlay;
  }
  if (map.overlays) {
    return map.overlays.keys().next().value;
  }
  return undefined;
});

export const selectOverlay = createSelector(
  [selectMapDomain, selectActiveOverlay],
  (map, activeOverlay) => {
    if (map.overlays && activeOverlay) {
      return map.overlays.get(activeOverlay);
    }
    return undefined;
  }
);
