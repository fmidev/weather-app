// The order defines priority, the thunderstorm most important - seaicing least important
export const knownWarningTypes = [
  'thunderstorm',
  'forestFireWeather',
  'grassFireWeather',
  'wind',
  'trafficWeather',
  'rain',
  'pedestrianSafety',
  'hotWeather',
  'coldWeather',
  'uvNote',
  'flooding',
  'seaWind',
  'seaThunderStorm',
  'seaWaveHeight',
  'seaWaterHeightHighWater',
  'seaWaterHeightShallowWater',
  'seaIcing'
] as const;

export const severityList = ['', 'Moderate', 'Severe', 'Extreme'] as const;
