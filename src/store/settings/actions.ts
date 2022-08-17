import { Dispatch } from 'redux';
import {
  UPDATE_UNITS,
  UPDATE_THEME,
  SettingsActionTypes,
  Units,
  ValueOf,
  Theme,
} from './types';

export const updateUnits =
  (param: keyof Units, unit: ValueOf<Units>) =>
  (dispatch: Dispatch<SettingsActionTypes>) => {
    dispatch({ type: UPDATE_UNITS, param, unit });
  };

export const updateTheme =
  (theme: Theme) => (dispatch: Dispatch<SettingsActionTypes>) => {
    dispatch({ type: UPDATE_THEME, theme });
  };
