import {
  SET_LANGUAGE,
  GET_FAVORITES,
  ADD_FAVORITE,
  DELETE_FAVORITE,
  SettingsState,
  SettingsActionTypes,
} from './types';

const INITIAL_STATE: SettingsState = {
  locale: 'FI',
  favorites: [],
};

export default (
  state = INITIAL_STATE,
  action: SettingsActionTypes
): SettingsState => {
  switch (action.type) {
    case SET_LANGUAGE: {
      return {
        ...state,
        locale: action.locale,
      };
    }

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
    default: {
      return state;
    }
  }
};
