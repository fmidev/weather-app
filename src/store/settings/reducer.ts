import {
  GET_FAVORITES,
  ADD_FAVORITE,
  DELETE_FAVORITE,
  UPDATE_UNITS,
  SettingsState,
  SettingsActionTypes,
  INIT_SETTINGS,
} from './types';

const INITIAL_STATE: SettingsState = {
  favorites: [],
  units: undefined,
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
        favorites: state.favorites.filter((f) => f.geoid !== action.geoid),
      };
    }

    case UPDATE_UNITS: {
      return {
        ...state,
        units: action.units,
      };
    }

    case INIT_SETTINGS: {
      return {
        ...state,
        favorites: action.favorites || [],
        units: action.units,
      };
    }

    default: {
      return state;
    }
  }
};
