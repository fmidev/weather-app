import { Selector, createSelector } from 'reselect';
import { Config } from '@config';
import { State } from '../types';
import { SettingsState } from './types';

export const selectSettingsDomain: Selector<State, SettingsState> = (state) =>
  state.settings;

export const selectUserUnits = createSelector(
  selectSettingsDomain,
  (settings) => settings.units
);

export const selectTheme = createSelector(
  selectSettingsDomain,
  (settings) => settings.theme
);

export const selectCurrentUnits = createSelector(selectUserUnits, (units) => {
  const defaultUnits = Config.get('settings').units;
  return { ...defaultUnits, ...units };
});
