export const SET_LANGUAGE = 'SET_LANGUAGE';
export const GET_FAVORITES = 'GET_FAVORITES';
export const ADD_FAVORITE = 'ADD_FAVORITE';
export const DELETE_FAVORITE = 'DELETE_FAVORITE';

export type Locale = 'FI' | 'SE' | 'EN';

interface SetLanguage {
  type: typeof SET_LANGUAGE;
  locale: Locale;
}

interface GetFavorites {
  type: typeof GET_FAVORITES;
  favorites: Location[];
}

interface AddFavorite {
  type: typeof ADD_FAVORITE;
  favorites: Location[];
}

interface DeleteFavorite {
  type: typeof DELETE_FAVORITE;
  geoid: number;
}

export type SettingsActionTypes =
  | SetLanguage
  | GetFavorites
  | AddFavorite
  | DeleteFavorite;

export interface Location {
  geoid: number;
  name: string;
}

export interface SettingsState {
  locale: Locale;
  favorites: Location[] | [];
}
