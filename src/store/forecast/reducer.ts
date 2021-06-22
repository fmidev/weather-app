import {
  FETCH_FORECAST,
  FETCH_FORECAST_SUCCESS,
  FETCH_FORECAST_ERROR,
  ForecastActionTypes,
  ForecastState,
  WeatherData,
} from './types';

const INITIAL_STATE: ForecastState = {
  data: {},
  loading: false,
  error: false,
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

    default: {
      return state;
    }
  }
};
