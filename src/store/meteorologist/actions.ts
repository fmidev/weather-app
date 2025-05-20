import { Dispatch } from 'react';
import getMeteorologistSnapshot from '@network/MeteorologistSnapshotApi';
import {
  Error,
  FETCH_SNAPSHOT,
  FETCH_SNAPSHOT_SUCCESS,
  FETCH_SNAPSHOT_ERROR,
  MeteorologistSnapshotActionTypes,
} from './types';

const fetchMeteorologistSnapshot =
  () => (dispatch: Dispatch<MeteorologistSnapshotActionTypes>) => {
    dispatch({ type: FETCH_SNAPSHOT });

    getMeteorologistSnapshot()
      .then((data) => {
        dispatch({
          type: FETCH_SNAPSHOT_SUCCESS,
          data,
          timestamp: Date.now(),
        });
      })
      .catch((error: Error) => {
        dispatch({
          type: FETCH_SNAPSHOT_ERROR,
          error,
          timestamp: Date.now(),
        });
      });
  };

export default fetchMeteorologistSnapshot;
export { fetchMeteorologistSnapshot };