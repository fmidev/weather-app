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

export const selectActiveLocation = createSelector<
  State,
  GeneralState,
  Location | undefined
>(selectGeneralDomain, (general) => general.activeLocation);
