import axios from 'axios';
import Config from 'react-native-config';

import { Location, WeatherData } from '../store/forecast/types';

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
  };

  const { data } = await axios.get(Config.WEATHER_API_URL, {
    params,
  });
  return data;
};

export const fetchObservations = async (geoid: Number) => {
  const params = {
    param: 'Temperature',
    geoid,
  };
  const { data } = await axios.get(Config.WEEATHER_API_URL, {
    params,
  });
  return data;
};
