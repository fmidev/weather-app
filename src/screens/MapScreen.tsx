import React, { useState, useEffect, useRef } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SafeAreaView, StyleSheet } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import RBSheet from 'react-native-raw-bottom-sheet';

import MapControls from '../components/MapControls';
import TimeStepBottomSheet from '../components/TimeStepBottomSheet';
import MapLayersBottomSheet from '../components/MapLayersBottomSheet';
import InfoBottomSheet from '../components/InfoBottomSheet';
import SearchBottomSheet from '../components/SearchBottomSheet';

import { State } from '../store/types';
import {
  selectGeolocation,
  selectActiveLocation,
} from '../store/general/selectors';
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
  activeLocation: selectActiveLocation(state),
  animateToArea: selectAnimateToArea(state),
});

const mapDispatchToProps = {
  setAnimateToArea: setAnimateToAreaAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type MapScreenProps = PropsFromRedux;

const MapScreen: React.FC<MapScreenProps> = ({
  activeLocation,
  animateToArea,
  geolocation,
  setAnimateToArea,
}) => {
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const mapRef = useRef() as React.MutableRefObject<MapView>;
  const timeStepSheetRef = useRef() as React.MutableRefObject<RBSheet>;
  const mapLayersSheetRef = useRef() as React.MutableRefObject<RBSheet>;
  const infoSheetRef = useRef() as React.MutableRefObject<RBSheet>;
  const searchSheetRef = useRef() as React.MutableRefObject<RBSheet>;

  useEffect(() => {
    if (geolocation) {
      setRegion({ ...INITIAL_ZOOM, ...geolocation });
    }
  }, [geolocation]);

  useEffect(() => {
    if (activeLocation && animateToArea) {
      const { lat, lon } = activeLocation;
      setRegion({ ...INITIAL_ZOOM, latitude: lat, longitude: lon });
      setAnimateToArea(false);
    }
  }, [activeLocation, animateToArea, setAnimateToArea]);
  return (
    <SafeAreaView style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        testID="map"
        style={styles.map}
        initialRegion={INITIAL_REGION}
        region={region}
        onRegionChangeComplete={(r) => setRegion(r)}
      />
      <MapControls
        onTimeStepPressed={() => timeStepSheetRef.current.open()}
        onLayersPressed={() => mapLayersSheetRef.current.open()}
        onInfoPressed={() => infoSheetRef.current.open()}
        onSearchPressed={() => searchSheetRef.current.open()}
      />

      <RBSheet
        ref={searchSheetRef}
        height={800}
        closeOnDragDown
        dragFromTopOnly
        customStyles={{ container: styles.sheetContainer }}
        keyboardAvoidingViewEnabled={false}>
        <SearchBottomSheet
          onClose={() => searchSheetRef.current.close()}
          onLocationSelect={() => setAnimateToArea(true)}
        />
      </RBSheet>

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
