import { Selector, createSelector } from 'reselect';
import { State } from '../types';
import { GeneralState, Geolocation } from './types';
import { Location } from '../settings/types';

const selectGeneralDomain: Selector<State, GeneralState> = (state) =>
  state.general;

export const selectGeolocation = createSelector<
  State,
  GeneralState,
  Geolocation | undefined
>(selectGeneralDomain, (general) => general.geolocation);

export const selectCurrentLocation = createSelector<
  State,
  GeneralState,
  Location | undefined
>(selectGeneralDomain, (general) => general.currentLocation);

export const selectIsGeolocation = createSelector<
  State,
  GeneralState,
  boolean | undefined
>(selectGeneralDomain, (general) => general.isGeolocation);

export const selectGeoid = createSelector(
  [selectCurrentLocation],
  (location) => location?.id || 843429
);
