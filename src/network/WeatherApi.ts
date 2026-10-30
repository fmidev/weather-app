import { Platform } from 'react-native';
import { isAxiosError } from 'axios';
import Ajv from 'ajv/dist/2020';

import {
  ForecastLocation,
  TimeStepData,
  TimeStepDataSet,
  WeatherData,
} from '@store/forecast/types';
import {
  ObservationLocation,
  ObservationDataRaw,
} from '@store/observation/types';
import { Config } from '@config';
import i18n from '@i18n';
import axiosClient from '@utils/axiosClient';
import { trackMatomoEvent } from '@utils/matomo';
import { Location, TimeseriesLocation } from '@store/location/types';
import packageJSON from '../../package.json';
import forecastSchema from '../schemas/timeseries-forecast.schema.json';
import favoriteForecastSchema from '../schemas/timeseries-favorite-forecast.schema.json';
import uvSchema from '../schemas/timeseries-uv.schema.json';
import geoMagneticObservationsSchema from '../schemas/timeseries-geomagnetic-observations.schema.json';
import observationsSchema from '../schemas/timeseries-observations.schema.json';
import dailyObservationsSchema from '../schemas/timeseries-daily-observations.schema.json';
import reverseGeolocationSchema from '../schemas/timeseries-reverse-geolocation.schema.json';
import {
  findNearestGeoMagneticObservationStation,
  isAuroraBorealisLikely,
} from '@utils/geoMagneticStations';

const ajv = new Ajv();
const validateForecast = ajv.compile(forecastSchema);
const validateFavoriteForecasts = ajv.compile<WeatherData>(
  favoriteForecastSchema
);
const validateUVForecast = ajv.compile(uvSchema);
const validateGeoMagneticObservations = ajv.compile(
  geoMagneticObservationsSchema
);
const validateObservations = ajv.compile(observationsSchema);
const validateDailyObservations = ajv.compile(dailyObservationsSchema);
const validateReverseGeolocation = ajv.compile<{
  [geoid: string]: TimeseriesLocation[];
}>(reverseGeolocationSchema);

const isLocationValid = (
  location: ForecastLocation | ObservationLocation
): boolean => location.latlon !== undefined;

const FORECAST_META_PARAMS = [
  'epochtime',
  'localtime',
  'sunrise',
  'sunset',
  'sunriseToday',
  'sunsetToday',
  'dayLength',
  'moonPhase',
  'modtime',
  'dark',
];

export const getAuroraBorealisLikelihood = async (
  location: ForecastLocation,
  country: string
): Promise<boolean> => {
  const {
    apiUrl,
    fmiApiKey,
    observation: { geoMagneticObservations },
  } = Config.get('weather');
  if (
    !location.latlon ||
    geoMagneticObservations?.enabled !== true ||
    !geoMagneticObservations.countryCodes.includes(country)
  )
    return false;

  const [lat, lon] = location.latlon.split(',');
  const station = findNearestGeoMagneticObservationStation(
    parseFloat(lat),
    parseFloat(lon)
  );
  try {
    const { data } = await axiosClient(
      {
        url: apiUrl,
        ...(fmiApiKey !== undefined
          ? { headers: { 'fmi-apikey': fmiApiKey } }
          : {}),
        params: {
          starttime: '-1h',
          param: 'distance,epochtime,fmisid,name,geomagneticRIndex',
          fmisid: station?.fmisid,
          producer: geoMagneticObservations.producer,
          who: packageJSON.name,
          format: 'json',
          lang: i18n.language,
          timestep: 'data',
          ignoreError400: true,
        },
      },
      undefined,
      'Timeseries'
    );
    if (
      !station ||
      (geoMagneticObservations.schemaValidation !== false &&
        !validateGeoMagneticObservations(data)) ||
      !Array.isArray(data) ||
      data.length === 0
    )
      return false;

    return isAuroraBorealisLikely(
      data[data.length - 1].geomagneticRIndex,
      station
    );
  } catch {
    // Geomagnetic observations must not prevent loading an otherwise valid forecast.
    return false;
  }
};

