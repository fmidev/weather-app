export const FETCH_OBSERVATION = 'FETCH_OBSERVATION';
export const FETCH_OBSERVATION_SUCCESS = 'FETCH_OBSERVATION_SUCCESS';
export const FETCH_OBSERVATION_ERROR = 'FETCH_OBSERVATION_ERROR';
export const SET_STATION_ID = 'SET_STATION_ID';

interface FetchObservation {
  type: typeof FETCH_OBSERVATION;
}

interface FetchObservationSuccess {
  type: typeof FETCH_OBSERVATION_SUCCESS;
  payload: {
    data: ObservationDataRaw;
    location: Location;
  };
}

interface FetchObservationError {
  type: typeof FETCH_OBSERVATION_ERROR;
  error: Error;
}

interface SetStationId {
  type: typeof SET_STATION_ID;
  key: number | string;
  id: number;
}

export type ObservationActionTypes =
  | FetchObservation
  | FetchObservationSuccess
  | FetchObservationError
  | SetStationId;

export interface TimeStepData {
  epochtime: number;
  cloudheight: number | null;
  dewpoint: number | null;
  humidity: number | null;
  precipitation1h: number | null;
  pressure: number | null;
  ri_10min: number | null;
  snowdepth: number | null;
  temperature: number | null;
  totalcloudcover: number | null;
  visibility: number | null;
  windcompass8: string | null;
  winddirection: string | null;
  windgust: number | null;
  windspeedms: number | null;
  ww_aws: number | null;
}

export interface Location {
  geoid?: number;
  latlon?: string;
}

export interface StationInfo {
  id: number;
  name: string;
  distance: number;
}

export type ObservationDataRaw = {
  [id: number]: {
    [name: string]: {
      [distance: number]: TimeStepData[];
    };
  };
};

export interface ObservationData {
  [id: number]: TimeStepData[];
}

export interface Error {
  code: number;
  message: string;
}

export type Id = number | string;

export type StationId = {
  [id in Id]: number;
};

export interface ObservationState {
  data: ObservationData | {};
  stations: StationInfo[] | [];
  stationId: StationId | {};
  id: Id;
  loading: boolean;
  error: boolean | Error | string;
}
