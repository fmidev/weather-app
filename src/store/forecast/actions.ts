import { Dispatch } from 'redux';
import {
  getAllForecasts,
  getAuroraBorealisLikelihood,
  getForecast,
} from '@network/WeatherApi';
import type { Location } from '@store/location/types';
import type { State } from '@store/types';
import { ChartType } from '@components/weather/charts/types';
import { Config } from '@config';
import { selectForecastForLocation } from './selectors';
import { selectCurrent } from '@store/location/selector';

import {
  Error,
  FETCH_FORECAST,
  FETCH_FORECAST_SUCCESS,
  FETCH_FORECAST_ERROR,
  FETCH_ALL_FORECASTS_SUCCESS,
  UPDATE_DISPLAY_PARAMS,
  RESTORE_DEFAULT_DISPLAY_PARAMS,
  ForecastActionTypes,
  ForecastLocation,
  UPDATE_FORECAST_DISPLAY_FORMAT,
  UPDATE_FORECAST_CHART_PARAMETER,
  UPDATE_SHOW_SINGLE_HOURLY_FORECAST,
  DisplayParameters,
} from './types';

export const fetchForecast =
  (
    location: ForecastLocation,
    country: string,
    options?: { background?: boolean }
  ) =>
  async (dispatch: Dispatch<ForecastActionTypes>, getState?: () => State) => {
    const requestMeta = options?.background ? { background: true } : {};
    const hasCachedData =
      getState &&
      selectForecastForLocation(getState(), location.geoid).length > 0;
    dispatch({
      type: FETCH_FORECAST,
      ...requestMeta,
      ...(hasCachedData ? { hasCachedData: true } : {}),
    });

    try {
      const data = await getForecast(location, country);

      dispatch({
        type: FETCH_FORECAST_SUCCESS,
        data,
        timestamp: Date.now(),
        ...requestMeta,
      });
    } catch (error) {
      dispatch({
        type: FETCH_FORECAST_ERROR,
        error: error as Error,
        timestamp: Date.now(),
        ...requestMeta,
      });
    }
  };

export const fetchAllForecasts =
  (locations: Location[]) =>
  async (dispatch: Dispatch<ForecastActionTypes>, getState: () => State) => {
    if (locations.length === 0) return;

    const state = getState();
    const current = selectCurrent(state);
    const currentLocation = locations.find(
      ({ id }) => String(id) === String(current.id)
    );
    const requestMeta = currentLocation ? {} : { background: true };
    const hasCachedData =
      currentLocation &&
      selectForecastForLocation(state, currentLocation.id).length > 0;
    dispatch({
      type: FETCH_FORECAST,
      ...requestMeta,
      ...(hasCachedData ? { hasCachedData: true } : {}),
    });
    try {
      const [data, auroraLikely] = await Promise.all([
        getAllForecasts(locations),
        currentLocation
          ? getAuroraBorealisLikelihood(
              { latlon: `${currentLocation.lat},${currentLocation.lon}` },
              currentLocation.country
            )
          : Promise.resolve(false),
      ]);
      const currentId =
        typeof currentLocation?.id === 'number' &&
        Number.isNaN(currentLocation.id)
          ? 0
          : currentLocation?.id;
      dispatch({
        type: FETCH_ALL_FORECASTS_SUCCESS,
        data,
        timestamp: Date.now(),
        ...requestMeta,
        ...(currentId !== undefined
          ? { auroraBorealisData: { [currentId]: auroraLikely } }
          : {}),
      });
    } catch (error) {
      dispatch({
        type: FETCH_FORECAST_ERROR,
        ...requestMeta,
        error: error as Error,
        timestamp: Date.now(),
      });
    }
  };

export const updateDisplayParams =
  (param: [number, DisplayParameters]) =>
  (dispatch: Dispatch<ForecastActionTypes>) => {
    const { defaultParameters } = Config.get('weather').forecast;
    dispatch({ type: UPDATE_DISPLAY_PARAMS, param, defaultParameters });
  };

export const restoreDefaultDisplayParams =
  () => (dispatch: Dispatch<ForecastActionTypes>) => {
    dispatch({ type: RESTORE_DEFAULT_DISPLAY_PARAMS });
  };

export const updateDisplayFormat =
  (value: 'table' | 'chart') => (dispatch: Dispatch<ForecastActionTypes>) => {
    dispatch({ type: UPDATE_FORECAST_DISPLAY_FORMAT, value });
  };

export const updateChartParameter =
  (value: ChartType) => (dispatch: Dispatch<ForecastActionTypes>) => {
    dispatch({ type: UPDATE_FORECAST_CHART_PARAMETER, value });
  };

export const updateShowSingleHourlyForecast =
  (value: boolean) => (dispatch: Dispatch<ForecastActionTypes>) => {
    dispatch({ type: UPDATE_SHOW_SINGLE_HOURLY_FORECAST, value });
  };
