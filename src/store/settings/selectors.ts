import { Selector, createSelector } from 'reselect';
import { State } from '../types';
import { SettingsState, Location, UnitMap, Theme } from './types';

export const selectSettingsDomain: Selector<State, SettingsState> = (state) =>
  state.settings;

export const selectFavorites = createSelector<
  State,
  SettingsState,
  Location[] | []
>(selectSettingsDomain, (settings) => settings.favorites);

export const selectUnits = createSelector<
  State,
  SettingsState,
  UnitMap | undefined
>(selectSettingsDomain, (settings) => settings.units);

export const selectTheme = createSelector<State, SettingsState, Theme>(
  selectSettingsDomain,
  (settings) => settings.theme
);
