import { Selector, createSelector } from 'reselect';
import { State } from '../types';
import { MeteorologistState } from './types';

const SNAPSHOT_MAX_AGE = 12 * 60 * 60 * 1000;

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

// Check the clock on every call so cached Redux state cannot keep expired data visible.
export const selectMeteorologistSnapshot = (state: State) => {
  const { snapshot } = selectMeteorologistDomain(state);
  return snapshot && Date.parse(snapshot.date) >= Date.now() - SNAPSHOT_MAX_AGE
    ? snapshot
    : null;
};
