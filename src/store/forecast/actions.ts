import { Dispatch } from 'redux';
import { getForecast } from '@network/WeatherApi';
import { ChartType } from '@components/weather/charts/types';
import { Config } from '@config';
import {
  Error,
  FETCH_FORECAST,
  FETCH_FORECAST_SUCCESS,
  FETCH_FORECAST_ERROR,
  UPDATE_DISPLAY_PARAMS,
  RESTORE_DEFAULT_DISPLAY_PARAMS,
  ForecastActionTypes,
  ForecastLocation,
  UPDATE_FORECAST_DISPLAY_FORMAT,
  UPDATE_FORECAST_CHART_PARAMETER,
} from './types';

export const fetchForecast =
  (location: ForecastLocation, filterLocations: number[] = []) =>
  (dispatch: Dispatch<ForecastActionTypes>) => {
    dispatch({ type: FETCH_FORECAST });

    getForecast(location)
      .then((data) => {
        const geoid = Number(Object.keys(data)[0]);
        const favorites = [...filterLocations, geoid];
        dispatch({
          type: FETCH_FORECAST_SUCCESS,
          data,
          favorites,
          timestamp: Date.now(),
        });
      })
      .catch((error: Error) => {
        dispatch({ type: FETCH_FORECAST_ERROR, error, timestamp: Date.now() });
      });
  };

export const updateDisplayParams =
  (param: [number, string]) => (dispatch: Dispatch<ForecastActionTypes>) => {
    const defaultParameters = Config.get(
      'weather'
    ).forecast.defaultParameters.map((parameter, index) => [
      index,
      parameter,
    ]) as [number, string][];
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
