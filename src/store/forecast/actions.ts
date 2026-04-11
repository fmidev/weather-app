import { Dispatch } from 'redux';
import moment from 'moment';
import { getForecast } from '@network/WeatherApi';
import { ChartType } from '@components/weather/charts/types';
import { Config } from '@config';
import { trackMatomoEvent } from '@utils/matomo';
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
  DisplayParameters,
  WeatherData,
} from './types';

export const fetchForecast =
  (location: ForecastLocation, country: string) =>
  async (dispatch: Dispatch<ForecastActionTypes>) => {
    dispatch({ type: FETCH_FORECAST });

    const MAX_FORECAST_AGE = 24; // hours
    const { forecast: { data: dataSettings } } = Config.get('weather');

    try {
      const data = await getForecast(location, country);

      // Checks modtime and retry data fetch if data is older than 24 hours
      const nonEmptyForecasts = data.forecasts.filter(
        item => Object.entries(item).length > 0
      );

      const retryPromises: { index: number; promise: ReturnType<typeof getForecast> }[] = [];
      for (const [index, forecast] of nonEmptyForecasts.entries()) {
        const id = Object.keys(forecast)[0];
        const modtime = forecast[id][0].modtime;
        const modtimeMoment = modtime ? moment(modtime+'Z') : undefined;

        if (modtimeMoment && moment().diff(modtimeMoment, 'hours') >= MAX_FORECAST_AGE) {
          const producer = dataSettings[index].producer;
          trackMatomoEvent('Error', 'Weather', `Old modtime ${modtime} with producer ${producer} for geoid ${id}`);
          retryPromises.push({ index, promise: getForecast(location, country, producer) });
        }
      }

      if (retryPromises.length > 0) {
        const retryResults = await Promise.allSettled(retryPromises.map(r => r.promise));
        for (let i = 0; i < retryPromises.length; i++) {
          const result = retryResults[i];
          if (result.status === 'fulfilled') {
            nonEmptyForecasts[retryPromises[i].index] = result.value.forecasts[0];
          }
        }
      }

      data.forecasts = nonEmptyForecasts;

      dispatch({
        type: FETCH_FORECAST_SUCCESS,
        data,
        timestamp: Date.now(),
      });
    } catch (error) {
      dispatch({ type: FETCH_FORECAST_ERROR, error: error as Error, timestamp: Date.now() });
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
