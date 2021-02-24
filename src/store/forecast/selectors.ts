import { Selector, createSelector } from 'reselect';
import { State } from '../types';
import { ForecastState, Error, Item } from './types';

const selectForecastDomain: Selector<State, ForecastState> = (state) =>
  state.forecast;

export const selectLoading = createSelector<State, ForecastState, boolean>(
  selectForecastDomain,
  (forecast) => forecast.loading
);

export const selectError = createSelector<
  State,
  ForecastState,
  Error | boolean | string
>(selectForecastDomain, (forecast) => forecast.error);

export const selectItems = createSelector<State, ForecastState, Item[] | []>(
  selectForecastDomain,
  (forecast) => forecast.data
);
