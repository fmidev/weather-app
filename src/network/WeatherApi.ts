import { Platform } from 'react-native';
import { ForecastLocation, WeatherData } from '@store/forecast/types';
import {
  ObservationLocation,
  ObservationDataRaw,
} from '@store/observation/types';
import { Config } from '@config';
import i18n from '@i18n';
import axiosClient from '@utils/axiosClient';
import { TimeseriesLocation } from '@store/location/types';
import packageJSON from '../../package.json';
import { findNearestGeoMagneticObservationStation, GeoMagneticStation, isAuroraBorealisLikely } from '@utils/geoMagneticStations';

const isLocationValid = (
  location: ForecastLocation | ObservationLocation
): boolean =>
  (location.geoid && Number.isInteger(location.geoid)) ||
  location.latlon !== undefined;

export const getForecast = async (
  location: ForecastLocation,
  country: string,
  retry: string | false = false // producer name or false if not a retry
): Promise<{forecasts: WeatherData[], isAuroraBorealisLikely: boolean}> => {
  const { language } = i18n;
  const {
    apiUrl,
    forecast: { timePeriod, data: dataSettings },
    observation: { geoMagneticObservations }
  } = Config.get('weather');

  if (!isLocationValid(location)) {
    return {forecasts: [], isAuroraBorealisLikely: false};
  }

  const locationParam = location.geoid ? { geoid: location.geoid } : { latlon: location.latlon };

  const params = {
    ...locationParam,
    endtime: timePeriod,
    format: 'json',
    attributes: 'geoid',
    lang: language,
    tz: 'utc',
    who: `${packageJSON.name}-${Platform.OS}${retry ? '-retry' : ''}`,
  };

  const metaParams = [
    [
      'geoid',
      'epochtime',
      'localtime',
      'name',
      'sunrise',
      'sunset',
      'sunriseToday',
      'sunsetToday',
      'dayLength',
      'moonPhase',
      'modtime',
      'dark',
      // Remove producer if it causes problems with Smartmet Server
      'producer',
    ],
    ['geoid', 'epochtime'],
  ];

  const queries = dataSettings.flatMap(({ parameters, producer }, index) =>
    !retry || producer === retry ?
      axiosClient({
        url: apiUrl,
        params: {
          ...params,
          producer: producer || 'default',
          param: [...metaParams[index === 0 ? 0 : 1], ...parameters].join(','),
        },
      },
      undefined,
      'Timeseries')
    : []
  );

  // Aurora borealis information is required for the forecast
  // and therefore geomagnetic observations are fetched here

  let nearestGeoMagneticStation: GeoMagneticStation | undefined;

  const geoMagneticObservationsEnabled = geoMagneticObservations?.countryCodes.includes(country)
                                          && location.latlon !== undefined
                                          && geoMagneticObservations?.enabled === true
                                          && retry === false;

  if (geoMagneticObservationsEnabled && location.latlon) {
    const [lat, lon] = location.latlon.split(',');
    nearestGeoMagneticStation = findNearestGeoMagneticObservationStation(
      parseFloat(lat),
      parseFloat(lon)
    );
  }
  const geoMagneticParams = {
    starttime: '-1h',
    param: ['distance','epochtime','fmisid','name','geomagneticRIndex'].join(','),
    fmisid: nearestGeoMagneticStation?.fmisid,
    producer: geoMagneticObservations?.producer,
    who: packageJSON.name,
    format: 'json',
    lang: language,
    timestep: 'data',
    ignoreError400: true,
  };

  queries.push(
    geoMagneticObservationsEnabled
      ? axiosClient({ url: apiUrl, params: geoMagneticParams }, undefined, 'Timeseries')
      : Promise.resolve({ data: {} }),
  );

  const results = await Promise.allSettled(queries);

  const lastIndex = results.length - 1;
  let error: boolean | string = false;

  const forecastData = results.flatMap((result, index) => {
    if (index === lastIndex && geoMagneticObservationsEnabled) {
      return [];
    }
    if (result.status === 'fulfilled') {
      return result.value;
    }
    if (result.status === 'rejected') {
      const { reason } = result; // AxiosError
      error = "\n" + 'Message: ' + reason.message + "\n";
      error += 'Code: ' + reason.code + "\n";
      error += 'Url: ' + reason.config?.url +"\n";
      error += 'Status: ' + reason.response?.status + "\n";
      error += 'Data: ' + reason.response?.data.subString(0, 100) + "\n"
    }
    return [];
  });

  if (error) {
    throw new Error(error);
  }

  const geoMagneticResult = results[lastIndex];
  const geoMagneticObservationData = geoMagneticObservationsEnabled && geoMagneticResult.status === 'fulfilled' ? geoMagneticResult.value : null;

  const forecasts = forecastData.map(({ data }) => data);

  if (geoMagneticObservationsEnabled && nearestGeoMagneticStation
    && geoMagneticObservationData !== null && geoMagneticObservationData.data.length > 0) {
    const { data } = geoMagneticObservationData;
    return {
      forecasts,
      isAuroraBorealisLikely: isAuroraBorealisLikely(data[data.length - 1].geomagneticRIndex, nearestGeoMagneticStation),
    };
  }

  return { forecasts, isAuroraBorealisLikely: false };
};

