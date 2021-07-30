import {
  GET_FAVORITES,
  ADD_FAVORITE,
  DELETE_FAVORITE,
  DELETE_ALL_FAVORITES,
  UPDATE_UNITS,
  UPDATE_THEME,
  GET_RECENT_SEARCHES,
  UPDATE_RECENT_SEARCHES,
  DELETE_ALL_RECENT_SEARCHES,
  SettingsState,
  SettingsActionTypes,
  INIT_SETTINGS,
} from './types';

const INITIAL_STATE: SettingsState = {
  favorites: [],
  recentSearches: [],
  units: undefined,
  theme: undefined,
};

export default (
  state = INITIAL_STATE,
  action: SettingsActionTypes
): SettingsState => {
  switch (action.type) {
    case GET_FAVORITES:
    case ADD_FAVORITE: {
      return {
        ...state,
        favorites: action.favorites,
      };
    }

    case DELETE_FAVORITE: {
      return {
        ...state,
        favorites: state.favorites.filter((f) => f.id !== action.id),
      };
    }

    case DELETE_ALL_FAVORITES: {
      return {
        ...state,
        favorites: [],
      };
    }

    case GET_RECENT_SEARCHES: {
      return {
        ...state,
        recentSearches: action.recentSearches,
      };
    }

    case UPDATE_RECENT_SEARCHES: {
      return {
        ...state,
        recentSearches: action.recentSearches,
      };
    }

    case DELETE_ALL_RECENT_SEARCHES: {
      return {
        ...state,
        recentSearches: [],
      };
    }

    case UPDATE_UNITS: {
      return {
        ...state,
        units: action.units,
      };
    }

    case UPDATE_THEME: {
      return {
        ...state,
        theme: action.theme,
      };
    }

    case INIT_SETTINGS: {
      return {
        ...state,
        favorites: action.favorites || [],
        recentSearches: action.recentSearches || [],
        units: action.units,
        theme: action.theme,
      };
    }

    default: {
      return state;
    }
  }
};
