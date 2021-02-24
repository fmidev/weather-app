import { Dispatch } from 'redux';
import {
  Item,
  Error,
  FETCH_FORECAST,
  FETCH_FORECAST_SUCCESS,
  FETCH_FORECAST_ERROR,
  ForecastActionTypes,
} from './types';

interface ApiResponse<T> extends Response {
  data?: T;
}

export const fetchForecast = () => (
  dispatch: Dispatch<ForecastActionTypes>
) => {
  dispatch({ type: FETCH_FORECAST });

  fetch('https://example.endpoint.com/api')
    .then((response: ApiResponse<Item[]>) => {
      const { data } = response;
      dispatch({ type: FETCH_FORECAST_SUCCESS, data: data || [] });
    })
    .catch((error: Error) => dispatch({ type: FETCH_FORECAST_ERROR, error }));
};
