import { Dispatch } from 'redux';
import getWarnings from '@network/WarningsApi';
import { Location } from '@store/location/types';
import getCapWarnings from '@network/CapWarningsApi';
import i18n from '@i18n';
import { State } from '@store/types';
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
  (location: Location) => async (
    dispatch: Dispatch<WarningsActionTypes>,
    getState: () => Pick<State, 'warnings'>
  ) => {
    // Publication times are shared across locations and languages.
    const requestKey = JSON.stringify([location.id, location.lat, location.lon, i18n.language]);
    const { warnings } = getState();
    if (warnings.updatedRequestKey !== requestKey || !warnings.data[location.id] || warnings.error) {
      dispatch({ type: FETCH_WARNINGS });
    }

    try {
      const { data } = await getWarnings(location);
      dispatch({
        type: FETCH_WARNINGS_SUCCESS,
        data,
        id: location.id,
        timestamp: Date.now(),
        requestKey,
      });
    } catch (error) {
      dispatch({ type: FETCH_WARNINGS_ERROR, error: error as Error, timestamp: Date.now() });
    }
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
