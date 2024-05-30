import React, { useEffect, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { Camera, Region } from 'react-native-maps';
import type { MapPressEvent } from 'react-native-maps';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useTheme, useIsFocused } from '@react-navigation/native';
import { getDistance } from 'geolib';
import moment from 'moment';

import MapControls from '@components/map/ui/MapControls';
import WMSOverlay from '@components/map/layers/WMSOverlay';
import TimeseriesOverlay from '@components/map/layers/TimeseriesOverlay';
import MapLayersBottomSheet from '@components/map/sheets/MapLayersBottomSheet';
import InfoBottomSheet from '@components/map/sheets/InfoBottomSheet';
import MapMarker from '@components/map/layers/MapMarker';
import Announcements from '@components/announcements/Announcements';

import { State } from '@store/types';
import { selectCurrent, selectTimeZone } from '@store/location/selector';
import {
  selectActiveOverlay,
  selectDisplayLocation,
  selectOverlay,
} from '@store/map/selectors';
import {
  updateOverlays as updateOverlaysAction,
  updateRegion as updateRegionAction,
  updateSelectedCallout as updateSelectedCalloutAction,
} from '@store/map/actions';

import darkMapStyle from '@utils/dark_map_style.json';
import { GRAY_1 } from '@utils/colors';
import { Config } from '@config';
import { useReloader } from '@utils/reloader';

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
  activeOverlay: selectActiveOverlay(state),
  timezone: selectTimeZone(state),
});

const mapDispatchToProps = {
  updateOverlays: updateOverlaysAction,
  updateRegion: updateRegionAction,
  updateSelectedCallout: updateSelectedCalloutAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type MapScreenProps = PropsFromRedux & {};

const MapScreen: React.FC<MapScreenProps> = ({
  currentLocation,
  displayLocation,
  overlay,
  activeOverlay,
  updateOverlays,
  timezone,
  updateRegion,
  updateSelectedCallout,
}) => {
  const { colors, dark } = useTheme();
  const isFocused = useIsFocused();
  const { shouldReload } = useReloader();
  const { updateInterval } = Config.get('map');
  const [markerOutOfBounds, setMarkerOutOfBounds] = useState<boolean>(false);
  const mapRef = useRef() as React.MutableRefObject<MapView>;
  const mapLayersSheetRef = useRef() as React.MutableRefObject<RBSheet>;
  const infoSheetRef = useRef() as React.MutableRefObject<RBSheet>;
  const [mapUpdated, setMapUpdated] = useState<number>(Date.now());

  const location = currentLocation ?? Config.get('location').default;

  const initialRegion = {
    latitude: location.lat ?? INITIAL_REGION.latitude,
    longitude: location.lon ?? INITIAL_REGION.longitude,
    longitudeDelta: location
      ? ANIMATE_ZOOM.longitudeDelta
      : INITIAL_REGION.longitudeDelta,
    latitudeDelta: location
      ? ANIMATE_ZOOM.latitudeDelta
      : INITIAL_REGION.latitudeDelta,
  };

  useEffect(() => {
    if (activeOverlay) {
      updateOverlays(activeOverlay);
      setMapUpdated(Date.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOverlay]);

  useEffect(() => {
    moment.tz.setDefault(timezone);
  }, [timezone]);

  useEffect(() => {
    const now = Date.now();
    const mapUpdateTime = mapUpdated + (updateInterval ?? 5) * 60 * 1000;
    if (isFocused && (now > mapUpdateTime || shouldReload > mapUpdateTime)) {
      updateOverlays(activeOverlay);
      setMapUpdated(now);
    }
  }, [
    isFocused,
    mapUpdated,
    shouldReload,
    updateInterval,
    updateOverlays,
    activeOverlay,
  ]);

  useEffect(() => {
    if (location) {
      const { lat: latitude, lon: longitude } = location;
      mapRef.current.animateToRegion({ ...ANIMATE_ZOOM, latitude, longitude });
    }
  }, [location]);

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

  const onRegionChangeComplete = (region: Region) => {
    updateRegion(region);
    if (location) {
      const { lat: latitude, lon: longitude } = location;
      const distance = getDistance(region, { latitude, longitude });
      if (distance >= 10000) {
        setMarkerOutOfBounds(true);
      } else {
        setMarkerOutOfBounds(false);
      }
    }
  };
  const onPress = (e: MapPressEvent) => {
    if (e.nativeEvent.action !== 'marker-press') {
      updateSelectedCallout(undefined);
    }
  };

  const animateToCurrentLocation = () => {
    if (location) {
      const { lat: latitude, lon: longitude } = location;
      mapRef.current.animateToRegion({ ...ANIMATE_ZOOM, latitude, longitude });
    }
  };

  const darkGoogleMapsStyle =
    dark && Platform.OS === 'android' ? darkMapStyle : [];

  const mapMaxZoom = Platform.OS === 'android' ? 10 : 9.5;
  const mapMinZoom = Platform.OS === 'android' ? 4 : 3.5;

  return (
    <View style={styles.mapContainer}>
      <MapView
        accessibilityElementsHidden
        ref={mapRef}
        testID="map"
        style={styles.map}
        userInterfaceStyle={dark ? 'dark' : 'light'}
        maxZoomLevel={mapMaxZoom}
        minZoomLevel={mapMinZoom}
        customMapStyle={darkGoogleMapsStyle}
        initialRegion={initialRegion}
        rotateEnabled={false}
        toolbarEnabled={false}
        onRegionChangeComplete={onRegionChangeComplete}
        onPress={onPress}
        moveOnMarkerPress={false}>
        {overlay && overlay.type === 'WMS' && <WMSOverlay overlay={overlay} />}
        {overlay && overlay.type === 'Timeseries' && (
          <TimeseriesOverlay overlay={overlay} />
        )}
        {displayLocation && currentLocation && (
          <MapMarker
            coordinates={{
              latitude: location?.lat,
              longitude: location?.lon,
            }}
          />
        )}
      </MapView>
      <Announcements style={styles.announcements} />
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
          draggableIcon: styles.draggableIcon,
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
          draggableIcon: styles.draggableIcon,
        }}>
        <MapLayersBottomSheet
          onClose={() => mapLayersSheetRef.current.close()}
        />
      </RBSheet>
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
  sheetContainer: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  draggableIcon: {
    backgroundColor: GRAY_1,
    width: 65,
  },
  announcements: {
    marginTop: 30,
    width: '100%',
  },
});

export default connector(MapScreen);
