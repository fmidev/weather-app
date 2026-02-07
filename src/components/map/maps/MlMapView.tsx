import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, StyleSheet, Text } from 'react-native';
import { Camera, MapView, PointAnnotation, type MapViewRef, type CameraRef } from '@maplibre/maplibre-react-native';
import { useTheme, useIsFocused } from '@react-navigation/native';
import moment from 'moment';
import { getDistance } from 'geolib';

import WMSOverlay from '@components/map/layers/WMSOverlay';
import TimeseriesOverlay from '@components/map/layers/TimeseriesOverlay';
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

import { Config } from '@config';
import { useReloader } from '@utils/reloader';
import Icon from '@assets/Icon';
import { useTranslation } from 'react-i18next';
import type { Position } from "geojson";
import { trackMatomoEvent } from '@utils/matomo';

import type RBSheet from 'react-native-raw-bottom-sheet';

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

const MIN_ZOOM_LEVEL = 4;
const MAX_ZOOM_LEVEL = 10;
const DEFAULT_ZOOM_LEVEL = 8;

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

// MapView using Maplibre

const MlMapView: React.FC<MapViewProps> = ({
  currentLocation,
  displayLocation,
  overlay,
  activeOverlay,
  updateOverlays,
  timezone,
  infoSheetRef,
  mapLayersSheetRef,
}) => {
  const { i18n } = useTranslation();
  const { dark } = useTheme();
  const isFocused = useIsFocused();
  const { shouldReload } = useReloader();
  const { updateInterval } = Config.get('map');
  const [markerOutOfBounds, setMarkerOutOfBounds] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(DEFAULT_ZOOM_LEVEL);
  const mapRef = useRef<MapViewRef>(null);
  const cameraRef = useRef<CameraRef>(null);
  const [mapUpdated, setMapUpdated] = useState<number>(Date.now());
  const [mapBounds, setMapBounds] = useState<[northEast: Position, southWest: Position] | undefined>(undefined);
  const [styleReady, setStyleReady] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const location = currentLocation ?? Config.get('location').default;
  const { baseMap } = Config.get('map');

  const initialRegion = useMemo(() => ({
    latitude: location.lat ?? INITIAL_REGION.latitude,
    longitude: location.lon ?? INITIAL_REGION.longitude,
    longitudeDelta: location
      ? ANIMATE_ZOOM.longitudeDelta
      : INITIAL_REGION.longitudeDelta,
    latitudeDelta: location
      ? ANIMATE_ZOOM.latitudeDelta
      : INITIAL_REGION.latitudeDelta,
  }), [location]);

  useEffect(() => {
    if (activeOverlay) {
      updateOverlays(activeOverlay, 'maplibre');
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
      updateOverlays(activeOverlay, 'maplibre');
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

  const updateBoundsFromRef = useCallback(async () => {
    const bounds = await mapRef.current?.getVisibleBounds();
    if (!bounds) return;

    setMapBounds(bounds);
  }, []);

  const onDidFinishRenderingFrame = useCallback(() => {
    if (!mapReady) {
      setMapReady(true);
      updateBoundsFromRef();
    }
  }, [mapReady, updateBoundsFromRef]);

  const onRegionDidChange = useCallback((event: any) => {
    if (!styleReady || !mapReady) return;

    const { zoomLevel: zoom, visibleBounds } = event.properties;

    if (!visibleBounds) return;
    setMapBounds(visibleBounds);

    const [lon, lat] = event.geometry.coordinates;
    const distance = getDistance(initialRegion, {latitude: lat, longitude: lon});
    if (distance >= 10000) {
      setMarkerOutOfBounds(true);
    } else {
      setMarkerOutOfBounds(false);
    }

    if (zoom) setZoomLevel(zoom);

  }, [styleReady, mapReady, initialRegion]);

  const animateToCurrentLocation = () => {
    cameraRef.current?.setCamera({
      centerCoordinate: [initialRegion.longitude, initialRegion.latitude],
      zoomLevel: DEFAULT_ZOOM_LEVEL,
      animationMode: "flyTo",
      animationDuration: 1000,
    });
  };

  const handleZoomIn = async () => {
    const currentZoom = await mapRef.current?.getZoom();
    if (currentZoom) {
      const zoom = Math.min(currentZoom + 1, MAX_ZOOM_LEVEL);
      cameraRef.current?.zoomTo(zoom, 0);
    }
  };

  const handleZoomOut = async () => {
    const currentZoom = await mapRef.current?.getZoom();
    if (currentZoom) {
      const zoom = Math.max(currentZoom - 1, MIN_ZOOM_LEVEL);
      cameraRef.current?.zoomTo(zoom, 0);
    }
  };

  const cameraDefaults = useMemo(() => {
    if (!location) return undefined;
    return {
      centerCoordinate: [location.lon, location.lat],
      zoomLevel: DEFAULT_ZOOM_LEVEL,
    };
  }, [location]);

  if (!baseMap) {
    return <Text>MapLibre requires baseMap configuration</Text>
  }

  const mapStyle = baseMap.url+(dark ? baseMap.darkStyle : baseMap.lightStyle)
                    .replace('{lang}', i18n.language);

  return (
    <View style={styles.mapContainer}>
      <MapView
        testID="maplibre_map"
        ref={mapRef}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{ flex: 1, width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        onDidFinishLoadingStyle={() => setStyleReady(true)}
        onDidFinishRenderingFrameFully={onDidFinishRenderingFrame}
        onRegionDidChange={onRegionDidChange}
        >
        <Camera
          ref={cameraRef}
          defaultSettings={cameraDefaults}
          maxZoomLevel={MAX_ZOOM_LEVEL}
          minZoomLevel={MIN_ZOOM_LEVEL}
          animationDuration={0}
        />

        {styleReady && overlay?.type === 'WMS' && <WMSOverlay overlay={overlay} library="maplibre" />}
        {styleReady && overlay?.type === 'Timeseries' && mapBounds && (
          <TimeseriesOverlay
            overlay={overlay}
            library="maplibre"
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
});

export default connector(MlMapView);
