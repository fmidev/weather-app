import { Dispatch } from 'redux';
import { getObservation } from '@network/WeatherApi';
import {
  FETCH_OBSERVATION,
  FETCH_OBSERVATION_SUCCESS,
  FETCH_OBSERVATION_ERROR,
  SET_STATION_ID,
  Location,
  ObservationActionTypes,
  Error,
} from './types';

export const fetchObservation = (location: Location) => (
  dispatch: Dispatch<ObservationActionTypes>
) => {
  dispatch({ type: FETCH_OBSERVATION });

  getObservation(location)
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
