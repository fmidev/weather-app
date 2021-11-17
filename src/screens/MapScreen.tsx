import React, { useEffect, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SafeAreaView, StyleSheet, Platform } from 'react-native';
import MapView, { Camera, Region } from 'react-native-maps';
import RBSheet from 'react-native-raw-bottom-sheet';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useTheme } from '@react-navigation/native';
import { getDistance } from 'geolib';

import MapControls from '@components/map/ui/MapControls';
import WMSOverlay from '@components/map/layers/WMSOverlay';
import MapLayersBottomSheet from '@components/map/sheets/MapLayersBottomSheet';
import InfoBottomSheet from '@components/map/sheets/InfoBottomSheet';
import MapMarker from '@components/map/layers/MapMarker';

import { MapStackParamList } from '@navigators/types';
import { State } from '@store/types';
import { selectCurrent } from '@store/location/selector';
import { selectDisplayLocation, selectOverlay } from '@store/map/selectors';
import { initializeOverlays as initializeOverlaysAction } from '@store/map/actions';

import darkMapStyle from '@utils/dark_map_style.json';

const INITIAL_REGION = {
  latitude: 64.62582958724917,
  longitude: 25.738316179155703,
  latitudeDelta: 12.605611795457705,
  longitudeDelta: 15.729689156090728,
};

const ANIMATE_ZOOM = {
  latitudeDelta: 1.3447962255539707,
  longitudeDelta: 1.4189536248254342,
};

const mapStateToProps = (state: State) => ({
  currentLocation: selectCurrent(state),
  displayLocation: selectDisplayLocation(state),
  overlay: selectOverlay(state),
});

const mapDispatchToProps = {
  initializeOverlays: initializeOverlaysAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type MapScreenProps = PropsFromRedux & {
  navigation: StackNavigationProp<MapStackParamList, 'Map'>;
  route: RouteProp<MapStackParamList, 'Map'>;
  id: number;
};

const MapScreen: React.FC<MapScreenProps> = ({
  currentLocation,
  displayLocation,
  overlay,
  initializeOverlays,
}) => {
  const { colors, dark } = useTheme();
  const [markerOutOfBounds, setMarkerOutOfBounds] = useState<boolean>(false);
  const mapRef = useRef() as React.MutableRefObject<MapView>;
  const mapLayersSheetRef = useRef() as React.MutableRefObject<RBSheet>;
  const infoSheetRef = useRef() as React.MutableRefObject<RBSheet>;

  useEffect(() => {
    initializeOverlays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        userInterfaceStyle={dark ? 'dark' : 'light'}
        customMapStyle={darkGoogleMapsStyle}
        initialRegion={INITIAL_REGION}
        rotateEnabled={false}
        onRegionChangeComplete={checkDistanceToLocation}>
        {overlay && <WMSOverlay overlay={overlay} />}
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
