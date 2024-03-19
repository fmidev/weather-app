import { Selector, createSelector } from 'reselect';
import { State } from '../types';
import { ObservationState } from './types';

const PRIMARY_STATION_TYPES = ['AWS', 'AVI'];

const selectObservationDomain: Selector<State, ObservationState> = (state) =>
  state.observation;

export const selectLoading = createSelector(
  selectObservationDomain,
  (observation) => observation.loading
);

export const selectError = createSelector(
  selectObservationDomain,
  (observation) => observation.error
);

export const selectStationList = createSelector(
  selectObservationDomain,
  (observation) => [
    ...observation.stations
      .filter((station) => PRIMARY_STATION_TYPES.includes(station.type))
      .sort((a, b) => a.distance - b.distance),
    ...observation.stations
      .filter((station) => !PRIMARY_STATION_TYPES.includes(station.type))
      .sort((a, b) => a.distance - b.distance),
  ]
);

const selectDataSets = createSelector(
  selectObservationDomain,
  (observation) => observation.data
);

const selectStationIdList = createSelector(
  selectObservationDomain,
  (observation) => observation.stationId
);

export const selectDataId = createSelector(
  selectObservationDomain,
  (observation) => observation.id
);

export const selectStationId = createSelector(
  [selectDataId, selectStationIdList],
  (id, stations) => (stations?.[id] ? stations[id] : 0)
);

export const selectData = createSelector(
  [selectDataSets, selectStationId],
  (data, id) => (data?.[id] ? data[id] : [])
);

export const selectDisplayFormat = createSelector(
  selectObservationDomain,
  (observation) => observation.displayFormat
);

export const selectChartDisplayParameter = createSelector(
  selectObservationDomain,
  (observation) => observation.chartDisplayParam
);
