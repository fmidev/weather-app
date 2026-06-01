import { Config } from '@config';
import { Selector, createSelector } from 'reselect';
import { State } from '../types';
import { MapState } from './types';

const selectMapDomain: Selector<State, MapState> = (state) => state.map;

export const selectSliderTime = createSelector(
  selectMapDomain,
  (map) => map.sliderTime
);

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

export const selectActiveOverlay = createSelector(selectMapDomain, (map) =>
  map.activeOverlay ? map.activeOverlay : Config.get('map').layers[0].id
);

export const selectOverlay = createSelector(
  [selectMapDomain, selectActiveOverlay],
  (map, activeOverlay) => {
    if (map.overlays && activeOverlay) {
      return map.overlays.get(activeOverlay);
    }
    return undefined;
  }
);

export const selectOverlaysError = createSelector(
  selectMapDomain,
  (map) => map.overlaysError
);

export const selectRegion = createSelector(
  selectMapDomain,
  (map) => map.region
);

export const selectSelectedCallout = createSelector(
  selectMapDomain,
  (map) => map.selectedCallout
);

export const selectAnimationSpeed = createSelector(
  selectMapDomain,
  (map) => map.animationSpeed
);
