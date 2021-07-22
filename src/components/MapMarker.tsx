import React from 'react';
import { Marker } from 'react-native-maps';
import { useTheme } from '@react-navigation/native';

import Icon from './Icon';

type MarkerProps = {
  coordinates: {
    latitude: number;
    longitude: number;
  };
};

const MapMarker: React.FC<MarkerProps> = ({ coordinates }) => {
  const { colors } = useTheme();
  return (
    <Marker
      anchor={{ x: 0.56, y: 0.95 }}
      centerOffset={{ x: -1, y: -12 }}
      coordinate={coordinates}
      flat>
      <Icon
        name="map-marker"
        style={{ color: colors.text }}
        width={28}
        height={28}
      />
    </Marker>
  );
};

export default MapMarker;
