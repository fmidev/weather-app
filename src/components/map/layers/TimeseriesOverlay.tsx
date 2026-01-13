import React, { useCallback, useMemo } from 'react';
import { connect, ConnectedProps } from 'react-redux';
// import { Dimensions } from 'react-native';
import Supercluster, { AnyProps, PointFeature } from 'supercluster';
import { Region } from 'react-native-maps';
import { ShapeSource, SymbolLayer, CircleLayer } from '@maplibre/maplibre-react-native';
import type { Position, FeatureCollection, Point } from "geojson";

import { State } from '@store/types';
import { MapOverlay } from '@store/map/types';
import { selectSliderTime, selectRegion } from '@store/map/selectors';

import TimeseriesMarker from './TimeseriesMarker';
import MlTimeseriesMarker from './MlTimeseriesMarker';

const MAPLIBRE_SYMBOL_LAYER = false;

const mapStateToProps = (state: State) => ({
  region: selectRegion(state),
  sliderTime: selectSliderTime(state),
});

const connector = connect(mapStateToProps, {});

type TimeseriesProps = {
  label: string;
  iconKey: string;
  smartSymbol: number;
  temperature: number;
  windSpeedMS: number;
  windDirection: number;
  epochtime: number;
};

type TimeseriesFeatureCollection =
  FeatureCollection<Point, TimeseriesProps>;

type PropsFromRedux = ConnectedProps<typeof connector>;

type TimeseriesOverlayProps = PropsFromRedux & {
  overlay: MapOverlay;
  library?: 'maplibre' | 'react-native-maps';
  mapBounds?: [northEast: Position, southWest: Position];
  zoom?: number;
};

