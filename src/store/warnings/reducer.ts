import { PersistConfig } from '@store/types';
import {
  WarningsState,
  WarningsActionTypes,
  FETCH_WARNINGS,
  FETCH_WARNINGS_SUCCESS,
  FETCH_WARNINGS_ERROR,
  FETCH_CAP_WARNINGS,
  FETCH_CAP_WARNINGS_SUCCESS,
} from './types';

const INITIAL_STATE: WarningsState = {
  data: {},
  capData: undefined,
  loading: false,
  error: false,
  fetchTimestamp: Date.now(),
  fetchSuccessTime: 0,
};

export default (
  state = INITIAL_STATE,
  action: WarningsActionTypes
): WarningsState => {
  switch (action.type) {
    case FETCH_WARNINGS:
    case FETCH_CAP_WARNINGS: {
      return {
        ...state,
        loading: true,
        error: false,
      };
    }

    case FETCH_WARNINGS_SUCCESS: {
      return {
        ...state,
        error: false,
        loading: false,
        data: {
          ...state.data,
          [action.id]: action.data,
        },
        fetchTimestamp: action.timestamp,
        fetchSuccessTime: action.timestamp,
      };
    }

    case FETCH_WARNINGS_ERROR: {
      return {
        ...state,
        loading: false,
        error: action.error,
        fetchTimestamp: action.timestamp,
      };
    }

    case FETCH_CAP_WARNINGS_SUCCESS: {
      return {
        ...state,
        error: false,
        loading: false,
        capData: action.data,
        fetchTimestamp: action.timestamp,
        fetchSuccessTime: action.timestamp,
      };
    }

    default: {
      return state;
    }
  }
};

export const warningsPersist: PersistConfig = {
  key: 'warnings',
  whitelist: [],
};
