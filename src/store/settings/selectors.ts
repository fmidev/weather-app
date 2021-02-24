import { Selector, createSelector } from 'reselect';
import { State } from '../types';
import { SettingsState, Locale, Location } from './types';

const selectSettingsDomain: Selector<State, SettingsState> = (state) =>
  state.settings;

export const selectLocale = createSelector<State, SettingsState, Locale>(
  selectSettingsDomain,
  (settings) => settings.locale
);

export const selectFavorites = createSelector<
  State,
  SettingsState,
  Location[] | []
>(selectSettingsDomain, (settings) => settings.favorites);
