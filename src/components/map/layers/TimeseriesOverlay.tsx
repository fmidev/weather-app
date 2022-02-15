import React, { useCallback, useMemo } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Dimensions } from 'react-native';
import Supercluster, { AnyProps, PointFeature } from 'supercluster';
import { Marker, Region } from 'react-native-maps';
// import { useTheme } from '@react-navigation/native';
// import { CustomTheme } from '@utils/colors';
import { weatherSymbolGetter } from '@assets/images';

import { State } from '@store/types';
import { MapOverlay, TimeseriesData } from '@store/map/types';
import { selectSliderTime, selectRegion } from '@store/map/selectors';

const mapStateToProps = (state: State) => ({
  region: selectRegion(state),
  sliderTime: selectSliderTime(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type TimeseriesOverlayProps = PropsFromRedux & {
  overlay: MapOverlay;
};

const TimeseriesOverlay: React.FC<TimeseriesOverlayProps> = ({
  region,
  sliderTime,
  overlay,
}) => {
  // const { dark } = useTheme() as CustomTheme;
  const { data } = overlay;

  const getZoomLevel = (longitudeDelta: number) => {
    const angle = longitudeDelta;
    return Math.round(Math.log(360 / angle) / Math.LN2);
  };

  const getBBox = (r: Region): [number, number, number, number] => {
    const padding = 0;
    return [
      r.longitude - r.longitudeDelta * (0.5 + padding),
      r.latitude - r.latitudeDelta * (0.5 + padding),
      r.longitude + r.longitudeDelta * (0.5 + padding),
      r.latitude + r.latitudeDelta * (0.5 + padding),
    ];
  };
  const getRadius = () => Dimensions.get('window').width * 0.135;

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
    (clusterData: TimeseriesData[] | undefined, clusterRegion: Region) => {
      const zoom = getZoomLevel(clusterRegion.longitudeDelta);
      const bbox = getBBox(clusterRegion);
      const radius = getRadius();

      const markers: PointFeature<AnyProps>[] = [];

      const cluster = new Supercluster({
        radius,
        minPoints: 2,
      } as AnyProps);

      if (!clusterData) {
        return { markers, cluster };
      }

      try {
        const points: PointFeature<AnyProps>[] = Object.entries(
          clusterData
        ).map(([lonlat, item]) => {
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
            },
            geometry: {
              type: 'Point',
              coordinates: lonlat.split(',').map(Number),
            },
          };
        });

        cluster.load(points);
        const clusters = cluster.getClusters(bbox, zoom);

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
    []
  );

  const { /* cluster, */ markers } = useMemo(
    () => getCluster(data, region),
    [data, region, getCluster]
  );

  const renderCluster = () =>
    markers.map(({ geometry, properties }) => {
      const [longitude, latitude] = geometry.coordinates;
      const { weatherData, name } = properties;
      const { smartSymbol } =
        weatherData.find(
          ({ epochtime }: { epochtime: number }) => sliderTime === epochtime
        ) || {};

      if (!smartSymbol) {
        return null;
      }

      return (
        <Marker
          key={`${name}`}
          coordinate={{ latitude, longitude }}
          title={`${name}`}
          // description={`${smartSymbol}`}
          tracksViewChanges={false}>
          {weatherSymbolGetter(
            smartSymbol.toString(),
            false
          )?.({
            width: 40,
            height: 40,
          })}
        </Marker>
      );
    });

  return <>{renderCluster()}</>;
};

export default connector(TimeseriesOverlay);
