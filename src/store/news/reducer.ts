import { PersistConfig } from '@store/types';
import {
  NewsState,
  NewsActionTypes,
  FETCH_NEWS,
  FETCH_NEWS_SUCCESS,
  FETCH_NEWS_ERROR,
} from './types';

const INITIAL_STATE: NewsState = {
  news: [],
  loading: false,
  error: false,
  fetchTimestamp: Date.now(),
  fetchSuccessTime: 0,
};

export default (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state = INITIAL_STATE,
  action: NewsActionTypes,
): NewsState => {
  switch (action.type) {
    case FETCH_NEWS: {
      return {
        ...state,
        loading: true,
        error: false,
      };
    }

    case FETCH_NEWS_SUCCESS: {
      return {
        ...state,
        loading: false,
        error: false,
        news: action.data,
        fetchTimestamp: action.timestamp,
        fetchSuccessTime: action.timestamp,
      };
    }

    case FETCH_NEWS_ERROR: {
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

export const newsPersist: PersistConfig = {
  key: 'news',
  whitelist: [],
};
