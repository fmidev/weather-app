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
} from './types';

import * as constants from './constants';

const INITIAL_PARAMS = [
  [0, constants.SMART_SYMBOL],
  [1, constants.TEMPERATURE],
  [3, constants.WIND_SPEED_AND_DIRECTION],
  [5, constants.PRECIPITATION_1H],
] as [number, string][];

const INITIAL_STATE: ForecastState = {
  data: {},
  loading: false,
  error: false,
  displayParams: INITIAL_PARAMS,
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
          { ...state.data, ...action.data.data },
          action.data.favorites
        ),
        loading: false,
        error: false,
      };
    }

    case FETCH_FORECAST_ERROR: {
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    }

    case UPDATE_DISPLAY_PARAMS: {
      const [, param] = action.param;
      return {
        ...state,
        displayParams: state.displayParams.some((arr) => arr.includes(param))
          ? state.displayParams.filter((arr) => !arr.includes(param))
          : state.displayParams.concat([action.param]),
      };
    }

    case RESTORE_DEFAULT_DISPLAY_PARAMS: {
      return {
        ...state,
        displayParams: INITIAL_PARAMS,
      };
    }

    default: {
      return state;
    }
  }
};

export const forecastPersist: PersistConfig = {
  key: 'forecast',
  whitelist: ['displayParams'],
};