export const getObservation = async (
  location: ObservationLocation,
  country: string
): Promise<Array<ObservationDataRaw | boolean>> => {
  const {
    apiUrl,
    observation: {
      enabled,
      numberOfStations,
      producer,
      dailyProducers,
      timePeriod,
      parameters,
      dailyParameters,
    },
  } = Config.get('weather');
  const { language } = i18n;

  if (!enabled || !isLocationValid(location)) {
    return [{}, {}];
  }

  let observationProducer = producer;
  if (typeof producer === 'object') {
    observationProducer = producer[country]
      ? producer[country]
      : producer.default;
  }

  const dailyObservationsEnabled = dailyProducers?.includes(
    observationProducer as string
  );

  const locationParam = location.geoid ? { geoid: location.geoid } : { latlon: location.latlon };

  const hourlyParams = {
    ...locationParam,
    numberofstations: numberOfStations,
    starttime: `-${timePeriod}h`,
    endtime: '0',
    param: [
      'distance',
      'epochtime',
      'fmisid', // geoid??
      'stationname',
      'stationtype',
      ...(parameters || []),
    ].join(','),
    format: 'json',
    producer: observationProducer,
    precision: 'double',
    lang: language,
    attributes: 'fmisid,stationname,stationtype,distance',
    who: `${packageJSON.name}-${Platform.OS}`,
  };

  const dailyParams = {
    ...hourlyParams,
    starttime: '-720h', // 30 days = 30 * 24h = 720h
    param: [
      'distance',
      'epochtime',
      'fmisid',
      'stationname',
      'stationtype',
      ...(dailyParameters || []),
    ].join(','),
  };

  const [observationData, dailyObservationData] = await Promise.all([
    axiosClient({ url: apiUrl, params: hourlyParams }, undefined, 'Timeseries'),
    dailyObservationsEnabled
      ? axiosClient({ url: apiUrl, params: dailyParams }, undefined, 'Timeseries')
      : Promise.resolve({ data: {} }),
  ]);

  if (observationData === null || dailyObservationData === null) {
    throw new Error('Observation data retrieval failed');
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
  const { apiUrl } = Config.get('weather');
  const { language } = i18n;

  const params = {
    ...locationQueryParams,
    latlon: `${latitude},${longitude}`,
    lang: language,
  };

  const { data } = await axiosClient({
    url: apiUrl,
    params,
  }, undefined, 'Timeseries');

  return data;
};

export const getLocationsLocales = async (
  geoids: number[]
): Promise<{ [geoid: string]: TimeseriesLocation[] }> => {
  const { apiUrl } = Config.get('weather');
  const { language } = i18n;

  const params = {
    ...locationQueryParams,
    geoid: geoids.join(','),
    lang: language,
  };

  const { data } = await axiosClient({ url: apiUrl, params }, undefined, 'Timeseries');

  return data;
};
