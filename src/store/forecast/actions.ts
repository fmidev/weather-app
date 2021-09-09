import { Dispatch } from 'redux';
import { getForecast } from '@network/WeatherApi';
import {
  Error,
  FETCH_FORECAST,
  FETCH_FORECAST_SUCCESS,
  FETCH_FORECAST_ERROR,
  ForecastActionTypes,
  Location,
} from './types';

export const fetchForecast = (
  location: Location,
  filterLocations: number[] = []
) => (dispatch: Dispatch<ForecastActionTypes>) => {
  dispatch({ type: FETCH_FORECAST });

  getForecast(location)
    .then((data) => {
      const geoid = Number(Object.keys(data)[0]);
      const favorites = [...filterLocations, geoid];
      dispatch({
        type: FETCH_FORECAST_SUCCESS,
        data: {
          data,
          favorites,
        },
      });

      /**
      TODO: Dispatch selected location geoid, name, region to LOCATION
      dispatch({
        type: TODO,
        data: {
          geoid,
          name: Object.values(shit)[0][0]?.name,
          region: Object.values(shit)[0][0]?.region,
        },
      });
      */
    })
    .catch((error: Error) => {
      dispatch({ type: FETCH_FORECAST_ERROR, error });
    });
};

export default fetchForecast;
