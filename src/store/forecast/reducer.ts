import { PersistConfig } from '@store/types';
import {
  FETCH_FORECAST,
  FETCH_FORECAST_SUCCESS,
  FETCH_FORECAST_ERROR,
  ForecastActionTypes,
  ForecastState,
  WeatherData,
  UPDATE_DISPLAY_PARAMS,
  RESTORE_DEFAULT_DISPLAY_PARAMS,
  UPDATE_FORECAST_DISPLAY_FORMAT,
  UPDATE_FORECAST_CHART_PARAMETER,
  DisplayParameters,
} from './types';

import constants from './constants';

const INITIAL_STATE: ForecastState = {
  data: {},
  loading: false,
  error: false,
  displayParams: [],
  displayFormat: 'table',
  chartDisplayParam: undefined,
  fetchTimestamp: Date.now(),
  fetchSuccessTime: 0,
};

const formatData = (dataSets: WeatherData[]): WeatherData => {
  const weatherData: WeatherData = {};
  dataSets.forEach((dataSet) => {
    Object.entries(dataSet).forEach(([id, steps]) => {
      if (!weatherData[id]) {
        Object.assign(weatherData, { [id]: steps });
      } else {
        steps.forEach((step) => {
          const timeIndex = weatherData[id].findIndex(
            ({ epochtime }) => epochtime === step.epochtime
          );
          if (timeIndex >= 0) {
            Object.assign(weatherData[id][timeIndex], {
              ...weatherData[id][timeIndex],
              ...step,
            });
          } else {
            weatherData[id].push(step);
          }
        });
      }
    });
  });
  return weatherData;
};

const filterLocations = (data: WeatherData, favorites: number[]): WeatherData =>
  Object.keys(data)
    .map((geoid) => (geoid === 'nan' ? 0 : Number(geoid)))
    .filter((geoid) => favorites.includes(Number(geoid)))
    .reduce(
      (obj, key) => ({ ...obj, [key]: data[key === 0 ? 'nan' : key] }),
      {}
    );

export default (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state = INITIAL_STATE,
  action: ForecastActionTypes
): ForecastState => {
  switch (action.type) {
    case FETCH_FORECAST: {
      return {
        ...state,
        loading: true,
        error: false,
      };
    }

    case FETCH_FORECAST_SUCCESS: {
      return {
        ...state,
        data: filterLocations(
          { ...state.data, ...formatData(action.data) },
          action.favorites
        ),
        fetchTimestamp: action.timestamp,
        fetchSuccessTime: action.timestamp,
        loading: false,
        error: false,
      };
    }

    case FETCH_FORECAST_ERROR: {
      return {
        ...state,
        loading: false,
        error: action.error,
        fetchTimestamp: action.timestamp,
      };
    }

    case UPDATE_DISPLAY_PARAMS: {
      const [, param] = action.param;
      const defaultParameters =
        state.displayParams.length > 0
          ? state.displayParams
          : (action.defaultParameters.map((item) => [
              constants.indexOf(String(item)),
              item,
            ]) as [number, DisplayParameters][]);
      return {
        ...state,
        displayParams: defaultParameters.some((arr) => arr.includes(param))
          ? defaultParameters.filter((arr) => !arr.includes(param))
          : defaultParameters.concat([
              [constants.indexOf(String(param)), param],
            ]),
      };
    }

    case RESTORE_DEFAULT_DISPLAY_PARAMS: {
      return {
        ...state,
        displayParams: [],
      };
    }

    case UPDATE_FORECAST_DISPLAY_FORMAT: {
      return {
        ...state,
        displayFormat: action.value,
      };
    }

    case UPDATE_FORECAST_CHART_PARAMETER: {
      return {
        ...state,
        chartDisplayParam: action.value,
      };
    }

    default: {
      return state;
    }
  }
};

export const forecastPersist: PersistConfig = {
  key: 'forecast',
  whitelist: ['displayParams', 'displayFormat', 'chartDisplayParam'],
};
