import { ChartType } from '@components/weather/charts/types';

export const FETCH_OBSERVATION = 'FETCH_OBSERVATION';
export const FETCH_OBSERVATION_SUCCESS = 'FETCH_OBSERVATION_SUCCESS';
export const FETCH_OBSERVATION_ERROR = 'FETCH_OBSERVATION_ERROR';
export const SET_STATION_ID = 'SET_STATION_ID';
export const UPDATE_OBSERVATION_DISPLAY_FORMAT =
  'UPDATE_OBSERVATION_DISPLAY_FORMAT';
export const UPDATE_OBSERVATION_CHART_PARAMETER =
  'UPDATE_OBSERVATION_CHART_PARAMETER';

interface FetchObservation {
  type: typeof FETCH_OBSERVATION;
}

interface FetchObservationSuccess {
  type: typeof FETCH_OBSERVATION_SUCCESS;
  payload: {
    data: ObservationDataRaw;
    location: ObservationLocation;
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

interface UpdateDisplayFormat {
  type: typeof UPDATE_OBSERVATION_DISPLAY_FORMAT;
  value: 'table' | 'chart';
}

interface UpdateObservationChartParameter {
  type: typeof UPDATE_OBSERVATION_CHART_PARAMETER;
  value: ChartType;
}

export type ObservationActionTypes =
  | FetchObservation
  | FetchObservationSuccess
  | FetchObservationError
  | SetStationId
  | UpdateDisplayFormat
  | UpdateObservationChartParameter;

export interface TimeStepData {
  epochtime: number;
  cloudheight: number | null;
  dewpoint: number | null;
  humidity: number | null;
  precipitation1h: number | null;
  pressure: number | null;
  ri_10min: number | null;
  snowDepth: number | null;
  temperature: number | null;
  totalcloudcover: number | null;
  visibility: number | null;
  windcompass8: string | null;
  winddirection: number | null;
  windgust: number | null;
  windspeedms: number | null;
  ww_aws: number | null;
}

export interface ObservationLocation {
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
  data: ObservationData | undefined;
  stations: StationInfo[] | [];
  stationId: StationId | undefined;
  id: Id;
  loading: boolean;
  error: boolean | Error | string;
  displayFormat: 'table' | 'chart';
  chartDisplayParam: ChartType | undefined;
}
