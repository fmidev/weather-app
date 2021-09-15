import { State } from '@store/types';
import { createSelector, Selector } from 'reselect';
import { Geolocation, Location, LocationState } from './types';

const selectLocationDomain: Selector<State, LocationState> = (state) =>
  state.location;
export const selectGeolocation = createSelector<
  State,
  LocationState,
  Geolocation | undefined
>(selectLocationDomain, (location) => location.geolocation);

export const selectIsGeolocation = createSelector<
  State,
  LocationState,
  boolean | undefined
>(selectLocationDomain, (location) => location.isGeoLocation);

export const selectCurrent = createSelector<
  State,
  LocationState,
  Location | undefined
>(selectLocationDomain, (location) => location.current);

export const selectGeoid = createSelector(
  [selectCurrent],
  (location) => location?.id || 843429
);

export const selectRecent = createSelector<
  State,
  LocationState,
  Location[] | []
>(selectLocationDomain, (location) => location.recent);

export const selectFavorites = createSelector<
  State,
  LocationState,
  Location[] | []
>(selectLocationDomain, (location) => location.favorites);

export const selectSearch = createSelector<
  State,
  LocationState,
  Location[] | []
>(selectLocationDomain, (location) => location.search);
