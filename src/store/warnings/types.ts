export const FETCH_WARNINGS = 'FETCH_WARNINGS';
export const FETCH_WARNINGS_SUCCESS = 'FETCH_WARNINGS_SUCCESS';
export const FETCH_WARNINGS_ERROR = 'FETCH_WARNINGS_ERROR';

interface FetchWarnings {
  type: typeof FETCH_WARNINGS;
}

interface FetchWarningsSuccess {
  type: typeof FETCH_WARNINGS_SUCCESS;
  data: WarningsData;
  id: number;
}

interface FetchWarningsError {
  type: typeof FETCH_WARNINGS_ERROR;
  error: Error;
}

export type WarningsActionTypes =
  | FetchWarnings
  | FetchWarningsSuccess
  | FetchWarningsError;

export type WarningType =
  | 'thunderStorm'
  | 'wind'
  | 'rain'
  | 'trafficWeather'
  | 'pedestrianSafety'
  | 'forestFireWeather'
  | 'grassFireWeather'
  | 'hotWeather'
  | 'coldWeather'
  | 'uvNote';
// | 'floodLevel';

export type Severity = 'Moderate' | 'Severe' | 'Extreme';

export interface Warning {
  type: WarningType;
  language: string;
  duration: {
    startTime: string;
    endTime: string;
  };
  severity: Severity;
  description: string;
}

export interface LocationWarnings {
  [id: number]: WarningsData;
}

export interface WarningsData {
  warnings: Warning[];
  updated: string;
  error: number;
}

export interface Error {
  code: number;
  message: string;
}

export interface WarningsState {
  data: LocationWarnings;
  loading: boolean;
  error: boolean | Error | string;
}
