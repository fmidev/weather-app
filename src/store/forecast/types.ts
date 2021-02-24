export const FETCH_FORECAST = 'FETCH_FORECAST';
export const FETCH_FORECAST_SUCCESS = 'FETCH_FORECAST_SUCCESS';
export const FETCH_FORECAST_ERROR = 'FETCH_FORECAST_ERROR';

interface FetchForecast {
  type: typeof FETCH_FORECAST;
}

interface FetchForecastSuccess {
  type: typeof FETCH_FORECAST_SUCCESS;
  data: Item[] | [];
}

interface FetchForecastError {
  type: typeof FETCH_FORECAST_ERROR;
  error: Error;
}

export type ForecastActionTypes =
  | FetchForecast
  | FetchForecastSuccess
  | FetchForecastError;

// copied almost as is from https://github.com/fmidev/mobileweather/blob/2b15990947985506a7b0711eef6df5c5826078b5/www/js/main.js#L554
export interface Item {
  temperature: string;
  feelsLike: string;
  feelsLikeIcon: string;
  timeString: string;
  symbol: string;
  windcopass: string;
  pop: string;
  precipation1h: string;
  geoId: string;
  latitude: number;
  longitude: number;
  name: string;
  iso2: string;
  sunInfo: string;
  polarNight: string;
  modTime: string;
  cached: boolean;
}

export interface Error {
  code: number;
  message: string;
}

export interface ForecastState {
  data: Item[] | [];
  loading: boolean;
  error: boolean | Error | string;
}
