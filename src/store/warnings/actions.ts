import { Dispatch } from 'redux';
import getWarnings from '@network/WarningsApi';
import { Location } from '@store/location/types';
import getCapWarnings from '@network/CapWarningsApi';
import i18n from '@i18n';
import { State } from '@store/types';
import { Config } from '@config';
import {
  Error,
  FETCH_CAP_WARNINGS,
  FETCH_CAP_WARNINGS_SUCCESS,
  FETCH_WARNINGS,
  FETCH_WARNINGS_ERROR,
  FETCH_WARNINGS_SUCCESS,
  FETCH_FAVORITE_WARNINGS_SUCCESS,
  LocationWarnings,
  WarningsActionTypes,
} from './types';

// Keep request bookkeeping outside Redux to avoid state updates when starting background requests.
const activeRequests = new WeakMap<() => Pick<State, 'warnings'>, AbortController>();
const activeFavoriteRequests = new WeakMap<() => Pick<State, 'warnings'>, AbortController>();

const fetchWarnings =
  (location: Location) => async (
    dispatch: Dispatch<WarningsActionTypes>,
    getState: () => Pick<State, 'warnings'>
  ) => {
    const previousController = activeRequests.get(getState);
    const controller = new AbortController();
    activeRequests.set(getState, controller);
    previousController?.abort();

    // Publication times are shared across locations and languages.
    const requestKey = JSON.stringify([
      location.id,
      location.lat,
      location.lon,
      location.country,
      i18n.language,
    ]);
    const { warnings } = getState();
    if (warnings.updatedRequestKey !== requestKey || !warnings.data[location.id] || warnings.error) {
      dispatch({ type: FETCH_WARNINGS });
    }

    try {
      const { data } = await getWarnings(location, controller);
      if (activeRequests.get(getState) !== controller) return;
      dispatch({
        type: FETCH_WARNINGS_SUCCESS,
        data,
        id: location.id,
        timestamp: Date.now(),
        requestKey,
      });
    } catch (error) {
      if (activeRequests.get(getState) !== controller) return;
      dispatch({ type: FETCH_WARNINGS_ERROR, error: error as Error, timestamp: Date.now() });
    } finally {
      if (activeRequests.get(getState) === controller) {
        activeRequests.delete(getState);
      }
    }
  };

const fetchFavoriteWarnings =
  (locations: Location[]) => async (
    dispatch: Dispatch<WarningsActionTypes>,
    getState: () => Pick<State, 'warnings'>
  ) => {
    activeFavoriteRequests.get(getState)?.abort();
    const controller = new AbortController();
    activeFavoriteRequests.set(getState, controller);

    try {
      const config = Config.get('warnings');
      const locationIds = new Set<string>();
      const supportedLocations = locations.filter(({ id, lat, lon, country }) => {
        const key = String(id);
        if (
          !config.enabled || !config.apiUrl[country] ||
          !Number.isFinite(lat) || !Number.isFinite(lon) || locationIds.has(key)
        ) return false;

        locationIds.add(key);
        return true;
      });
      const results = await Promise.allSettled(
        supportedLocations.map(async (location) => {
          const { data } = await getWarnings(location, controller);
          return { id: location.id, data };
        })
      );
      if (activeFavoriteRequests.get(getState) !== controller) return;

      const data: LocationWarnings = {};
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          data[result.value.id] = result.value.data;
        }
      });
      if (Object.keys(data).length > 0) {
        dispatch({ type: FETCH_FAVORITE_WARNINGS_SUCCESS, data });
      }
    } finally {
      if (activeFavoriteRequests.get(getState) === controller) {
        activeFavoriteRequests.delete(getState);
      }
    }
  };

const fetchCapWarnings = () => (dispatch: Dispatch<WarningsActionTypes>) => {
  dispatch({ type: FETCH_CAP_WARNINGS });

  getCapWarnings()
    .then((data) => {
      dispatch({
        type: FETCH_CAP_WARNINGS_SUCCESS,
        data: data.warnings,
        timestamp: data.updated,
      });
    })
    .catch((error: Error) => {
      dispatch({ type: FETCH_WARNINGS_ERROR, error, timestamp: Date.now() });
    });
};

export default fetchWarnings;
export { fetchWarnings, fetchFavoriteWarnings, fetchCapWarnings };
