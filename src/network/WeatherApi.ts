import axios from 'axios';

import { Location, WeatherData } from '@store/forecast/types';
import { ObservationDataRaw } from '@store/observation/types';
import { Config } from '@config';

export const getForecast = async (location: Location): Promise<WeatherData> => {
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
      'hourlymaximumgust',
      'windcompass8',
      'precipitation1h',
      'feelsLike',
      'dark',
    ].join(','),
    format: 'json',
    producer,
    attributes: 'geoid',
    lang: 'fi', // TODO: Fix
  };

  const { data } = await axios.get(apiUrl, {
    params,
  });
  return data;
};

export const getObservation = async (
  location: Location
): Promise<ObservationDataRaw> => {
  const {
    apiUrl,
    observation: { enabled, numberOfStations, producer },
  } = Config.get('weather');

  if (!enabled) {
    return {};
  }

  const params = {
    ...location,
    numberofstations: numberOfStations,
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
    producer,
    precision: 'double',
    lang: 'fi', // TODO: Fix
    attributes: 'fmisid,stationname,distance',
  };

  const { data } = await axios.get(apiUrl, {
    params,
  });

  return data;
};
