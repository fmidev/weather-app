import { Selector, createSelector } from 'reselect';
import { State } from '../types';
import { MeteorologistState } from './types';

const selectMeteorologistDomain: Selector<State, MeteorologistState> = (
  state
) => state.meteorologist;

export const selectLoading = createSelector(
  selectMeteorologistDomain,
  (meteorologist) => meteorologist.loading
);

export const selectError = createSelector(
  selectMeteorologistDomain,
  (meteorologist) => meteorologist.error
);

export const selectMeteorologistSnapshot = createSelector(
  selectMeteorologistDomain,
  (meteorologist) => meteorologist.snapshot
);
