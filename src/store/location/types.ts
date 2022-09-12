export const SET_CURRENT_LOCATION = 'SET_CURRENT_LOCATION';

export const GET_FAVORITES = 'GET_FAVORITES';
export const ADD_FAVORITE = 'ADD_FAVORITE';
export const DELETE_FAVORITE = 'DELETE_FAVORITE';
export const DELETE_ALL_FAVORITES = 'DELETE_ALL_FAVORITES';

export const GET_RECENT_SEARCHES = 'GET_RECENT_SEARCHES';
export const UPDATE_RECENT_SEARCHES = 'UPDATE_RECENT_SEARCHES';
export const DELETE_ALL_RECENT_SEARCHES = 'DELETE_ALL_RECENT_SEARCHES';

export const FETCH_AUTOCOMPLETE = 'FETCH_AUTOCOMPLETE';
export const RESET_AUTOCOMPLETE = 'RESET_AUTOCOMPLETE';

export const UPDATE_LOCATIONS_LOCALES = 'UPDATE_LOCATIONS_LOCALES';

export const UPDATE_WEATHER_SCREEN_INITIAL_LOCATION =
  'UPDATE_WEATHER_SCREEN_INITIAL_LOCATION';

export const SET_WEATHER_SCREEN_LOCATION_INDEX =
  'SET_WEATHER_SCREEN_LOCATION_INDEX';

export type Location = {
  name: string;
  area: string;
  lat: number;
  lon: number;
  id: number;
  timezone: string;
  country: string;
  isGeolocation?: boolean;
};

export type TimeseriesLocation = {
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  iso2: string;
  localtz: string;
};

export type Geolocation = {
  latitude: number;
  longitude: number;
};

interface SetCurrentLocation {
  type: typeof SET_CURRENT_LOCATION;
  location: Location;
  isGeolocation?: boolean;
}

interface GetFavorites {
  type: typeof GET_FAVORITES;
  favorites: Location[];
}

interface AddFavorite {
  type: typeof ADD_FAVORITE;
  location: Location;
  max: number;
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
  location: Location;
  max: number;
}

interface DeleteAllRecentSearches {
  type: typeof DELETE_ALL_RECENT_SEARCHES;
}

export interface AutoComplete {
  autocomplete: {
    'found-results': number;
    'max-results': number;
    result: Location[] | [];
  };
}

interface FetchAutocomplete {
  type: typeof FETCH_AUTOCOMPLETE;
  data: AutoComplete | undefined;
}

interface ResetAutocomplete {
  type: typeof RESET_AUTOCOMPLETE;
}

interface LocationsToLocale {
  type: typeof UPDATE_LOCATIONS_LOCALES;
  data: { [geoid: string]: TimeseriesLocation[] };
}

interface UpdateWeatherScreenInitialLocation {
  type: typeof UPDATE_WEATHER_SCREEN_INITIAL_LOCATION;
  location: Location;
}

interface SetWeatherScreenInitialLocation {
  type: typeof SET_WEATHER_SCREEN_LOCATION_INDEX;
  index: Number;
}

export type LocationActionTypes =
  | AddFavorite
  | DeleteAllFavorites
  | DeleteAllRecentSearches
  | DeleteFavorite
  | FetchAutocomplete
  | GetFavorites
  | GetRecentSearches
  | ResetAutocomplete
  | SetCurrentLocation
  | UpdateRecentSearches
  | LocationsToLocale
  | UpdateWeatherScreenInitialLocation
  | SetWeatherScreenInitialLocation;

export interface LocationState {
  favorites: Location[] | [];
  recent: Location[] | [];
  search: Location[] | [];
  current: Location | undefined;
  isGeolocation?: boolean;
  weatherScreenInitialLocation?: Location;
  weatherScreenLocationIndex: number;
}
