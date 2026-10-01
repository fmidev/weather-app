import { ChartType, Parameter } from './types';

type TypeParameters = { [key in ChartType]: Parameter[] };

export const observationTypeParameters: TypeParameters = {
  pressure: ['pressure'],
  precipitation: ['precipitation1h'],
  temperature: ['temperature', 'dewPoint'],
  humidity: ['humidity'],
  wind: ['windSpeedMS', 'windGust', 'windDirection'],
  snowDepth: ['snowDepth', 'snowDepth06'],
  visCloud: ['visibility', 'totalCloudCover'],
  cloud: ['cloudHeight'],
  uv: [],
  weather: ['temperature', 'dewPoint', 'precipitation1h'],
  daily: ['rrday', 'maximumTemperature', 'minimumTemperature', 'minimumGroundTemperature06'],
};

export const forecastTypeParameters: TypeParameters = {
  pressure: ['pressure'],
  precipitation: ['precipitation1h', 'pop'],
  temperature: ['temperature', 'feelsLike', 'dewPoint'],
  humidity: ['relativeHumidity', 'humidity'],
  wind: ['windSpeedMS', 'hourlymaximumgust', 'windDirection'],
  snowDepth: [],
  visCloud: [],
  cloud: [],
  uv: ['uvCumulated'],
  weather: [],
  daily: [],
};
