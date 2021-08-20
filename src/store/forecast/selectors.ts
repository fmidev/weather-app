import { Selector, createSelector } from 'reselect';
import { State } from '../types';
import { ForecastState, Error, WeatherData } from './types';
import { selectGeoid } from '../general/selectors';

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

const selectData = createSelector<State, ForecastState, WeatherData>(
  selectForecastDomain,
  (forecast) => forecast.data
);

export const selectForecast = createSelector(
  [selectData, selectGeoid],
  (items, geoid) => items[geoid] || []
);