const TimeseriesOverlay: React.FC<TimeseriesOverlayProps> = ({
  region,
  sliderTime,
  overlay,
  library = 'react-native-maps',
  mapBounds,
  zoom
}) => {
  console.log('TimeseriesOverlay render', library, mapBounds, region);
  const { data } = overlay;

  const getZoomLevel = (longitudeDelta: number) => {
    const angle = longitudeDelta;
    return Math.round(Math.log(360 / angle) / Math.LN2);
  };

  const getBBox = (r: Region): [number, number, number, number] => {
    const padding = 0.2;
    console.log('TimeseriesOverlay getBBox mapBounds', mapBounds);
    return mapBounds ? [
      mapBounds[1][0],
      mapBounds[1][1],
      mapBounds[0][0],
      mapBounds[0][1],
    ] : [
      r.longitude - r.longitudeDelta * (0.5 + padding),
      r.latitude - r.latitudeDelta * (0.5 + padding),
      r.longitude + r.longitudeDelta * (0.5 + padding),
      r.latitude + r.latitudeDelta * (0.5 + padding),
    ];
  };

  const clusterSelectedPoint = (
    leaves: Supercluster.PointFeature<Supercluster.AnyProps>[]
  ) =>
    leaves.sort((a, b) => {
      if (a.properties.name === 'Helsinki') {
        return -1;
      }
      if (b.properties.name === 'Helsinki') {
        return 1;
      }

      return a.properties.population < b.properties.population ? 1 : -1;
    })[0];

  const getCluster = useCallback(
    (points: PointFeature<AnyProps>[] | undefined, clusterRegion: Region) => {
      const zoomLevel = zoom ?? getZoomLevel(clusterRegion.longitudeDelta);
      console.log('zoomLevel', zoomLevel);
      const bbox = getBBox(clusterRegion);
      const radius = 260;

      const markers: PointFeature<AnyProps>[] = [];

      const cluster = new Supercluster({
        radius,
        minPoints: 2,
        extent: 1024,
      } as AnyProps);

      if (!points) {
        return { markers, cluster };
      }

      try {
        cluster.load(points);
        const clusters = cluster.getClusters(bbox, zoomLevel);

        markers.push(
          ...clusters.flatMap((clusterPoint) =>
            clusterPoint.id
              ? {
                  id: clusterPoint.id,
                  ...clusterSelectedPoint(
                    cluster.getLeaves(clusterPoint.id as number, Infinity)
                  ),
                }
              : clusterPoint
          )
        );
      } catch (e) {
        console.debug('failed to create cluster', e);
      }

      return { cluster, markers };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mapBounds, zoom]
  );

  const points = useMemo(
    () =>
      Object.entries(data || [])
        .map(([lonlat, item]) => {
          const [population] = Object.keys(item);
          const [name] = Object.keys(item[population]);
          const weatherData = Object.values(item[population][name]);

          return {
            type: 'Feature',
            properties: {
              cluster: false,
              population: Number(population),
              name,
              weatherData,
              label: name
            },
            geometry: {
              type: 'Point',
              coordinates: lonlat.split(',').map(Number),
            },
          };
        })
        .sort((a, b) =>
          a.properties.population < b.properties.population ? 1 : -1
        ) as PointFeature<AnyProps>[],
    [data]
  );

  const { markers } = useMemo(
    () => getCluster(points, region),
    [points, region, getCluster]
  );

  const markersToFeatureCollection = (m: Supercluster.PointFeature<Supercluster.AnyProps>[]): TimeseriesFeatureCollection => {
    return {
      type: "FeatureCollection",
      features: m.map((r) => {
        const { temperature } = r.properties.weatherData.find(
          ({ epochtime }: { epochtime: number }) => sliderTime === epochtime
        ) || {};

        return {
          type: "Feature",
          id: r.properties.name,
          properties: {
            ...r.properties as TimeseriesProps,
            label: temperature +" °C"
          },
          geometry: r.geometry
        }
      })
    }
  };

  const features = markersToFeatureCollection(markers);

  const renderCluster = () =>
    markers.map(({ geometry, properties }) => {
      const [longitude, latitude] = geometry.coordinates;
      const { weatherData, name } = properties;
      const { smartSymbol, temperature, windDirection, windSpeedMS } =
        weatherData.find(
          ({ epochtime }: { epochtime: number }) => sliderTime === epochtime
        ) || {};

      if (!smartSymbol) {
        return null;
      }

      return library === 'maplibre' ?
        (
          <MlTimeseriesMarker
            key={`${name}-${longitude}-${latitude}-${zoom}`}
            name={name}
            coordinate={[longitude, latitude]}
            zoom={zoom}
            smartSymbol={smartSymbol}
            temperature={temperature}
            windDirection={windDirection}
            windSpeedMS={windSpeedMS}
          />
        )
        : (
          <TimeseriesMarker
            key={`${name}-${longitude}-${latitude}`}
            name={name}
            coordinate={{ latitude, longitude }}
            smartSymbol={smartSymbol}
            temperature={temperature}
            windDirection={windDirection}
            windSpeedMS={windSpeedMS}
          />
      );
    });

  console.log('features', features.features.length);

  return library === 'maplibre' && MAPLIBRE_SYMBOL_LAYER ? (
    <ShapeSource
      key={`marker-${zoom}`}
      id={`marker-source`}
      shape={features}
    >
      <CircleLayer
        id={`marker-circle`}
        // eslint-disable-next-line react-native/no-inline-styles, react-native/no-color-literals
        style={{
          // ympyrän säde (pisteinä)
          circleRadius: 40,
          // valkoinen tausta
          circleColor: "#ffffff",
          circleStrokeColor: "#000000",
          circleStrokeWidth: 2,
          circlePitchAlignment: "map",
        }}
      />
      <SymbolLayer
        id={`marker-layer`}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          textField: ["get", "label"],
          textAllowOverlap: true,
          textFont: ["Noto Sans Regular"],
        }}
      />
    </ShapeSource>
    )
  :
    <>{renderCluster()}</>;
};

export default connector(TimeseriesOverlay);
