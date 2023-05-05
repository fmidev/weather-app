import Icon from '@components/common/Icon';
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

  const typeMap: { [key in WarningType]?: string } = {
    'Aerodrome Warning For Visibility': 'Aerodrome Warning For Visibility',
    'Aerodrome Warning For Wind': 'Aerodrome Warning For Wind',
    'Bush Fire Advisory': 'Bush Fire Advisory',
    'Bush Fire Warning': 'Bush Fire Warning',
    'Bush Fire Watch': 'Bush Fire Watch',
    'Drought Alert': 'Drought Alert',
    'Drought Warning': 'Drought Warning',
    'Falling Temperatures Advisory': 'Falling Temperatures Advisory',
    'Flash Flood Advisory': 'Flash Flood Advisory',
    'Flash Flood Warning': 'Flash Flood Warning',
    'Flash Flood Watch': 'Flash Flood Watch',
    'Flooding Advisory': 'Flooding Advisory',
    'Flooding Warning': 'Flooding Warning',
    'Flooding Watch': 'Flooding Watch',
    'Heat Advisory': 'Heat Advisory',
    'Heat Warning': 'Heat Warning',
    'Heat Watch': 'Heat Watch',
    'Heavy Rain at Sea Advisory': 'Heavy Rain at Sea Advisory',
    'Heavy Rain at Sea Warning': 'Heavy Rain at Sea Warning',
    'Heavy Rainfall Advisory': 'Heavy Rainfall Advisory',
    'Heavy Rainfall Watch': 'Heavy Rainfall Watch',
    'Heavy Rainfall Warning': 'Heavy Rainfall Warning',
    'High Humidity Advisory': 'High Humidity Advisory',
    'High Humidity Warning': 'High Humidity Warning',
    'High Surf Advisory': 'High Surf Advisory',
    'High Surf Warning': 'High Surf Warning',
    'Hurricane Advisory': 'Hurricane Advisory',
    'Hurricane Warning': 'Hurricane Warning',
    'Hurricane Watch': 'Hurricane Watch',
    'Landslide Advisory': 'Landslide Advisory',
    'Landslide Warning': 'Landslide Warning',
    'Landslide Watch': 'Landslide Watch',
    'Large Wave Warning for Small Craft': 'Large Wave Warning for Small Craft',
    'Poor Visibility': 'Poor Visibility',
    'Rainfall Outlook': 'Rainfall Outlook',
    'Severe Weather Alert': 'Severe Weather Alert',
    'Strong Wind Advisory': 'Strong Wind Advisory',
    'Strong Wind and Large Wave Warning': 'Strong Wind and Large Wave Warning',
    'Strong Wind and Large Waves Advisory':
      'Strong Wind and Large Waves Advisory',
    'Strong Wind Warning': 'Strong Wind Warning',
    'Strong Wind Watch': 'Strong Wind Watch',
    'Thunderstorm Advisory': 'Thunderstorm Advisory',
    'Thunderstorm Watch': 'Thunderstorm Watch',
    'Thunderstorm Warning': 'Thunderstorm Warning',
    'Thunderstorm at Sea Warning': 'Thunderstorm at Sea Warning',
    'Tropical Storm Advisory': 'Tropical Storm Advisory',
    'Tropical Storm Warning': 'Tropical Storm Warning',
    'Tropical Storm Watch': 'Tropical Storm Watch',
  };

  let name;
  const typeName = typeMap[type];
  if (typeName) {
    name = typeName;
  } else {
    name = `warnings-generic-${colorMap[severity]}`;
  }

  return <Icon name={name} width={size ?? 24} height={size ?? 24} />;
};

export default WarningSymbol;
