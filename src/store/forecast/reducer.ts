import { PersistConfig } from '@store/types';
import {
  FETCH_FORECAST,
  FETCH_FORECAST_SUCCESS,
  FETCH_FORECAST_ERROR,
  ForecastActionTypes,
  ForecastState,
  WeatherData,
  UPDATE_DISPLAY_PARAMS,
  RESTORE_DEFAULT_DISPLAY_PARAMS,
  UPDATE_FORECAST_DISPLAY_FORMAT,
  UPDATE_FORECAST_CHART_PARAMETER,
  DisplayParameters,
  TimeStepData,
  ForecastLocation,
  TimeStepDataSet,
} from './types';

import constants from './constants';

const INITIAL_STATE: ForecastState = {
  data: {},
  auroraBorealisData: {},
  loading: true,
  error: false,
  displayParams: [],
  displayFormat: 'table',
  chartDisplayParam: undefined,
  fetchTimestamp: Date.now(),
  fetchSuccessTime: 0,
};

const formatData = (dataSets: TimeStepDataSet, location: ForecastLocation): WeatherData => {
  const weatherData: WeatherData = {};
  const rawGeoid = location.geoid;
  const normalizedGeoid =
    typeof rawGeoid === 'number' && Number.isNaN(rawGeoid) ? 0 : rawGeoid ?? 0;
  const id = String(normalizedGeoid);
  const stepsByEpoch = new Map<number, TimeStepData>();

  dataSets.forEach((steps) => {
    steps.forEach((step) => {
      const existingStep = stepsByEpoch.get(step.epochtime);
      stepsByEpoch.set(
        step.epochtime,
        existingStep ? { ...existingStep, ...step } : { ...step }
      );
    });
  });

  if (stepsByEpoch.size > 0) {
    weatherData[id] = Array.from(stepsByEpoch.values());
  }

  return weatherData;
};

export default (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state = INITIAL_STATE,
  action: ForecastActionTypes
): ForecastState => {
  switch (action.type) {
    case FETCH_FORECAST: {
      return {
        ...state,
        loading: true,
        error: false,
      };
    }

    case FETCH_FORECAST_SUCCESS: {
      const geoid = action.data.location.geoid ?? 0;
      return {
        ...state,
        data: {
          ...state.data,
          ...formatData(action.data.forecast, action.data.location),
        },
        auroraBorealisData: {
          ...state.auroraBorealisData,
          [geoid]: action.data.isAuroraBorealisLikely
        },
        fetchTimestamp: action.timestamp,
        fetchSuccessTime: action.timestamp,
        loading: false,
        error: false,
      };
    }

    case FETCH_FORECAST_ERROR: {
      return {
        ...state,
        loading: false,
        error: action.error,
        fetchTimestamp: action.timestamp,
      };
    }

    case UPDATE_DISPLAY_PARAMS: {
      const [, param] = action.param;
      const defaultParameters =
        state.displayParams.length > 0
          ? state.displayParams
          : (action.defaultParameters.map((item) => [
              constants.indexOf(String(item)),
              item,
            ]) as [number, DisplayParameters][]);
      return {
        ...state,
        displayParams: defaultParameters.some((arr) => arr.includes(param))
          ? defaultParameters.filter((arr) => !arr.includes(param))
          : defaultParameters.concat([
              [constants.indexOf(String(param)), param],
            ]),
      };
    }

    case RESTORE_DEFAULT_DISPLAY_PARAMS: {
      return {
        ...state,
        displayParams: [],
      };
    }

    case UPDATE_FORECAST_DISPLAY_FORMAT: {
      return {
        ...state,
        displayFormat: action.value,
      };
    }

    case UPDATE_FORECAST_CHART_PARAMETER: {
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

export const forecastPersist: PersistConfig = {
  key: 'forecast',
  whitelist: ['displayParams', 'displayFormat', 'chartDisplayParam'],
};
