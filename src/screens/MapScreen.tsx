import React, { useEffect, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SafeAreaView, StyleSheet, Platform } from 'react-native';
import MapView, { Camera, Region } from 'react-native-maps';
import RBSheet from 'react-native-raw-bottom-sheet';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useTheme } from '@react-navigation/native';
import { getDistance } from 'geolib';

import MapControls from '@components/map/ui/MapControls';
import RainRadarOverlay from '@components/map/layers/RainRadarOverlay';
import TimeStepBottomSheet from '@components/map/sheets/TimeStepBottomSheet';
import MapLayersBottomSheet from '@components/map/sheets/MapLayersBottomSheet';
import InfoBottomSheet from '@components/map/sheets/InfoBottomSheet';
import MapMarker from '@components/map/layers/MapMarker';

import { MapStackParamList } from '@navigators/types';
import { State } from '@store/types';
import { selectCurrent } from '@store/location/selector';
import { selectDisplayLocation } from '@store/map/selectors';

import darkMapStyle from '@utils/dark_map_style.json';

const INITIAL_REGION = {
  latitude: 64.62582958724917,
  longitude: 25.738316179155703,
  latitudeDelta: 12.605611795457705,
  longitudeDelta: 15.729689156090728,
};

const ANIMATE_ZOOM = {
  latitudeDelta: 0.349713388569298,
  longitudeDelta: 0.3956636710639145,
};

const mapStateToProps = (state: State) => ({
  currentLocation: selectCurrent(state),
  displayLocation: selectDisplayLocation(state),
});
const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type MapScreenProps = PropsFromRedux & {
  navigation: StackNavigationProp<MapStackParamList, 'Map'>;
  route: RouteProp<MapStackParamList, 'Map'>;
};

const MapScreen: React.FC<MapScreenProps> = ({
  currentLocation,
  displayLocation,
}) => {
  const { colors, dark } = useTheme();
  const [markerOutOfBounds, setMarkerOutOfBounds] = useState<boolean>(false);
  const mapRef = useRef() as React.MutableRefObject<MapView>;
  const timeStepSheetRef = useRef() as React.MutableRefObject<RBSheet>;
  const mapLayersSheetRef = useRef() as React.MutableRefObject<RBSheet>;
  const infoSheetRef = useRef() as React.MutableRefObject<RBSheet>;

  useEffect(() => {
    if (currentLocation) {
      const { lat: latitude, lon: longitude } = currentLocation;
      mapRef.current.animateToRegion({ ...ANIMATE_ZOOM, latitude, longitude });
    }
  }, [currentLocation]);

  const handleZoomIn = () => {
    mapRef.current.getCamera().then((cam: Camera) => {
      if (Platform.OS === 'ios') {
        mapRef.current.animateCamera({ altitude: cam.altitude - 50000 });
      } else {
        mapRef.current.animateCamera({ zoom: cam.zoom + 1 });
      }
    });
  };

  const handleZoomOut = () => {
    mapRef.current.getCamera().then((cam: Camera) => {
      if (Platform.OS === 'ios') {
        mapRef.current.animateCamera({ altitude: cam.altitude + 50000 });
      } else {
        mapRef.current.animateCamera({ zoom: cam.zoom - 1 });
      }
    });
  };

  const checkDistanceToLocation = (region: Region) => {
    if (currentLocation) {
      const { lat: latitude, lon: longitude } = currentLocation;
      const distance = getDistance(region, { latitude, longitude });
      if (distance >= 10000) {
        setMarkerOutOfBounds(true);
      } else {
        setMarkerOutOfBounds(false);
      }
    }
  };

  const animateToCurrentLocation = () => {
    if (currentLocation) {
      const { lat: latitude, lon: longitude } = currentLocation;
      mapRef.current.animateToRegion({ ...ANIMATE_ZOOM, latitude, longitude });
    }
  };

  const darkGoogleMapsStyle =
    dark && Platform.OS === 'android' ? darkMapStyle : [];

  return (
    <SafeAreaView style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        testID="map"
        style={styles.map}
        customMapStyle={darkGoogleMapsStyle}
        initialRegion={INITIAL_REGION}
        rotateEnabled={false}
        onRegionChangeComplete={checkDistanceToLocation}>
        <RainRadarOverlay />
        {displayLocation && currentLocation && (
          <MapMarker
            coordinates={{
              latitude: currentLocation?.lat,
              longitude: currentLocation?.lon,
            }}
          />
        )}
      </MapView>
      <MapControls
        onTimeStepPressed={() => timeStepSheetRef.current.open()}
        onLayersPressed={() => mapLayersSheetRef.current.open()}
        onInfoPressed={() => infoSheetRef.current.open()}
        onZoomIn={() => handleZoomIn()}
        onZoomOut={() => handleZoomOut()}
        showRelocateButton={markerOutOfBounds}
        relocate={() => animateToCurrentLocation()}
      />

      <RBSheet
        ref={infoSheetRef}
        height={600}
        closeOnDragDown
        dragFromTopOnly
        customStyles={{
          container: {
            ...styles.sheetContainer,
            backgroundColor: colors.background,
          },
        }}>
        <InfoBottomSheet onClose={() => infoSheetRef.current.close()} />
      </RBSheet>

      <RBSheet
        ref={mapLayersSheetRef}
        height={600}
        closeOnDragDown
        customStyles={{
          container: {
            ...styles.sheetContainer,
            backgroundColor: colors.background,
          },
        }}>
        <MapLayersBottomSheet
          onClose={() => mapLayersSheetRef.current.close()}
        />
      </RBSheet>

      <RBSheet
        ref={timeStepSheetRef}
        height={300}
        closeOnDragDown
        customStyles={{
          container: {
            ...styles.sheetContainer,
            backgroundColor: colors.background,
          },
        }}>
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
