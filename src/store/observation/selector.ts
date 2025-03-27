import { Selector, createSelector } from 'reselect';
import { State } from '../types';
import { ObservationState, TimeStepData } from './types';

const PRIMARY_STATION_TYPES = ['AWS', 'AVI'];
export const RELATED_DAILY_OBSERVATION_PARAMETERS = {
  snowDepth: 'snowDepth06',
};

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

const selectHourlyDataSets = createSelector(
  selectObservationDomain,
  (observation) => observation.data
);

const selectDailyDataSets = createSelector(
  selectObservationDomain,
  (observation) => observation.dailyData
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
  [selectHourlyDataSets, selectStationId],
  (data, id) => (data?.[id] ? data[id] : [])
);

export const selectDailyData = createSelector(
  [selectDailyDataSets, selectStationId],
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

export const selectDailyObservationParametersWithData = createSelector(
  [selectDailyDataSets, selectStationId],
  (data, id) => {
    const dailyParameters = [
      'rrday',
      'maximumTemperature',
      'minimumTemperature',
      'minimumGroundTemperature06',
    ];

    const dailyData = data?.[id] ? data[id] : [];
    return dailyParameters.filter((param) =>
      dailyData.find((item) => item[param as keyof TimeStepData] !== null)
    );
  }
);

export const selectPreferredDailyParameters = createSelector(
  [selectDailyDataSets, selectStationId],
  (data, id) => {
    const dailyData = data?.[id] ? data[id] : [];
    const result = [];

    for (const [parameter, dailyParameter] of Object.entries(
      RELATED_DAILY_OBSERVATION_PARAMETERS
    )) {
      const dailyParameterCount = dailyData.filter(
        (item) => item[dailyParameter as keyof TimeStepData] !== null
      ).length;

      if (dailyParameterCount > 10) {
        result.push(parameter);
      }
    }

    return result;
  }
);

export const selectIsAuroraBorealisLikely = createSelector(
  selectObservationDomain,
  (observation) => observation.isAuroraBorealisLikely === true
);
