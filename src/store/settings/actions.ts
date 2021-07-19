import { Dispatch } from 'redux';
import {
  GET_FAVORITES,
  ADD_FAVORITE,
  DELETE_FAVORITE,
  INIT_SETTINGS,
  UPDATE_UNITS,
  UPDATE_THEME,
  Location,
  SettingsActionTypes,
  UnitMap,
  UnitType,
  Theme,
} from './types';
import { getDefaultUnits } from '../../utils/units';
import {
  getItem,
  multiGet,
  setItem,
  FAVORITES,
  UNITS,
  THEME,
} from '../../utils/async_storage';

export const getFavorites = () => (dispatch: Dispatch<SettingsActionTypes>) => {
  getItem(FAVORITES)
    .then((data) => {
      if (data) {
        const favorites = JSON.parse(data);
        dispatch({ type: GET_FAVORITES, favorites });
      }
    })
    .catch((e) => {
      console.error(e);
    });
};

// injects favorites and units from async storage to store
export const initSettings = () => (dispatch: Dispatch<SettingsActionTypes>) => {
  let favorites = [] as any;
  let units: UnitMap | undefined;
  let theme: Theme;
  multiGet([FAVORITES, UNITS, THEME])
    .then((data) => {
      if (data) {
        console.log(data);
        // parse favorites
        if (data[0][1] !== null) {
          favorites = JSON.parse(data[0][1]);
        }
        // parse units
        if (data[1][1] !== null) {
          units = JSON.parse(data[1][1]);
        }
        // use .env to get defaults and populate async storage and store
        if (data[1][1] === null) {
          units = getDefaultUnits();
          setItem(UNITS, JSON.stringify(units));
        }
        if (data[2][1]) {
          theme = data[2][1] as Theme;
        }
        dispatch({
          type: INIT_SETTINGS,
          units,
          favorites: favorites || [],
          theme: theme || 'automatic',
        });
      }
    })
    .catch((e) => {
      console.error(e);
    });
};

export const addFavorite = (newFavorite: Location) => (
  dispatch: Dispatch<SettingsActionTypes>
) => {
  getItem(FAVORITES)
    .then((data) => {
      if (data) {
        const currentFavorites = JSON.parse(data);
        const newFavorites = currentFavorites.concat(newFavorite);
        dispatch({ type: ADD_FAVORITE, favorites: newFavorites });
        setItem(FAVORITES, JSON.stringify(newFavorites));
      } else {
        const favorites = [newFavorite];
        dispatch({ type: ADD_FAVORITE, favorites });
        setItem(FAVORITES, JSON.stringify(favorites));
      }
    })
    .catch((e) => {
      console.error(e);
    });
};

export const deleteFavorite = (id: number) => (
  dispatch: Dispatch<SettingsActionTypes>
) => {
  getItem(FAVORITES)
    .then((data) => {
      if (data) {
        const currentFavorites = JSON.parse(data);
        const newFavorites = currentFavorites.filter(
          (f: { id: number }) => f.id !== id
        );
        dispatch({ type: DELETE_FAVORITE, id });
        const newFavoritesJSON = JSON.stringify(newFavorites);
        setItem(FAVORITES, newFavoritesJSON);
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
