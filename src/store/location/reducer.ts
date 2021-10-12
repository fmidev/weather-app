import { PersistConfig } from '@store/types';
import { Config } from '@config';
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
  SET_GEOLOCATION,
} from './types';

const INITIAL_STATE: LocationState = {
  favorites: [],
  recent: [],
  search: [],
  current: Config.get('location').default,
};

export default (
  state = INITIAL_STATE,
  action: LocationActionTypes
): LocationState => {
  switch (action.type) {
    case ADD_FAVORITE: {
      return {
        ...state,
        favorites: [...state.favorites, action.location],
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
      return {
        ...state,
        current: action.location,
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

    case SET_GEOLOCATION: {
      return {
        ...state,
        geolocation: action.geolocation,
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
