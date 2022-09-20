import { Dispatch } from 'redux';
import {
  UPDATE_UNITS,
  UPDATE_THEME,
  SettingsActionTypes,
  UnitType,
  Theme,
  ClockType,
  UPDATE_CLOCK_TYPE,
} from './types';

export const updateClockType =
  (clockType: ClockType) => (dispatch: Dispatch<SettingsActionTypes>) =>
    dispatch({ type: UPDATE_CLOCK_TYPE, clockType });

export const updateUnits =
  (key: string, unitType: UnitType) =>
  (dispatch: Dispatch<SettingsActionTypes>) => {
    dispatch({ type: UPDATE_UNITS, units: { [key]: unitType } });
  };

export const updateTheme =
  (theme: Theme) => (dispatch: Dispatch<SettingsActionTypes>) => {
    dispatch({ type: UPDATE_THEME, theme });
  };
