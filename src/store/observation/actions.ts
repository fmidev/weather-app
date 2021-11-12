import { Dispatch } from 'redux';
import { getObservation } from '@network/WeatherApi';
import {
  FETCH_OBSERVATION,
  FETCH_OBSERVATION_SUCCESS,
  FETCH_OBSERVATION_ERROR,
  SET_STATION_ID,
  ObservationLocation,
  ObservationActionTypes,
  Error,
} from './types';

export const fetchObservation = (
  location: ObservationLocation,
  country: string
) => (dispatch: Dispatch<ObservationActionTypes>) => {
  dispatch({ type: FETCH_OBSERVATION });

  getObservation(location, country)
    .then((data) => {
      dispatch({
        type: FETCH_OBSERVATION_SUCCESS,
        payload: { data, location },
      });
    })
    .catch((error: Error) => {
      dispatch({ type: FETCH_OBSERVATION_ERROR, error });
    });
};

export const setStationId = (key: number | string, id: number) => (
  dispatch: Dispatch<ObservationActionTypes>
) => {
  dispatch({ type: SET_STATION_ID, key, id });
};
