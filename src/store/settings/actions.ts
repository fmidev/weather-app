import { Dispatch } from 'redux';
import {
  SET_LANGUAGE,
  GET_FAVORITES,
  ADD_FAVORITE,
  DELETE_FAVORITE,
  Locale,
  Location,
  SettingsActionTypes,
} from './types';
import {
  getItem,
  setItem,
  removeItem,
  LOCALE,
  FAVORITES,
} from '../../utils/async_storage';

export const setLanguage = (locale: Locale) => (
  dispatch: Dispatch<SettingsActionTypes>
) => {
  setItem(LOCALE, locale);
  dispatch({ type: SET_LANGUAGE, locale });
};

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

export const deleteFavorite = (geoid: number) => (
  dispatch: Dispatch<SettingsActionTypes>
) => {
  getItem(FAVORITES)
    .then((data) => {
      if (data) {
        const currentFavorites = JSON.parse(data);
        const newFavorites = currentFavorites.filter(
          (f: { geoid: number }) => f.geoid !== geoid
        );
        dispatch({ type: DELETE_FAVORITE, geoid });
        setItem(FAVORITES, newFavorites);
      }
    })
    .catch((e) => {
      console.error(e);
    });
};
