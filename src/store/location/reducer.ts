import { PersistConfig } from '@store/types';
import {
  ADD_FAVORITE,
  DELETE_ALL_FAVORITES,
  DELETE_FAVORITE,
  UPDATE_RECENT_SEARCHES,
  DELETE_ALL_RECENT_SEARCHES,
  FETCH_AUTOCOMPLETE,
  LocationState,
  LocationActionTypes,
  SET_CURRENT_LOCATION,
  RESET_AUTOCOMPLETE,
} from './types';

const INITIAL_STATE: LocationState = {
  favorites: [],
  recent: [],
  search: [],
  current: undefined,
  isGeolocation: undefined,
};

export default (
  state = INITIAL_STATE,
  action: LocationActionTypes
): LocationState => {
  switch (action.type) {
    case ADD_FAVORITE: {
      const { location } = action;
      delete location.isGeolocation;
      return {
        ...state,
        favorites: [...state.favorites, location].slice(-action.max),
      };
    }

    case DELETE_FAVORITE: {
      return {
        ...state,
        favorites: state.favorites.filter(({ id }) => id !== action.id),
      };
    }

    case DELETE_ALL_FAVORITES: {
      return {
        ...state,
        favorites: [],
      };
    }

    case UPDATE_RECENT_SEARCHES: {
      return {
        ...state,
        recent: state.recent
          .filter(({ id }) => id !== action.location.id)
          .concat(action.location)
          .slice(-action.max),
      };
    }

    case DELETE_ALL_RECENT_SEARCHES: {
      return {
        ...state,
        recent: [],
      };
    }

    case SET_CURRENT_LOCATION: {
      const { location } = action;
      delete location.isGeolocation;
      return {
        ...state,
        current: location,
        isGeolocation: action.isGeolocation || false,
      };
    }

    case FETCH_AUTOCOMPLETE: {
      return {
        ...state,
        search: action.data?.autocomplete?.result || [],
      };
    }

    case RESET_AUTOCOMPLETE: {
      return {
        ...state,
        search: [],
      };
    }

    default: {
      return state;
    }
  }
};

export const locationPersist: PersistConfig = {
  key: 'location',
  whitelist: ['favorites', 'recent', 'current'],
};
