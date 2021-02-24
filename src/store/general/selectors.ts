import { Selector, createSelector } from 'reselect';
import { State } from '../types';
import { GeneralState, Geolocation } from './types';

const selectGeneralDomain: Selector<State, GeneralState> = (state) =>
  state.general;

export const selectGeolocation = createSelector<
  State,
  GeneralState,
  Geolocation | undefined
>(selectGeneralDomain, (general) => general.geolocation);
