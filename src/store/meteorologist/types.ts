export const FETCH_SNAPSHOT = 'FETCH_SNAPSHOT';
export const FETCH_SNAPSHOT_SUCCESS = 'FETCH_SNAPSHOT_SUCCESS';
export const FETCH_SNAPSHOT_ERROR = 'FETCH_SNAPSHOT_ERROR';

interface FetchSnapshot {
  type: typeof FETCH_SNAPSHOT;
}

interface FetchSnapshotSuccess {
  type: typeof FETCH_SNAPSHOT_SUCCESS;
  data: MeteorologistSnapshot;
  timestamp: number;
}

interface FetchSnapshotError {
  type: typeof FETCH_SNAPSHOT_ERROR;
  error: Error;
  timestamp: number;
}

export type MeteorologistSnapshotActionTypes =
  | FetchSnapshot
  | FetchSnapshotSuccess
  | FetchSnapshotError;

export interface MeteorologistSnapshot {
  title: string;
  text: string;
  hasAlert: boolean;
  date: string;
}

export interface Error {
  code: number;
  message: string;
}

export interface MeteorologistState {
  snapshot: MeteorologistSnapshot | null;
  loading: boolean;
  error: boolean | Error | string;
  fetchTimestamp: number;
  fetchSuccessTime: number;
}
