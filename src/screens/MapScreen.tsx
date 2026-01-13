import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, StyleSheet, Platform, useWindowDimensions, Text } from 'react-native';
import MapView, { Camera, Region } from 'react-native-maps';
import type { MapPressEvent } from 'react-native-maps';
import { Camera as MlCamera, MapView as MlMapView, PointAnnotation, type MapViewRef } from '@maplibre/maplibre-react-native';
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
import { GRAY_1 } from '@assets/colors';
import { Config } from '@config';
import { useReloader } from '@utils/reloader';
import { trackMatomoEvent } from '@utils/matomo';
import Icon from '@assets/Icon';
import { useTranslation } from 'react-i18next';
import type { Position } from "geojson";

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

const MIN_ZOOM_LEVEL = 1;
const MAX_ZOOM_LEVEL = 10;

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
  const { i18n } = useTranslation();
  const { fontScale } = useWindowDimensions();
  const { colors, dark } = useTheme();
  const isFocused = useIsFocused();
  const { shouldReload } = useReloader();
  const { library, updateInterval } = Config.get('map');
  const [markerOutOfBounds, setMarkerOutOfBounds] = useState<boolean>(false);
  const mapRef = useRef<MapView>(null);
  const mlMapRef = useRef<MapViewRef>(null);
  const mapLayersSheetRef = useRef<RBSheet>(null);
  const infoSheetRef = useRef<RBSheet>(null);
  const [mapUpdated, setMapUpdated] = useState<number>(Date.now());
  const [zoomLevel, setZoomLevel] = useState<number>(8);
  const [mapBounds, setMapBounds] = useState<[northEast: Position, southWest: Position] | undefined>(undefined);
  const [styleReady, setStyleReady] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const location = currentLocation ?? Config.get('location').default;
  const { baseMap } = Config.get('map');
  const largeFonts = fontScale > 1.5;

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
    if (location && mapRef.current) {
      const { lat: latitude, lon: longitude } = location;
      mapRef.current.animateToRegion({ ...ANIMATE_ZOOM, latitude, longitude });
    }
  }, [location]);

  const handleZoomIn = () => {
    if (library === 'maplibre') {
      setZoomLevel(Math.min(zoomLevel + 1, MAX_ZOOM_LEVEL));
    } else {
      if (mapRef.current) {
        mapRef.current.getCamera().then((cam: Camera) => {
          if (Platform.OS === 'ios' && cam.altitude !== undefined) {
            mapRef.current?.animateCamera({ altitude: cam.altitude - 50000 });
          } else if (Platform.OS === 'android' && cam.zoom !== undefined) {
            mapRef.current?.animateCamera({ zoom: cam.zoom + 1 });
          }
        });
      }
    }
  };

  const handleZoomOut = () => {
    if (library === 'maplibre') {
      setZoomLevel(Math.max(zoomLevel - 1, MIN_ZOOM_LEVEL));
    } else {
      if (mapRef.current) {
        mapRef.current.getCamera().then((cam: Camera) => {
          if (Platform.OS === 'ios' && cam.altitude !== undefined) {
            mapRef.current?.animateCamera({ altitude: cam.altitude + 50000 });
          } else if (Platform.OS === 'android' && cam.zoom !== undefined) {
            mapRef.current?.animateCamera({ zoom: cam.zoom - 1 });
          }
        });
      }
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

  const updateBoundsFromRef = useCallback(async () => {
    const bounds = await mlMapRef.current?.getVisibleBounds();
    if (!bounds) return;

    setMapBounds(bounds);
  }, []);

  const onDidFinishRenderingFrame = useCallback(() => {
    if (!mapReady) {
      setMapReady(true);
      updateBoundsFromRef();
    }
  }, [mapReady, updateBoundsFromRef]);

  const onRegionDidChange = useCallback((region: any) => {
    if (!styleReady || !mapReady) return;

    const vb = region?.properties?.visibleBounds;
    if (!vb) return;

    console.log('MapScreen onRegionDidChange visibleBounds', vb);
    setMapBounds(vb);

    const zoom = region?.properties?.zoomLevel;
    if (!zoom) return;

    console.log('MapScreen onRegionDidChange zoom', zoom);
    setZoomLevel(zoom);
  }, [styleReady, mapReady]);

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

  if (library === 'maplibre' && !baseMap) {
    return <Text>MapLibre requires baseMap configuration</Text>
  }

  const mapStyle = baseMap!.url+(dark ? baseMap!.darkStyle : baseMap!.lightStyle)
                    .replace('{lang}', i18n.language);

  console.log('MapScreen render', zoomLevel);

  return (
    <View style={styles.mapContainer}>
      { library === 'maplibre' ? (
        <MlMapView
          testID="maplibre_map"
          ref={mlMapRef}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{ flex: 1, width: '100%', height: '100%' }}
          mapStyle={mapStyle}
          onDidFinishLoadingStyle={() => setStyleReady(true)}
          onDidFinishRenderingFrameFully={onDidFinishRenderingFrame}
          onRegionDidChange={onRegionDidChange}
         >
          <MlCamera
            defaultSettings={{
              centerCoordinate: [location?.lon, location?.lat],
              zoomLevel: zoomLevel
            }}
            maxZoomLevel={mapMaxZoom}
            minZoomLevel={mapMinZoom}
            animationDuration={0}
          />

          {styleReady && overlay?.type === 'WMS' && <WMSOverlay overlay={overlay} library={library} />}
          {styleReady && overlay?.type === 'Timeseries' && mapBounds && (
            <TimeseriesOverlay
              overlay={overlay}
              library={library}
              mapBounds={mapBounds}
              zoom={zoomLevel}
            />
          )}
          {displayLocation && currentLocation && (
            <PointAnnotation
              id="location-marker"
              coordinate={[initialRegion.longitude, initialRegion.latitude]}
              anchor={{ x: 0.5, y: 1 }}
            >
              <Icon name="map-marker" size={22} />
            </PointAnnotation>
          )}
        </MlMapView>
      ) : (
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
          {overlay && overlay.type === 'WMS' && <WMSOverlay overlay={overlay} library={library} />}
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
      )}
      <Announcements style={styles.announcements} />
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
        <InfoBottomSheet onClose={() => infoSheetRef.current?.close()} />
      </RBSheet>

      <RBSheet
        ref={mapLayersSheetRef}
        height={largeFonts ? 650 : 620}
        closeOnDragDown
        customStyles={{
          container: {
            ...styles.sheetContainer,
            backgroundColor: colors.background,
          },
          draggableIcon: styles.draggableIcon,
        }}>
        <MapLayersBottomSheet
          onClose={() => mapLayersSheetRef.current?.close()}
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
    width: '100%',
    marginTop: 30,
  },
});

export default connector(MapScreen);
