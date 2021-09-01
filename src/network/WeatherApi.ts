import axios from 'axios';
import Config from 'react-native-config';

import { Location, WeatherData } from '../store/forecast/types';
import { ObservationDataRaw } from '../store/observation/types';

export const getForecast = async (location: Location): Promise<WeatherData> => {
  const params = {
    ...location,
    starttime: 0,
    endtime: 'data',
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
      'sunrise',
      'sunset',
      'utctime',
      'localtime',
      'origintime',
      'modtime',
      'temperature',
      'smartSymbol',
      'pop',
      'windspeedms',
      'winddirection',
      'windcompass8',
      'precipitation1h',
      'feelsLike',
      'dark',
    ].join(','),
    format: 'json',
    attributes: 'geoid',
    lang: 'fi', // TODO: Fix
  };

  const { data } = await axios.get(Config.WEATHER_API_URL, {
    params,
  });
  return data;
};

export const getObservation = async (
  location: Location
): Promise<ObservationDataRaw> => {
  const params = {
    ...location,
    numberofstations: Config.NUMBEROFSTATIONS,
    starttime: '-24h',
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
      'snowdepth',
      'stationname',
      'temperature',
      'totalcloudcover',
      'visibility',
      'windcompass8',
      'windgust',
      'windspeedms',
      'ww_aws', // iso2 = 'fi'
    ].join(','),
    format: 'json',
    producer: Config.OBSERVATION_PRODUCER,
    precision: 'double',
    lang: 'fi', // TODO: Fix
    attributes: 'fmisid,stationname,distance',
  };

  const { data } = await axios.get(Config.WEATHER_API_URL, {
    params,
  });

  return data;
};
