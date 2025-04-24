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

export const selectTheme = createSelector(selectSettingsDomain, (settings) => {
  if (settings.theme) return settings.theme;

  const configThemes = Config.get('settings').themes;
  let theme;
  if (configThemes.light && !configThemes.dark) {
    theme = 'light';
  } else if (configThemes.dark && !configThemes.light) {
    theme = 'dark';
  } else if (configThemes.blue && !configThemes.blue) {
    theme = 'blue';
  }else if (configThemes.light && configThemes.dark) {
    theme = 'automatic';
  }

  return theme;
});

export const selectClockType = createSelector(
  selectSettingsDomain,
  (settings) => {
    const configClockType = Config.get('settings').clockType;
    return settings.clockType ?? configClockType;
  }
);
