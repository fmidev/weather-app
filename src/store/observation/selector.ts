import { Selector, createSelector } from 'reselect';
import { State } from '../types';
import {
  Error,
  ObservationState,
  StationInfo,
  ObservationData,
  StationId,
  Id,
} from './types';

const selectObservationDomain: Selector<State, ObservationState> = (state) =>
  state.observation;

export const selectLoading = createSelector<State, ObservationState, boolean>(
  selectObservationDomain,
  (observation) => observation.loading
);

export const selectError = createSelector<
  State,
  ObservationState,
  Error | boolean | string
>(selectObservationDomain, (observation) => observation.error);

export const selectStationList = createSelector<
  State,
  ObservationState,
  StationInfo[]
>(selectObservationDomain, (observation) => observation.stations);

const selectDataSets = createSelector<State, ObservationState, ObservationData>(
  selectObservationDomain,
  (observation) => observation.data
);

const selectStationIdList = createSelector<State, ObservationState, StationId>(
  selectObservationDomain,
  (observation) => observation.stationId
);

export const selectDataId = createSelector<State, ObservationState, Id>(
  selectObservationDomain,
  (observation) => observation.id
);

export const selectStationId = createSelector(
  [selectDataId, selectStationIdList],
  (id, stations) => stations[id] || 0
);

export const selectData = createSelector(
  [selectDataSets, selectStationId],
  (data, id) => data[id] || []
);
