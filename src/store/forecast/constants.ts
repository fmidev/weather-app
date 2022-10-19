export const SMART_SYMBOL = 'smartSymbol';
export const TEMPERATURE = 'temperature';
export const FEELS_LIKE = 'feelsLike';
export const WIND_SPEED_AND_DIRECTION = 'windSpeedMSwindDirection';
export const WIND_GUST = 'hourlymaximumgust';
export const PRECIPITATION_1H = 'precipitation1h';
export const SNOW_FALL = 'snowfall'; // TODO: check
export const PRECIPITATION_PROBABILITY = 'pop';
export const THUNDER_PROBABILITY = 'probabilityThunderstorm';
export const DEW_POINT = 'dewPoint';
export const RELATIVE_HUMIDITY = 'relativeHumidity';
export const PRESSURE = 'pressure';
export const UV_CUMULATED = 'uvCumulated';
export const DAY_LENGTH = 'dayLength';

export const PARAMS_TO_ICONS = {
  smartSymbol: 'weather-symbol',
  temperature: 'temperature',
  feelsLike: 'feels-like',
  windSpeedMSwindDirection: 'wind',
  hourlymaximumgust: 'gust',
  precipitation1h: 'precipitation',
  pop: 'precipitation',
  dewPoint: 'dew-point',
  dayLength: 'time',
} as { [key: string]: string };

export default [
  SMART_SYMBOL,
  TEMPERATURE,
  FEELS_LIKE,
  WIND_SPEED_AND_DIRECTION,
  WIND_GUST,
  PRECIPITATION_1H,
  PRECIPITATION_PROBABILITY,
  DEW_POINT,
  RELATIVE_HUMIDITY,
  PRESSURE,
  UV_CUMULATED,
  DAY_LENGTH,
  SNOW_FALL,
  THUNDER_PROBABILITY,
];
