export const GET_FAVORITES = 'GET_FAVORITES';
export const ADD_FAVORITE = 'ADD_FAVORITE';
export const DELETE_FAVORITE = 'DELETE_FAVORITE';
export const INIT_SETTINGS = 'INIT_SETTINGS';
export const UPDATE_UNITS = 'UPDATE_UNITS';

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

interface InitSettings {
  type: typeof INIT_SETTINGS;
  favorites: Location[] | undefined;
  units: UnitMap | undefined;
}

interface UpdateUnits {
  type: typeof UPDATE_UNITS;
  units: UnitMap;
}

export type SettingsActionTypes =
  | GetFavorites
  | AddFavorite
  | DeleteFavorite
  | InitSettings
  | UpdateUnits;

export type Location = {
  name: string;
  area: string;
  lat: number;
  lon: number;
  id: number;
};
export interface SettingsState {
  favorites: Location[] | [];
  units: UnitMap | undefined;
}
