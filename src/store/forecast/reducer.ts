import { PersistConfig } from '@store/types';
import {
  FETCH_FORECAST,
  FETCH_FORECAST_SUCCESS,
  FETCH_FORECAST_ERROR,
  FETCH_FAVORITE_FORECASTS_SUCCESS,
  RETAIN_FORECAST_LOCATIONS,
  ForecastActionTypes,
  ForecastState,
  WeatherData,
  UPDATE_DISPLAY_PARAMS,
  RESTORE_DEFAULT_DISPLAY_PARAMS,
  UPDATE_FORECAST_DISPLAY_FORMAT,
  UPDATE_FORECAST_CHART_PARAMETER,
  UPDATE_SHOW_SINGLE_HOURLY_FORECAST,
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
  showSingleHourlyForecast: false,
  chartDisplayParam: undefined,
  fetchTimestamp: Date.now(),
  fetchSuccessTime: 0,
};

const normalizeGeoid = (geoid?: number | string) =>
  typeof geoid === 'number' && Number.isNaN(geoid) ? 0 : (geoid ?? 0);

const retainLocations = <T>(
  data: Record<string, T> | undefined,
  locationIds: Set<string>
): Record<string, T> | undefined => {
  if (!data || Object.keys(data).every((id) => locationIds.has(id))) {
    return data;
  }

  return Object.fromEntries(
    Object.entries(data).filter(([id]) => locationIds.has(id))
  );
};

const formatData = (
  dataSets: TimeStepDataSet,
  location: ForecastLocation
): WeatherData => {
  const weatherData: WeatherData = {};
  const id = String(normalizeGeoid(location.geoid));
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
      if (action.background) return state;

      return {
        ...state,
        loading: !action.hasCachedData,
        error: false,
      };
    }

    case FETCH_FORECAST_SUCCESS: {
      const geoid = normalizeGeoid(action.data.location.geoid);
      return {
        ...state,
        data: {
          ...state.data,
          ...formatData(action.data.forecast, action.data.location),
        },
        auroraBorealisData: {
          ...state.auroraBorealisData,
          [geoid]: action.data.isAuroraBorealisLikely,
        },
        ...(action.background
          ? {}
          : {
              fetchTimestamp: action.timestamp,
              fetchSuccessTime: action.timestamp,
              loading: false,
              error: false,
            }),
      };
    }

    case FETCH_FAVORITE_FORECASTS_SUCCESS: {
      return {
        ...state,
        data: { ...state.data, ...action.data },
      };
    }

    case RETAIN_FORECAST_LOCATIONS: {
      const locationIds = new Set(
        action.locationIds.map((id) => String(normalizeGeoid(id)))
      );
      const data = retainLocations(state.data, locationIds);
      const auroraBorealisData = retainLocations(
        state.auroraBorealisData,
        locationIds
      );

      return data === state.data && auroraBorealisData === state.auroraBorealisData
        ? state
        : { ...state, data, auroraBorealisData };
    }

    case FETCH_FORECAST_ERROR: {
      if (action.background) return state;

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

    case UPDATE_SHOW_SINGLE_HOURLY_FORECAST: {
      return {
        ...state,
        showSingleHourlyForecast: action.value,
      };
    }

    default: {
      return state;
    }
  }
};

export const forecastPersist: PersistConfig = {
  key: 'forecast',
  whitelist: [
    'data',
    'auroraBorealisData',
    'displayParams',
    'displayFormat',
    'chartDisplayParam',
    'showSingleHourlyForecast',
    'fetchTimestamp',
    'fetchSuccessTime',
  ],
};
