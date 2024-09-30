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
  UPDATE_LOCATIONS_LOCALES,
  TimeseriesLocation,
  SET_LOADING,
} from './types';
import { roundCoordinates } from '@utils/helpers';

const INITIAL_STATE: LocationState = {
  favorites: [],
  recent: [],
  search: [],
  current: undefined,
  isGeolocation: undefined,
  loading: false,
};

const cleanAreaFromTimeseries = (location: TimeseriesLocation) =>
  location?.iso2 === 'FI' && location?.country === location?.region
    ? ''
    : location?.region;

export default (
  // eslint-disable-next-line @typescript-eslint/default-param-last
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

      if (isNaN(location.id)) {
        location.name = `${roundCoordinates(location.lat)}, ${roundCoordinates(
          location.lon
        )}`;
        location.area = '';
      } else if (
        location.id === state.current?.id &&
        location.name === state.current?.name // App language may have changed
      ) {
        return state; // No change
      }

      return {
        ...state,
        current: {
          ...location,
          lon: roundCoordinates(location.lon),
          lat: roundCoordinates(location.lat),
        },
        isGeolocation: action.isGeolocation || false,
      };
    }

    case FETCH_AUTOCOMPLETE: {
      return {
        ...state,
        search: action.data?.autocomplete?.result || [],
        loading: false,
      };
    }

    case RESET_AUTOCOMPLETE: {
      return {
        ...state,
        search: [],
        loading: false,
      };
    }

    case UPDATE_LOCATIONS_LOCALES: {
      return {
        ...state,
        favorites: state.favorites.map((item) => ({
          ...item,
          name: action.data[item.id]?.[0]?.name || item.name,
          area: cleanAreaFromTimeseries(action.data[item.id]?.[0]) || item.area,
        })),
        recent: state.recent.map((item) => ({
          ...item,
          name: action.data[item.id]?.[0]?.name || item.name,
          area: cleanAreaFromTimeseries(action.data[item.id]?.[0]) || item.area,
        })),
        current: state.current && {
          ...state.current,
          name: action.data[state.current.id]?.[0]?.name || state.current.name,
          area:
            cleanAreaFromTimeseries(action.data[state.current.id]?.[0]) ||
            state.current.area,
        },
      };
    }

    case SET_LOADING: {
      return {
        ...state,
        loading: action.loading,
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
