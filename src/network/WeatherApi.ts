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
  location: ForecastLocation
): Promise<WeatherData[]> => {
  const { language } = i18n;
  const {
    apiUrl,
    forecast: { timePeriod, data: dataSettings },
  } = Config.get('weather');

  if (!isLocationValid(location)) {
    return [];
  }

  const params = {
    ...location,
    endtime: timePeriod,
    format: 'json',
    attributes: 'geoid',
    lang: language,
    tz: 'utc',
    who: `${packageJSON.name}-${Platform.OS}`,
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
    ],
    ['geoid', 'epochtime'],
  ];

  const queries = dataSettings.map(({ parameters, producer }, index) =>
    axiosClient({
      url: apiUrl,
      params: {
        ...params,
        producer: producer || 'default',
        param: [...metaParams[index === 0 ? 0 : 1], ...parameters].join(','),
      },
    })
  );

  const promises = await Promise.all(queries);
  return promises.map(({ data }) => data);
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
      geoMagneticObservations,
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

  const geoMagneticObservationsEnabled = geoMagneticObservations?.countryCodes.includes(country)
                                          && location.latlon !== undefined
                                          && geoMagneticObservations?.enabled === true;

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

  let nearestGeoMagneticStation: GeoMagneticStation | undefined;

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
    who: `${packageJSON.name}-${Platform.OS}`,
    format: 'json',
    lang: language,
    timestep: 'data',
  };

  const results = await Promise.allSettled([
    axiosClient({ url: apiUrl, params: hourlyParams }),
    dailyObservationsEnabled
      ? axiosClient({ url: apiUrl, params: dailyParams })
      : Promise.resolve({ data: {} }),
    geoMagneticObservationsEnabled
      ? axiosClient({ url: apiUrl, params: geoMagneticParams })
      : Promise.resolve({ data: {} }),
  ]);

  const observationData = results[0].status === 'fulfilled' ? results[0].value : null;
  const dailyObservationData = results[1].status === 'fulfilled' ? results[1].value : null;
  const geoMagneticObservationData = results[2].status === 'fulfilled' ? results[2].value : null;

  // geomagnetic observations can fail silently
  if (observationData === null || dailyObservationData === null) {
    throw new Error('Observation data retrieval failed');
  }

  if (geoMagneticObservationsEnabled && nearestGeoMagneticStation
    && geoMagneticObservationData !== null && geoMagneticObservationData.data.length > 0) {
    const { data } = geoMagneticObservationData;
    return [
      observationData.data,
      dailyObservationData.data,
      isAuroraBorealisLikely(data[data.length - 1].geomagneticRIndex, nearestGeoMagneticStation),
    ];
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
  });

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

  const { data } = await axiosClient({ url: apiUrl, params });

  return data;
};
