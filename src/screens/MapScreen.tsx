import React, { useState, useEffect, useRef } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SafeAreaView, StyleSheet } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import RBSheet from 'react-native-raw-bottom-sheet';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import MapControls from '../components/MapControls';
import RainRadarOverlay from '../components/RainRadarOverlay';
import TimeStepBottomSheet from '../components/TimeStepBottomSheet';
import MapLayersBottomSheet from '../components/MapLayersBottomSheet';
import InfoBottomSheet from '../components/InfoBottomSheet';

import { MapStackParamList } from '../navigators/types';
import { State } from '../store/types';
import { selectGeolocation } from '../store/general/selectors';
import { selectAnimateToArea } from '../store/map/selectors';
import { setAnimateToArea as setAnimateToAreaAction } from '../store/map/actions';

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
  animateToArea: selectAnimateToArea(state),
});

const mapDispatchToProps = {
  setAnimateToArea: setAnimateToAreaAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type MapScreenProps = PropsFromRedux & {
  navigation: StackNavigationProp<MapStackParamList, 'Map'>;
  route: RouteProp<MapStackParamList, 'Map'>;
};

const MapScreen: React.FC<MapScreenProps> = ({
  animateToArea,
  geolocation,
  navigation,
  route,
  setAnimateToArea,
}) => {
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const mapRef = useRef() as React.MutableRefObject<MapView>;
  const timeStepSheetRef = useRef() as React.MutableRefObject<RBSheet>;
  const mapLayersSheetRef = useRef() as React.MutableRefObject<RBSheet>;
  const infoSheetRef = useRef() as React.MutableRefObject<RBSheet>;

  useEffect(() => {
    // TODO: needs optimization
    if (route.params) {
      // console.log('maybe should animate to searched area', route);
      const { lat, lon } = route.params;
      // TODO: should compare if region is close enough, animate if NOT
      if (animateToArea && lat && lon) {
        const location = { latitude: lat, longitude: lon, ...INITIAL_ZOOM };
        setAnimateToArea(false);
        setRegion(location);
        mapRef.current.animateToRegion(location);
      }
    }
  }, [route, animateToArea, setAnimateToArea]);

  useEffect(() => {
    if (
      geolocation &&
      region?.latitude !== geolocation.latitude &&
      region?.longitude !== geolocation.longitude
    ) {
      setRegion({ ...INITIAL_ZOOM, ...geolocation });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        testID="map"
        style={styles.map}
        initialRegion={INITIAL_REGION}
        region={region}
        // TODO: causes weird panning behavior
        // onRegionChangeComplete={(r) => setRegion(r)}
        rotateEnabled={false}>
        <RainRadarOverlay />
      </MapView>
      <MapControls
        onTimeStepPressed={() => timeStepSheetRef.current.open()}
        onLayersPressed={() => mapLayersSheetRef.current.open()}
        onInfoPressed={() => infoSheetRef.current.open()}
        onSearchPressed={() => navigation.navigate('Search')}
      />

      <RBSheet
        ref={infoSheetRef}
        height={600}
        closeOnDragDown
        dragFromTopOnly
        customStyles={{ container: styles.sheetContainer }}>
        <InfoBottomSheet onClose={() => infoSheetRef.current.close()} />
      </RBSheet>

      <RBSheet
        ref={mapLayersSheetRef}
        height={600}
        closeOnDragDown
        customStyles={{ container: styles.sheetContainer }}>
        <MapLayersBottomSheet
          onClose={() => mapLayersSheetRef.current.close()}
        />
      </RBSheet>

      <RBSheet
        ref={timeStepSheetRef}
        height={300}
        closeOnDragDown
        customStyles={{ container: styles.sheetContainer }}>
        <TimeStepBottomSheet onClose={() => timeStepSheetRef.current.close()} />
      </RBSheet>
    </SafeAreaView>
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
  sheetContainer: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
});

export default connector(MapScreen);
