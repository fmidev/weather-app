import getAutocomplete from '@network/AutocompleteApi';
import { Dispatch } from 'react';
import { Config } from '@config';
import {
  SET_CURRENT_LOCATION,
  Location,
  LocationActionTypes,
  ADD_FAVORITE,
  DELETE_FAVORITE,
  DELETE_ALL_FAVORITES,
  UPDATE_RECENT_SEARCHES,
  DELETE_ALL_RECENT_SEARCHES,
  FETCH_AUTOCOMPLETE,
  RESET_AUTOCOMPLETE,
} from './types';

export const setCurrentLocation =
  (location: Location, isGeolocation?: boolean) =>
  (dispatch: Dispatch<LocationActionTypes>) => {
    dispatch({ type: SET_CURRENT_LOCATION, location, isGeolocation });
  };

export const addFavorite =
  (location: Location) => (dispatch: Dispatch<LocationActionTypes>) => {
    const max = Config.get('location').maxFavorite;
    dispatch({ type: ADD_FAVORITE, location, max });
  };

export const deleteFavorite =
  (id: number) => (dispatch: Dispatch<LocationActionTypes>) => {
    dispatch({ type: DELETE_FAVORITE, id });
  };

export const deleteAllFavorites =
  () => (dispatch: Dispatch<LocationActionTypes>) => {
    dispatch({ type: DELETE_ALL_FAVORITES });
  };

export const searchLocation =
  (pattern: string) => (dispatch: Dispatch<LocationActionTypes>) => {
    getAutocomplete(pattern)
      .then((data) => {
        dispatch({
          type: FETCH_AUTOCOMPLETE,
          data,
        });
      })
      .catch(() => {
        dispatch({ type: RESET_AUTOCOMPLETE });
      });
  };

export const resetSearch = () => (dispatch: Dispatch<LocationActionTypes>) => {
  dispatch({ type: RESET_AUTOCOMPLETE });
};

export const updateRecentSearches =
  (location: Location) => (dispatch: Dispatch<LocationActionTypes>) => {
    const max = Config.get('location').maxRecent;
    dispatch({ type: UPDATE_RECENT_SEARCHES, location, max });
  };

export const deleteAllRecentSearches =
  () => (dispatch: Dispatch<LocationActionTypes>) => {
    dispatch({ type: DELETE_ALL_RECENT_SEARCHES });
  };
