import axios from 'axios';
import i18n from '@i18n';

import getAutocomplete from '@network/AutocompleteApi';
import { Dispatch } from 'react';
import { Config } from '@config';
import { getLocationsLocales } from '@network/WeatherApi';
import { search } from '@utils/geolocation';
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
  UPDATE_LOCATIONS_LOCALES,
  SET_LOADING,
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
  (id: number | string) => (dispatch: Dispatch<LocationActionTypes>) => {
    dispatch({ type: DELETE_FAVORITE, id });
  };

export const deleteAllFavorites =
  () => (dispatch: Dispatch<LocationActionTypes>) => {
    dispatch({ type: DELETE_ALL_FAVORITES });
  };

export const searchLocation =
  (pattern: string) => (dispatch: Dispatch<LocationActionTypes>) => {
    const { source } = Config.get('location');
    const { language } = i18n;

    if (source === 'json') {
      const results = search(pattern, language, 20);
      dispatch({
        type: FETCH_AUTOCOMPLETE,
        data: {
          autocomplete: {
            'found-results': results.length,
            'max-results': 20,
            result: results.map((location) => ({
              id: location.id,
              name: location.name[language] || location.name.primary,
              area: location.region[language] || location.region.primary,
              country: location.country,
              lat: location.latitude,
              lon: location.longitude,
              timezone: location.timezone,
          })),
        }}
      });
    } else {
      getAutocomplete(pattern)
        .then((data) => {
          dispatch({
            type: FETCH_AUTOCOMPLETE,
            data,
          });
        })
        .catch((error) => {
          if (!axios.isCancel(error)) {
            dispatch({ type: RESET_AUTOCOMPLETE });
          }
        });
    }
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

export const updateLocationsLocales =
  (geoids: number[]) => (dispatch: Dispatch<LocationActionTypes>) => {
    // geoids might be empty if fallback location is in use
    if (geoids.length > 0) {
      getLocationsLocales(geoids).then((data) => {
        dispatch({ type: UPDATE_LOCATIONS_LOCALES, data });
      });
    }
  };

export const setLoading =
  (loading: boolean) => (dispatch: Dispatch<LocationActionTypes>) => {
    dispatch({ type: SET_LOADING, loading });
  };