export const getForecast = async (
  location: ForecastLocation,
  country: string
): Promise<{
  forecast: TimeStepDataSet;
  location: ForecastLocation;
  isAuroraBorealisLikely: boolean;
}> => {
  const { language } = i18n;
  const {
    apiUrl,
    fmiApiKey,
    forecast: { timePeriod, data: dataSettings, schemaValidation },
  } = Config.get('weather');

  if (!isLocationValid(location)) {
    return { forecast: [], location, isAuroraBorealisLikely: false };
  }

  const params = {
    latlon: location.latlon,
    endtime: timePeriod,
    format: 'json',
    lang: language,
    tz: 'utc',
    who: `${packageJSON.name}-${Platform.OS}`,
  };
  const apiKeyConfig =
    fmiApiKey !== undefined ? { headers: { 'fmi-apikey': fmiApiKey } } : {};

  const metaParams = [FORECAST_META_PARAMS, ['epochtime']];

  const queries = dataSettings.map(({ parameters, producer }, index) =>
    axiosClient(
      {
        url: apiUrl,
        ...apiKeyConfig,
        params: {
          ...params,
          producer: producer || 'default',
          param: [...metaParams[index === 0 ? 0 : 1], ...parameters].join(','),
        },
      },
      undefined,
      'Timeseries'
    )
  );

  const [results, auroraLikely] = await Promise.all([
    Promise.allSettled(queries),
    getAuroraBorealisLikelihood(location, country),
  ]);
  let error = '';

  const forecastData = results.flatMap((result, index) => {
    if (result.status === 'fulfilled') {
      const producer = dataSettings[index].producer || 'default';
      if (
        schemaValidation !== false &&
        producer === 'default' &&
        !validateForecast(result.value.data)
      ) {
        error += `Forecast validation failed: ${ajv.errorsText(
          validateForecast.errors
        )}\n`;
        return [];
      }
      if (
        schemaValidation !== false &&
        producer === 'uv' &&
        !validateUVForecast(result.value.data)
      ) {
        error += `UV forecast validation failed: ${ajv.errorsText(
          validateUVForecast.errors
        )}\n`;
        return [];
      }
      return result.value;
    }
    if (result.status === 'rejected') {
      const { reason } = result;
      if (isAxiosError(reason)) {
        error += 'Message: ' + reason.message + '\n';
        error += 'Code: ' + reason.code + '\n';
        error += 'Url: ' + reason.config?.url + '\n';
        error += 'Status: ' + reason.response?.status + '\n';
        error +=
          'Data: ' +
          String(reason.response?.data ?? '').substring(0, 100) +
          '\n';
      } else {
        error += 'Message: ' + String(reason) + '\n';
      }
    }
    return [];
  });

  if (error) {
    trackMatomoEvent('Error', 'Timeseries', error);
    throw new Error(error);
  }

  const forecast = forecastData.map(({ data }) => data);
  return { forecast, location, isAuroraBorealisLikely: auroraLikely };
};

