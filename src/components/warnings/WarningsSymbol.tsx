import Icon from '@assets/Icon';
import { Severity, WarningType } from '@store/warnings/types';
import React from 'react';

type WarningSymbolProps = {
  type: WarningType;
  severity: Severity;
  size?: number;
};
const WarningSymbol: React.FC<WarningSymbolProps> = ({
  type,
  severity,
  size,
}) => {
  const colorMap: { [key in Severity]: string } = {
    Moderate: 'yellow',
    Severe: 'orange',
    Extreme: 'red',
  };

  const typeMap: { [key in WarningType]: string } = {
    thunderstorm: 'thunder-storm',
    wind: 'wind',
    rain: 'rain',
    trafficWeather: 'traffic-weather',
    pedestrianSafety: 'pedestrian-safety',
    forestFireWeather: 'forest-fire-weather',
    hotWeather: 'hot-weather',
    coldWeather: 'hot-weather',
    uvNote: 'uv-note',
    flooding: 'flooding',
    seaWind: 'sea-wind',
    seaThunderStorm: 'sea-thunder-storm',
    seaWaveHeight: 'sea-wave-height',
    seaWaterHeightHighWater: 'sea-water-height-high-water',
    seaWaterHeightShallowWater: 'sea-water-height-shallow-water',
    seaIcing: 'sea-icing',
  };

  let name = 'warnings';
  const typeName = typeMap[type];
  if (typeName) {
    name += `-${typeMap[type]}`;
    if (!['uvNote', 'pedestrianSafety'].includes(type)) {
      name += `-${colorMap[severity]}`;
    }
  }

  return <Icon name={name} width={size ?? 24} height={size ?? 24} />;
};

export default WarningSymbol;
