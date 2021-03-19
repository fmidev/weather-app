import {
  GET_FAVORITES,
  ADD_FAVORITE,
  DELETE_FAVORITE,
  SettingsState,
  SettingsActionTypes,
} from './types';

const INITIAL_STATE: SettingsState = {
  favorites: [],
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
    default: {
      return state;
    }
  }
};
