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
} from './types';

const INITIAL_STATE: ForecastState = {
  data: {},
  loading: false,
  error: false,
  displayParams: [],
  displayFormat: 'table',
  chartDisplayParam: undefined,
  fetchTimestamp: Date.now(),
};

const formatData = (data: WeatherData[]): WeatherData => {
  const weatherData: WeatherData = {};
  data.forEach((foo) => {
    Object.entries(foo).forEach(([id, steps]) => {
      Object.assign(weatherData, { [id]: weatherData[id] || [] });
      weatherData[id] = steps.map((step) => ({
        ...(weatherData[id].find(
          ({ epochtime }) => epochtime === step.epochtime
        ) || {}),
        ...step,
      }));
    });
  });
  return weatherData;
};

const filterLocations = (data: WeatherData, favorites: number[]): WeatherData =>
  Object.keys(data)
    .filter((geoid) => favorites.includes(Number(geoid)))
    .reduce((obj, key) => ({ ...obj, [key]: data[key] }), {});

export default (
  state = INITIAL_STATE,
  action: ForecastActionTypes
): ForecastState => {
  switch (action.type) {
    case FETCH_FORECAST: {
      return {
        ...state,
        loading: true,
      };
    }

    case FETCH_FORECAST_SUCCESS: {
      return {
        ...state,
        data: filterLocations(
          { ...state.data, ...formatData(action.data) },
          action.favorites
        ),
        // data: formatData([state.data || {}, ...action.data], action.favorites),
        fetchTimestamp: action.timestamp,
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
          : action.defaultParameters;
      return {
        ...state,
        displayParams: defaultParameters.some((arr) => arr.includes(param))
          ? defaultParameters.filter((arr) => !arr.includes(param))
          : defaultParameters.concat([action.param]),
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
