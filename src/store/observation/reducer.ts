import { PersistConfig } from '@store/types';
import {
  ObservationState,
  ObservationActionTypes,
  FETCH_OBSERVATION,
  FETCH_OBSERVATION_ERROR,
  FETCH_OBSERVATION_SUCCESS,
  SET_STATION_ID,
  ObservationDataRaw,
  ObservationData,
  StationInfo,
  UPDATE_OBSERVATION_DISPLAY_FORMAT,
  UPDATE_OBSERVATION_CHART_PARAMETER,
} from './types';

const INITIAL_STATE: ObservationState = {
  data: {},
  dailyData: {},
  error: false,
  id: 0,
  loading: false,
  stations: [],
  stationId: {},
  displayFormat: 'chart',
  chartDisplayParam: undefined,
};

const formatData = (
  rawData: ObservationDataRaw
): { stations: StationInfo[]; data: ObservationData } => {
  const stations: StationInfo[] = [];
  const data: ObservationData = {};

  Object.entries(rawData).forEach(([id, nameHolder]) => {
    Object.entries(nameHolder).forEach(([name, distanceHolder]) => {
      Object.entries(distanceHolder).forEach(
        ([stationType, stationTypeHolder]) => {
          Object.entries(stationTypeHolder).forEach(
            ([distance, dataHolder]) => {
              stations.push({
                id: Number(id),
                name,
                distance: Number(distance),
                type: stationType,
              });
              data[Number(id)] = [...dataHolder].reverse();
            }
          );
        }
      );
    });
  });

  return { data, stations };
};

export default (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state = INITIAL_STATE,
  action: ObservationActionTypes
): ObservationState => {
  switch (action.type) {
    case FETCH_OBSERVATION: {
      return {
        ...state,
        loading: true,
        error: false,
      };
    }

    case FETCH_OBSERVATION_SUCCESS: {
      const { data, stations } = formatData(action.payload.data[0]);
      const { data: dailyData } = formatData(action.payload.data[1]);
      const newState = {
        ...state,
        data,
        dailyData,
        stations,
        id:
          action.payload.location.geoid || action.payload.location.latlon || 0,
        loading: false,
        error: false,
      };
      return newState;
    }

    case FETCH_OBSERVATION_ERROR: {
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    }

    case SET_STATION_ID: {
      return {
        ...state,
        stationId: { ...state.stationId, [action.key]: action.id },
      };
    }

    case UPDATE_OBSERVATION_DISPLAY_FORMAT: {
      return {
        ...state,
        displayFormat: action.value,
      };
    }

    case UPDATE_OBSERVATION_CHART_PARAMETER: {
      return {
        ...state,
        chartDisplayParam: action.value,
      };
    }

    default: {
      return state;
    }
  }
};

export const observationPersist: PersistConfig = {
  key: 'observation',
  whitelist: ['stationId', 'displayFormat', 'chartDisplayParam'],
};
