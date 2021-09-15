import { Dispatch } from 'redux';
import { getDefaultUnits } from '@utils/units';
import {
  getItem,
  multiGet,
  setItem,
  // removeItem,
  UNITS,
  THEME,
} from '@utils/async_storage';
import {
  INIT_SETTINGS,
  UPDATE_UNITS,
  UPDATE_THEME,
  SettingsActionTypes,
  UnitMap,
  UnitType,
  Theme,
} from './types';

// injects favorites and units from async storage to store
export const initSettings = () => (dispatch: Dispatch<SettingsActionTypes>) => {
  let units: UnitMap | undefined;
  let theme: Theme;
  multiGet([UNITS, THEME])
    .then((data) => {
      if (data) {
        // parse units
        if (data[0][1] !== null) {
          units = JSON.parse(data[0][1]);
        }
        // use .env to get defaults and populate async storage and store
        if (data[0][1] === null) {
          units = getDefaultUnits();
          setItem(UNITS, JSON.stringify(units));
        }
        if (data[1][1]) {
          theme = data[1][1] as Theme;
        }
        dispatch({
          type: INIT_SETTINGS,
          units,
          theme: theme || 'automatic',
        });
      }
    })
    .catch((e) => {
      console.error(e);
    });
};

export const updateUnits = (key: string, unit: UnitType) => (
  dispatch: Dispatch<SettingsActionTypes>
) => {
  getItem(UNITS)
    .then((data) => {
      if (data) {
        const currentUnits = JSON.parse(data);
        const newUnits = { ...currentUnits, [key]: unit };
        dispatch({ type: UPDATE_UNITS, units: newUnits });
        const newUnitsJSON = JSON.stringify(newUnits);
        setItem(UNITS, newUnitsJSON);
      }
    })
    .catch((e) => {
      console.error(e);
    });
};

export const updateTheme = (theme: Theme) => (
  dispatch: Dispatch<SettingsActionTypes>
) => {
  setItem(THEME, theme);
  console.log('updateTheme action::', theme);
  dispatch({ type: UPDATE_THEME, theme });
};