export const getAllForecasts = async (
  locations: Location[]
): Promise<WeatherData> => {
  const validLocations = locations.filter(
    ({ lat, lon }) => Number.isFinite(lat) && Number.isFinite(lon)
  );
  if (validLocations.length === 0) return {};

  const {
    apiUrl,
    fmiApiKey,
    forecast: { timePeriod, data: dataSettings, schemaValidation },
  } = Config.get('weather');
  const coordinates = Array.from(
    new Set(validLocations.map(({ lat, lon }) => `${lat},${lon}`))
  ).sort();
  const producers = new Map<string, Set<string>>();
  dataSettings.forEach(({ producer, parameters }) => {
    const name = producer || 'default';
    const existing = producers.get(name) ?? new Set<string>();
    parameters.forEach((parameter) => existing.add(parameter));
    producers.set(name, existing);
  });

  const results = await Promise.all(
    Array.from(producers, async ([producer, parameters], index) => {
      const { data } = await axiosClient(
        {
          url: apiUrl,
          ...(fmiApiKey !== undefined
            ? { headers: { 'fmi-apikey': fmiApiKey } }
            : {}),
          params: {
            latlons: coordinates.join(','),
            param: Array.from(
              new Set([
                'latlon',
                ...(index === 0 ? FORECAST_META_PARAMS : ['epochtime']),
                ...parameters,
              ])
            ).join(','),
            attributes: 'latlon',
            producer,
            endtime: timePeriod,
            format: 'json',
            lang: i18n.language,
            tz: 'utc',
            who: `${packageJSON.name}-${Platform.OS}`,
          },
        },
        undefined,
        'Timeseries'
      );

      if (schemaValidation !== false) {
        let valid = validateFavoriteForecasts(data);
        let errors = validateFavoriteForecasts.errors;
        const validateProducer =
          producer === 'default'
            ? validateForecast
            : producer === 'uv'
              ? validateUVForecast
              : undefined;
        if (valid && validateProducer) {
          valid = Object.values(data as WeatherData).every((steps) =>
            validateProducer(steps)
          );
          errors = validateProducer.errors;
        }
        if (!valid) {
          const error = `Favorite forecast validation failed: ${ajv.errorsText(errors)}\n`;
          trackMatomoEvent('Error', 'Timeseries', error);
          throw new Error(error);
        }
      }
      return data as WeatherData;
    })
  );

  const forecastsByCoordinates = new Map<string, Map<number, TimeStepData>>();
  results.forEach((data) => {
    Object.entries(data).forEach(([coordinate, steps]) => {
      // SmartMet formats coordinate keys with spaces and five decimal places.
      const key = coordinate.split(',').map(Number).join(',');
      const merged =
        forecastsByCoordinates.get(key) ?? new Map<number, TimeStepData>();
      steps.forEach((step) => {
        merged.set(step.epochtime, { ...merged.get(step.epochtime), ...step });
      });
      forecastsByCoordinates.set(key, merged);
    });
  });
  return Object.fromEntries(
    validLocations.map(({ id, lat, lon }) => [
      typeof id === 'number' && Number.isNaN(id) ? 0 : id,
      Array.from(
        forecastsByCoordinates
          .get(`${Number(lat.toFixed(5))},${Number(lon.toFixed(5))}`)
          ?.values() ?? []
      ).sort((a, b) => a.epochtime - b.epochtime),
    ])
  );
};

