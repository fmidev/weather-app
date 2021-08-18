import { Selector, createSelector } from 'reselect';
import { State } from '../types';
import { MapState, MapLayers } from './types';

const selectMapDomain: Selector<State, MapState> = (state) => state.map;

export const selectSliderTime = createSelector<State, MapState, number>(
  selectMapDomain,
  (map) => map.sliderTime
);

export const selectSliderStep = createSelector<State, MapState, number>(
  selectMapDomain,
  (map) => map.sliderStep
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
