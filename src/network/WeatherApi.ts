import { ForecastLocation, WeatherData } from '@store/forecast/types';
import {
  ObservationLocation,
  ObservationDataRaw,
} from '@store/observation/types';
import { Config } from '@config';
import i18n from '@i18n';
import axiosClient from '@utils/axiosClient';
import { TimeseriesLocation } from '@store/location/types';

export const getForecast = async (
  location: ForecastLocation
): Promise<WeatherData[]> => {
  const { language } = i18n;
  const {
    apiUrl,
    forecast: { timePeriod, data: dataSettings },
  } = Config.get('weather');

  const params = {
    ...location,
    starttime: Math.floor(Date.now() / 60 / 1000) * 60,
    endtime: timePeriod,
    format: 'json',
    attributes: 'geoid',
    lang: language,
  };

  const metaParams = [
    [
      'geoid',
      'epochtime',
      'name',
      'sunrise',
      'sunset',
      'sunriseToday',
      'sunsetToday',
      'dayLength',
      'utctime',
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
): Promise<ObservationDataRaw> => {
  const {
    apiUrl,
    observation: {
      enabled,
      numberOfStations,
      producer,
      timePeriod,
      parameters,
    },
  } = Config.get('weather');
  const { language } = i18n;

  if (!enabled) {
    return {};
  }

  let observationProducer = producer;
  if (typeof producer === 'object') {
    observationProducer = producer[country]
      ? producer[country]
      : producer.default;
  }

  const params = {
    ...location,
    numberofstations: numberOfStations,
    starttime: `-${timePeriod}h`,
    endtime: '0',
    param: [
      'distance',
      'epochtime',
      'fmisid', // geoid??
      'stationname',
      ...(parameters || []),
    ].join(','),
    format: 'json',
    producer: observationProducer,
    precision: 'double',
    lang: language,
    attributes: 'fmisid,stationname,distance',
  };

  const { data } = await axiosClient({ url: apiUrl, params });

  return data;
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

  const { data } = await axiosClient({ url: apiUrl, params });

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
