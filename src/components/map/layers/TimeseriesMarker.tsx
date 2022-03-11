import React, { MutableRefObject, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker, LatLng } from 'react-native-maps';
import { useTheme } from '@react-navigation/native';

import { weatherSymbolGetter } from '@assets/images';
import { CustomTheme } from '@utils/colors';

import TimeseriesCallout from './TimeseriesCallout';

type TimeseriesMarkerProps = {
  name: string;
  coordinate: LatLng;
  smartSymbol: number;
  temperature: number;
  windDirection: number;
  windSpeedMS: number;
};

const TimeseriesMarker: React.FC<TimeseriesMarkerProps> = ({
  name,
  coordinate,
  smartSymbol,
  temperature,
  windDirection,
  windSpeedMS,
}) => {
  const markerRef = useRef() as MutableRefObject<Marker>;
  const { colors } = useTheme() as CustomTheme;

  return (
    <Marker
      ref={markerRef}
      coordinate={coordinate}
      tracksViewChanges={false}
      onCalloutPress={() => {
        markerRef.current.hideCallout();
      }}
      pointerEvents="auto">
      <View
        style={[
          styles.markerContainer,
          {
            backgroundColor: colors.mapButtonBackground,
            borderColor: colors.mapButtonBorder,
          },
        ]}>
        {weatherSymbolGetter(
          smartSymbol.toString(),
          false
        )?.({
          width: 40,
          height: 40,
        })}
        <Text
          style={[
            styles.tempText,
            { color: colors.text },
          ]}>{`${temperature}°`}</Text>
      </View>
      <TimeseriesCallout
        item={{ name, smartSymbol, windDirection, windSpeedMS }}
      />
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderRadius: 4,
    maxWidth: 75,
  },
  tempText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    marginLeft: 4,
  },
});

export default TimeseriesMarker;
