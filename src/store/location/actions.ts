import getAutocomplete from '@network/AutocompleteApi';
import { Dispatch } from 'react';
import {
  SET_GEOLOCATION,
  SET_CURRENT_LOCATION,
  Geolocation,
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

export const setGeolocation = (geolocation: Geolocation) => (
  dispatch: Dispatch<LocationActionTypes>
) => {
  dispatch({ type: SET_GEOLOCATION, geolocation });
};

export const setCurrentLocation = (
  location: Location,
  isGeolocation?: boolean
) => (dispatch: Dispatch<LocationActionTypes>) => {
  dispatch({ type: SET_CURRENT_LOCATION, location, isGeolocation });
};

export const addFavorite = (location: Location) => (
  dispatch: Dispatch<LocationActionTypes>
) => {
  dispatch({ type: ADD_FAVORITE, location });
};

export const deleteFavorite = (id: number) => (
  dispatch: Dispatch<LocationActionTypes>
) => {
  dispatch({ type: DELETE_FAVORITE, id });
};

export const deleteAllFavorites = () => (
  dispatch: Dispatch<LocationActionTypes>
) => {
  dispatch({ type: DELETE_ALL_FAVORITES });
};

export const searchLocation = (pattern: string) => (
  dispatch: Dispatch<LocationActionTypes>
) => {
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

export const updateRecentSearches = (location: Location) => (
  dispatch: Dispatch<LocationActionTypes>
) => {
  dispatch({ type: UPDATE_RECENT_SEARCHES, location });
};

export const deleteAllRecentSearches = () => (
  dispatch: Dispatch<LocationActionTypes>
) => {
  dispatch({ type: DELETE_ALL_RECENT_SEARCHES });
};
