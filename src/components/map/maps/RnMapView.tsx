import React, { useEffect, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { Camera, Region } from 'react-native-maps';
import type { MapPressEvent } from 'react-native-maps';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useTheme, useIsFocused } from '@react-navigation/native';
import { getDistance } from 'geolib';
import moment from 'moment';

import WMSOverlay from '@components/map/layers/WMSOverlay';
import TimeseriesOverlay from '@components/map/layers/TimeseriesOverlay';
import MapMarker from '@components/map/layers/MapMarker';
import MapControls from '@components/map/ui/MapControls';

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
import { Config } from '@config';
import { useReloader } from '@utils/reloader';
import { trackMatomoEvent } from '@utils/matomo';

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
type MapViewProps = PropsFromRedux & {
  infoSheetRef: React.RefObject<RBSheet | null>,
  mapLayersSheetRef: React.RefObject<RBSheet | null>
};

// MapView using react-native-maps

const RnMapView: React.FC<MapViewProps> = ({
  currentLocation,
  displayLocation,
  overlay,
  activeOverlay,
  updateOverlays,
  timezone,
  updateRegion,
  updateSelectedCallout,
  infoSheetRef,
  mapLayersSheetRef
}) => {
  const { dark } = useTheme();
  const isFocused = useIsFocused();
  const { shouldReload } = useReloader();
  const { updateInterval } = Config.get('map');
  const [markerOutOfBounds, setMarkerOutOfBounds] = useState<boolean>(false);
  const mapRef = useRef<MapView>(null);
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
      updateOverlays(activeOverlay, 'react-native-maps');
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
      updateOverlays(activeOverlay, 'react-native-maps');
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
    if (location && mapRef.current) {
      const { lat: latitude, lon: longitude } = location;
      mapRef.current.animateToRegion({ ...ANIMATE_ZOOM, latitude, longitude });
    }
  }, [location]);

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.getCamera().then((cam: Camera) => {
        if (Platform.OS === 'ios' && cam.altitude !== undefined) {
          mapRef.current?.animateCamera({ altitude: cam.altitude - 50000 });
        } else if (Platform.OS === 'android' && cam.zoom !== undefined) {
          mapRef.current?.animateCamera({ zoom: cam.zoom + 1 });
        }
      });
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.getCamera().then((cam: Camera) => {
        if (Platform.OS === 'ios' && cam.altitude !== undefined) {
          mapRef.current?.animateCamera({ altitude: cam.altitude + 50000 });
        } else if (Platform.OS === 'android' && cam.zoom !== undefined) {
          mapRef.current?.animateCamera({ zoom: cam.zoom - 1 });
        }
      });
    }
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
    if (location && mapRef.current) {
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
        {overlay && overlay.type === 'WMS' && <WMSOverlay overlay={overlay} library="react-native-maps"/>}
        {overlay && overlay.type === 'Timeseries' && <TimeseriesOverlay overlay={overlay} />}
        {displayLocation && currentLocation && (
          <MapMarker
            coordinates={{
              latitude: location?.lat,
              longitude: location?.lon,
            }}
          />
        )}
      </MapView>
      <MapControls
        onLayersPressed={() => mapLayersSheetRef.current?.open()}
        onInfoPressed={() => {
          trackMatomoEvent('User action', 'Map', 'Open info panel');
          infoSheetRef.current?.open()
        }}
        onZoomIn={() => {
          trackMatomoEvent('User action', 'Map', 'Zoom IN');
          handleZoomIn();
        }}
        onZoomOut={() =>{
          trackMatomoEvent('User action', 'Map', 'Zoom OUT');
          handleZoomOut();
        }}
        showRelocateButton={markerOutOfBounds}
        relocate={() => {
          trackMatomoEvent('User action', 'Map', 'Relocate');
          animateToCurrentLocation();
        }}
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

export default connector(RnMapView);
