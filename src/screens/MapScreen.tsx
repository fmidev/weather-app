import React, { useState, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, StyleSheet } from 'react-native';
import MapView, { Region } from 'react-native-maps';

import { State } from '../store/types';
import { selectGeolocation } from '../store/general/selectors';

const INITIAL_REGION = {
  latitude: 64.62582958724917,
  longitude: 25.738316179155703,
  latitudeDelta: 12.605611795457705,
  longitudeDelta: 15.729689156090728,
};

const INITIAL_ZOOM = {
  latitudeDelta: 3.317838912399168,
  longitudeDelta: 4.762519516243344,
};

const mapStateToProps = (state: State) => ({
  geolocation: selectGeolocation(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux;

const MapScreen: React.FC<Props> = ({ geolocation }) => {
  const [region, setRegion] = useState<Region | undefined>(undefined);
  useEffect(() => {
    if (geolocation) {
      setRegion({ ...INITIAL_ZOOM, ...geolocation });
    }
  }, [geolocation]);
  return (
    <View style={styles.mapContainer}>
      <MapView
        testID="map"
        style={styles.map}
        initialRegion={INITIAL_REGION}
        region={region}
        onRegionChangeComplete={(r) => setRegion(r)}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    // hack map labels out of bounds
    marginBottom: -30,
    marginTop: -30,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default connector(MapScreen);
