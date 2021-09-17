import { Dispatch } from 'redux';
import {
  UPDATE_UNITS,
  UPDATE_THEME,
  SettingsActionTypes,
  UnitType,
  Theme,
} from './types';

export const updateUnits = (key: string, unitType: UnitType) => (
  dispatch: Dispatch<SettingsActionTypes>
) => {
  dispatch({ type: UPDATE_UNITS, units: { [key]: unitType } });
};

export const updateTheme = (theme: Theme) => (
  dispatch: Dispatch<SettingsActionTypes>
) => {
  dispatch({ type: UPDATE_THEME, theme });
};
