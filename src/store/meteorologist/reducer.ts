import { PersistConfig } from '@store/types';
import {
  MeteorologistState,
  MeteorologistSnapshotActionTypes,
  FETCH_SNAPSHOT,
  FETCH_SNAPSHOT_SUCCESS,
  FETCH_SNAPSHOT_ERROR,
} from './types';

const INITIAL_STATE: MeteorologistState = {
  snapshot: null,
  loading: false,
  error: false,
  fetchTimestamp: Date.now(),
  fetchSuccessTime: 0,
};

export default (
  state = INITIAL_STATE,
  action: MeteorologistSnapshotActionTypes,
): MeteorologistState => {
  switch (action.type) {
    case FETCH_SNAPSHOT: {
      return {
        ...state,
        loading: true,
        error: false,
      };
    }

    case FETCH_SNAPSHOT_SUCCESS: {
      return {
        ...state,
        loading: false,
        error: false,
        snapshot: action.data,
        fetchTimestamp: action.timestamp,
        fetchSuccessTime: action.timestamp,
      };
    }

    case FETCH_SNAPSHOT_ERROR: {
      return {
        ...state,
        loading: false,
        error: action.error,
        fetchTimestamp: action.timestamp,
      };
    }

    default: {
      return state;
    }
  }
};

export const meteorologistPersist: PersistConfig = {
  key: 'meteorologist',
  whitelist: [],
};
