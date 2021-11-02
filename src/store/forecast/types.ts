export const FETCH_FORECAST = 'FETCH_FORECAST';
export const FETCH_FORECAST_SUCCESS = 'FETCH_FORECAST_SUCCESS';
export const FETCH_FORECAST_ERROR = 'FETCH_FORECAST_ERROR';
export const UPDATE_DISPLAY_PARAMS = 'UPDATE_DISPLAY_PARAMETERS';
export const RESTORE_DEFAULT_DISPLAY_PARAMS =
  'RESTORE_DEFAULT_DISPLAY_PARAMETERS';

interface FetchForecast {
  type: typeof FETCH_FORECAST;
}

interface FetchForecastSuccess {
  type: typeof FETCH_FORECAST_SUCCESS;
  data: {
    data: WeatherData;
    favorites: number[];
  };
}

interface FetchForecastError {
  type: typeof FETCH_FORECAST_ERROR;
  error: Error;
}

interface UpdateDisplayParams {
  type: typeof UPDATE_DISPLAY_PARAMS;
  param: [number, string];
}

interface RestoreDefaultDisplayParams {
  type: typeof RESTORE_DEFAULT_DISPLAY_PARAMS;
}

export type ForecastActionTypes =
  | FetchForecast
  | FetchForecastSuccess
  | FetchForecastError
  | UpdateDisplayParams
  | RestoreDefaultDisplayParams;

// copied almost as is from https://github.com/fmidev/mobileweather/blob/2b15990947985506a7b0711eef6df5c5826078b5/www/js/main.js#L554
export interface TimestepData {
  epochtime: number;
  name: string;
  latitude: number;
  longitude: number;
  region: string;
  country: string;
  iso2: string;
  localtz: string;
  sunrise: string;
  sunset: string;
  origintime: string;
  modtime: string;
  temperature: number;
  smartSymbol: number;
  pop: number;
  windspeedms: number;
  winddirection: number;
  windcompass8: string;
  hourlymaximumgust: number;
  precipitation1h: number;
  feelsLike: number;
  dark: number;
  [key: string]: string | number;
}
export interface Location {
  geoid?: number;
  latlon?: string;
}

export interface WeatherData {
  [geoid: string]: TimestepData[];
}

export interface Error {
  code: number;
  message: string;
}

export interface ForecastState {
  data: WeatherData | {};
  loading: boolean;
  error: boolean | Error | string;
  displayParams: [number, string][];
}
