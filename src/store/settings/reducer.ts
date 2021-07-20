import {
  GET_FAVORITES,
  ADD_FAVORITE,
  DELETE_FAVORITE,
  UPDATE_UNITS,
  UPDATE_THEME,
  SettingsState,
  SettingsActionTypes,
  INIT_SETTINGS,
} from './types';

const INITIAL_STATE: SettingsState = {
  favorites: [],
  units: undefined,
  theme: 'automatic',
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
        units: action.units,
      };
    }

    default: {
      return state;
    }
  }
};
