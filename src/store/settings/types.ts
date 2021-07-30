export const GET_FAVORITES = 'GET_FAVORITES';
export const ADD_FAVORITE = 'ADD_FAVORITE';
export const DELETE_FAVORITE = 'DELETE_FAVORITE';
export const DELETE_ALL_FAVORITES = 'DELETE_ALL_FAVORITES';

export const GET_RECENT_SEARCHES = 'GET_RECENT_SEARCHES';
export const UPDATE_RECENT_SEARCHES = 'UPDATE_RECENT_SEARCHES';
export const DELETE_ALL_RECENT_SEARCHES = 'DELETE_ALL_RECENT_SEARCHES';

export const INIT_SETTINGS = 'INIT_SETTINGS';
export const UPDATE_UNITS = 'UPDATE_UNITS';
export const UPDATE_THEME = 'UPDATE_THEME';

export type UnitType = {
  unitId: number;
  unitAbb: string;
  unit: string;
  unitPrecision: number;
};

export interface UnitMap {
  [key: string]: UnitType;
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
  id: number;
}

interface DeleteAllFavorites {
  type: typeof DELETE_ALL_FAVORITES;
}

interface GetRecentSearches {
  type: typeof GET_RECENT_SEARCHES;
  recentSearches: Location[];
}

interface UpdateRecentSearches {
  type: typeof UPDATE_RECENT_SEARCHES;
  recentSearches: Location[];
}

interface DeleteAllRecentSearches {
  type: typeof DELETE_ALL_RECENT_SEARCHES;
}

interface InitSettings {
  type: typeof INIT_SETTINGS;
  favorites: Location[] | undefined;
  recentSearches: Location[] | undefined;
  units: UnitMap | undefined;
  theme: Theme;
}

interface UpdateUnits {
  type: typeof UPDATE_UNITS;
  units: UnitMap;
}

interface UpdateTheme {
  type: typeof UPDATE_THEME;
  theme: Theme;
}

export type Theme = 'light' | 'dark' | 'automatic';

export type SettingsActionTypes =
  | GetFavorites
  | AddFavorite
  | DeleteFavorite
  | InitSettings
  | UpdateUnits
  | UpdateTheme
  | DeleteAllFavorites
  | GetRecentSearches
  | UpdateRecentSearches
  | DeleteAllRecentSearches;

export type Location = {
  name: string;
  area: string;
  lat: number;
  lon: number;
  id: number;
};
export interface SettingsState {
  favorites: Location[] | [];
  recentSearches: Location[] | [];
  units: UnitMap | undefined;
  theme?: Theme;
}
