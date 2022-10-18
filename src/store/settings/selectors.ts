import { Config } from '@config';
import { Selector, createSelector } from 'reselect';
import { State } from '../types';
import { SettingsState } from './types';

export const selectSettingsDomain: Selector<State, SettingsState> = (state) =>
  state.settings;

export const selectUnits = createSelector(
  selectSettingsDomain,
  (settings) => settings.units
);

export const selectTheme = createSelector(
  selectSettingsDomain,
  (settings) => settings.theme
);

export const selectClockType = createSelector(
  selectSettingsDomain,
  (settings) => {
    const configClockType = Config.get('clockType');
    return settings.clockType ?? configClockType;
  }
);
