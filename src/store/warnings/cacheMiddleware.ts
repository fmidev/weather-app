import type { Middleware } from 'redux';
import type { State } from '@store/types';
import { selectCurrent, selectFavorites } from '@store/location/selector';
import {
  ADD_FAVORITE,
  DELETE_FAVORITE,
  DELETE_ALL_FAVORITES,
  SET_CURRENT_LOCATION,
} from '@store/location/types';
import {
  FETCH_WARNINGS_SUCCESS,
  FETCH_FAVORITE_WARNINGS_SUCCESS,
  RETAIN_WARNING_LOCATIONS,
} from './types';

const cacheUpdates = new Set([
  ADD_FAVORITE,
  DELETE_FAVORITE,
  DELETE_ALL_FAVORITES,
  SET_CURRENT_LOCATION,
  // A response arriving after a location was removed must not restore its cache.
  FETCH_WARNINGS_SUCCESS,
  FETCH_FAVORITE_WARNINGS_SUCCESS,
]);

const warningsCacheMiddleware: Middleware<{}, State> =
  ({ getState, dispatch }) =>
  (next) =>
  (action) => {
    const result = next(action);

    if (cacheUpdates.has(action.type)) {
      const state = getState();
      dispatch({
        type: RETAIN_WARNING_LOCATIONS,
        locationIds: [
          selectCurrent(state).id,
          ...selectFavorites(state).map(({ id }) => id),
        ],
      });
    }

    return result;
  };

export default warningsCacheMiddleware;
