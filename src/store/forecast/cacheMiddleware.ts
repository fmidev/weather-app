import type { Middleware } from 'redux';
import type { State } from '@store/types';
import { selectCurrent, selectFavorites } from '@store/location/selector';
import {
  ADD_FAVORITE,
  DELETE_FAVORITE,
  DELETE_ALL_FAVORITES,
  SET_CURRENT_LOCATION,
} from '@store/location/types';
import { RETAIN_FORECAST_LOCATIONS } from './types';

const cacheUpdates = new Set([
  ADD_FAVORITE,
  DELETE_FAVORITE,
  DELETE_ALL_FAVORITES,
  SET_CURRENT_LOCATION,
]);

const forecastCacheMiddleware: Middleware<{}, State> =
  ({ getState, dispatch }) =>
  (next) =>
  (action) => {
    const result = next(action);

    if (cacheUpdates.has(action.type)) {
      // Use the updated favorites, including any eviction at the favorites limit.
      const state = getState();
      dispatch({
        type: RETAIN_FORECAST_LOCATIONS,
        locationIds: [
          selectCurrent(state).id,
          ...selectFavorites(state).map(({ id }) => id),
        ],
      });
    }

    return result;
  };

export default forecastCacheMiddleware;
