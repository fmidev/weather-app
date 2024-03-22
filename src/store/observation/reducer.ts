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
              data[Number(id)] = dataHolder.reverse();
            }
          );
        }
      );
    });
  });

  return { data, stations };
};

const areEpochTimesInTheSameDay = (
  epochtime1: number | undefined,
  epochtime2: number | undefined
) => {
  if (!epochtime1 || !epochtime2) return false;

  const date1 = new Date(epochtime1 * 1000);
  const date2 = new Date(epochtime2 * 1000);

  return date1.getDay() === date2.getDay();
};

// Places all daily values at a single point in time
// (some daily values are reported for different times within a single day)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const consolidateDailyValues = (data: ObservationData): ObservationData => {
  const consolidatedData: ObservationData = {};

  Object.keys(data)
    .map(Number)
    .forEach((stationId: number) => {
      const dayData: TimeStepData[] = [];
      data[stationId].forEach((day: TimeStepData) => {
        const currentDay = day.epochtime;
        const previousDay =
          dayData.length === 0
            ? undefined
            : dayData[dayData.length - 1].epochtime;
        if (areEpochTimesInTheSameDay(currentDay, previousDay)) {
          Object.keys(day).forEach((dailyParameter: string) => {
            if (
              !dayData[dayData.length - 1][
                dailyParameter as keyof DailyObservationParameters
              ]
            ) {
              dayData[dayData.length - 1][
                dailyParameter as keyof DailyObservationParameters
              ] = day[dailyParameter as keyof DailyObservationParameters];
            }
          });
        } else {
          dayData.push(day);
        }
      });
      consolidatedData[stationId] = dayData;
    });
  return consolidatedData as ObservationData;
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
      const { data: hourlyData, stations } = formatData(action.payload.data[0]);
      const { data: dailyData } = formatData(action.payload.data[1]);
      const newState = {
        ...state,
        data: hourlyData,
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
