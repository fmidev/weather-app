import { ForecastLocation, WeatherData } from '@store/forecast/types';
import {
  ObservationLocation,
  ObservationDataRaw,
} from '@store/observation/types';
import { Config } from '@config';
import i18n from '@i18n';
import axiosClient from '@utils/axiosClient';

export const getForecast = async (
  location: ForecastLocation
): Promise<WeatherData> => {
  const { language } = i18n;
  const {
    apiUrl,
    forecast: { timePeriod, producer },
  } = Config.get('weather');

  const params = {
    ...location,
    starttime: 0,
    endtime: timePeriod,
    param: [
      'geoid',
      'epochtime',
      'name',
      'latitude',
      'longitude',
      'region',
      'country',
      'iso2',
      'localtz',
      'sunrise',
      'sunset',
      'sunrisetoday',
      'sunsettoday',
      'daylength',
      'utctime',
      'localtime',
      'origintime',
      'modtime',
      'temperature',
      'smartSymbol',
      'pop',
      'windspeedms',
      'winddirection',
      'hourlymaximumgust',
      'windcompass8',
      'precipitation1h',
      'feelsLike',
      'dark',
      'dewpoint',
      'relativeHumidity',
      'pressure',
    ].join(','),
    format: 'json',
    producer,
    attributes: 'geoid',
    lang: language,
  };

  const { data } = await axiosClient({ url: apiUrl, params });

  return data;
};

export const getObservation = async (
  location: ObservationLocation,
  country: string
): Promise<ObservationDataRaw> => {
  const {
    apiUrl,
    observation: { enabled, numberOfStations, producer, timePeriod },
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
      'cloudheight',
      'dewpoint',
      'distance',
      'epochtime',
      'fmisid', // geoid??
      'humidity',
      'precipitation1h',
      'pressure',
      'ri_10min', // iso2 = 'fi'
      'snowDepth',
      'stationname',
      'temperature',
      'totalcloudcover',
      'visibility',
      'windcompass8',
      'winddirection',
      'windgust',
      'windspeedms',
      'ww_aws', // iso2 = 'fi'
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

export const getCurrentPosition = async (
  latitude: number,
  longitude: number
): Promise<Object> => {
  const { apiUrl } = Config.get('weather');
  const { language } = i18n;

  const params = {
    latlon: `${latitude},${longitude}`,
    param: [
      'geoid',
      'name',
      'latitude',
      'longitude',
      'region',
      'iso2',
      'localtz',
    ].join(','),
    timesteps: 2,
    format: 'json',
    lang: language,
    attributes: 'geoid',
  };

  const { data } = await axiosClient({ url: apiUrl, params });

  return data;
};
