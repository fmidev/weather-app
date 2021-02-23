import {
  FETCH_FORECAST,
  FETCH_FORECAST_SUCCESS,
  FETCH_FORECAST_ERROR,
  ForecastActionTypes,
  ForecastState,
} from './types';

const INITIAL_STATE: ForecastState = {
  data: [],
  loading: false,
  error: false,
};

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
        data: action.data,
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