export const getObservation = async (
  location: ObservationLocation,
  country: string
): Promise<Array<ObservationDataRaw | boolean>> => {
  const {
    apiUrl,
    fmiApiKey,
    observation: {
      enabled,
      numberOfStations,
      producer,
      dailyProducers,
      timePeriod,
      parameters,
      dailyParameters,
      schemaValidation,
      identifier = 'fmisid',
    },
  } = Config.get('weather');
  const { language } = i18n;

  if (!enabled || !isLocationValid(location)) {
    return [{}, {}];
  }

  const apiKeyConfig =
    fmiApiKey !== undefined ? { headers: { 'fmi-apikey': fmiApiKey } } : {};

  let observationProducer = producer;
  if (typeof producer === 'object') {
    observationProducer = producer[country]
      ? producer[country]
      : producer.default;
  }

  const dailyObservationsEnabled = dailyProducers?.includes(
    observationProducer as string
  );

  const hourlyParams = {
    latlon: location.latlon,
    numberofstations: numberOfStations,
    starttime: `-${timePeriod}h`,
    endtime: '0',
    param: [
      identifier,
      'distance',
      'epochtime',
      'stationname',
      'stationtype',
      ...(parameters || []),
    ].join(','),
    format: 'json',
    producer: observationProducer,
    precision: 'double',
    lang: language,
    attributes: `${identifier},stationname,stationtype,distance`,
    who: `${packageJSON.name}-${Platform.OS}`,
  };

  const dailyParams = {
    ...hourlyParams,
    starttime: '-720h', // 30 days = 30 * 24h = 720h
    param: [
      identifier,
      'distance',
      'epochtime',
      'stationname',
      'stationtype',
      ...(dailyParameters || []),
    ].join(','),
  };

  const [observationData, dailyObservationData] = await Promise.all([
    axiosClient(
      { url: apiUrl, ...apiKeyConfig, params: hourlyParams },
      undefined,
      'Timeseries'
    ),
    dailyObservationsEnabled
      ? axiosClient(
          { url: apiUrl, ...apiKeyConfig, params: dailyParams },
          undefined,
          'Timeseries'
        )
      : Promise.resolve({ data: {} }),
  ]);

  if (observationData === null || dailyObservationData === null) {
    trackMatomoEvent(
      'Error',
      'Timeseries',
      'Observation data retrieval failed'
    );
    throw new Error('Observation data retrieval failed');
  }

  let error = '';
  if (
    schemaValidation !== false &&
    !validateObservations(observationData.data)
  ) {
    error += `Observation validation failed: ${ajv.errorsText(
      validateObservations.errors
    )}\n`;
  }
  if (
    schemaValidation !== false &&
    dailyObservationsEnabled &&
    !validateDailyObservations(dailyObservationData.data)
  ) {
    error += `Daily observation validation failed: ${ajv.errorsText(
      validateDailyObservations.errors
    )}\n`;
  }
  if (error) {
    trackMatomoEvent('Error', 'Timeseries', error);
    throw new Error(error);
  }

  return [observationData.data, dailyObservationData.data];
};

const locationQueryParams = {
  param: [
    'geoid',
    'name',
    'latitude',
    'longitude',
    'region',
    'country',
    'iso2',
    'localtz',
  ].join(','),
  timesteps: 1,
  attributes: 'geoid',
  format: 'json',
  who: `${packageJSON.name}-${Platform.OS}`,
};

export const getCurrentPosition = async (
  latitude: number,
  longitude: number
): Promise<{ [geoid: string]: TimeseriesLocation[] }> => {
  const { apiUrl, fmiApiKey } = Config.get('weather');
  const { useInKeyword, keyword, maxDistance, schemaValidation } =
    Config.get('location');
  const { language } = i18n;

  const params = {
    ...locationQueryParams,
    latlon: `${latitude},${longitude}`,
    lang: language,
    ...(useInKeyword ? { inkeyword: keyword } : {}),
    ...(maxDistance !== undefined ? { maxdistance: maxDistance } : {}),
  };

  const { data } = await axiosClient(
    {
      url: apiUrl,
      params,
      ...(fmiApiKey !== undefined
        ? { headers: { 'fmi-apikey': fmiApiKey } }
        : {}),
    },
    undefined,
    'Timeseries'
  );

  if (schemaValidation !== false && !validateReverseGeolocation(data)) {
    const error = `Reverse geolocation validation failed: ${ajv.errorsText(
      validateReverseGeolocation.errors
    )}\n`;
    trackMatomoEvent('Error', 'Timeseries', error);
    throw new Error(error);
  }

  return data;
};

export const getLocationsLocales = async (
  geoids: number[]
): Promise<{ [geoid: string]: TimeseriesLocation[] }> => {
  const { apiUrl, fmiApiKey } = Config.get('weather');
  const { language } = i18n;

  const params = {
    ...locationQueryParams,
    geoid: geoids.join(','),
    lang: language,
  };

  const { data } = await axiosClient(
    {
      url: apiUrl,
      params,
      ...(fmiApiKey !== undefined
        ? { headers: { 'fmi-apikey': fmiApiKey } }
        : {}),
    },
    undefined,
    'Timeseries'
  );

  return data;
};
