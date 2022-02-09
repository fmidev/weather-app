import { Dispatch } from 'react';
import getWarnings from '@network/WarningsApi';
import { Location } from '@store/location/types';
import {
  FETCH_WARNINGS,
  FETCH_WARNINGS_SUCCESS,
  WarningsActionTypes,
} from './types';

const fetchWarnings =
  (location: Location) => (dispatch: Dispatch<WarningsActionTypes>) => {
    dispatch({ type: FETCH_WARNINGS });

    getWarnings(location).then((data) => {
      dispatch({
        type: FETCH_WARNINGS_SUCCESS,
        data,
        id: location.id,
      });
    });
  };

export default fetchWarnings;
export { fetchWarnings };
