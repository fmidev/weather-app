import { Dispatch } from 'react';
import getWarnings from '@network/WarningsApi';
import { Location } from '@store/location/types';
import getCapWarnings from '@network/CapWarningsApi';
import {
  Error,
  FETCH_CAP_WARNINGS,
  FETCH_CAP_WARNINGS_SUCCESS,
  FETCH_WARNINGS,
  FETCH_WARNINGS_ERROR,
  FETCH_WARNINGS_SUCCESS,
  WarningsActionTypes,
} from './types';

const fetchWarnings =
  (location: Location) => (dispatch: Dispatch<WarningsActionTypes>) => {
    dispatch({ type: FETCH_WARNINGS });

    getWarnings(location)
      .then(({ data }) => {
        dispatch({
          type: FETCH_WARNINGS_SUCCESS,
          data,
          id: location.id,
          timestamp: Date.now(),
        });
      })
      .catch((error: Error) => {
        dispatch({ type: FETCH_WARNINGS_ERROR, error, timestamp: Date.now() });
      });
  };

const fetchCapWarnings = () => (dispatch: Dispatch<WarningsActionTypes>) => {
  dispatch({ type: FETCH_CAP_WARNINGS });

  getCapWarnings()
    .then((data) => {
      dispatch({
        type: FETCH_CAP_WARNINGS_SUCCESS,
        data: data.warnings,
        timestamp: data.updated,
      });
    })
    .catch((error: Error) => {
      dispatch({ type: FETCH_WARNINGS_ERROR, error, timestamp: Date.now() });
    });
};

export default fetchWarnings;
export { fetchWarnings, fetchCapWarnings };
