import React from 'react';
import { WMSTile } from 'react-native-maps';
import {
  Layer,
  RasterSource,
  VectorSource,
} from '@maplibre/maplibre-react-native';
import type { MapTileFormat, VectorTileSettings } from '@config';
import type { VectorLayerStyle } from '@store/map/types';

type MemoizedWMSTileProps = {
  urlTemplate: string;
  tileSize?: number;
  opacity?: number;
  tileFormat?: MapTileFormat;
  vectorLayers?: VectorLayerStyle[];
  mvt?: VectorTileSettings;
  library?: 'maplibre' | 'react-native-maps';
};

const parseMvtReference = (
  reference: string | undefined,
  defaultProperty: string
) => {
  if (!reference) return {};

  const separator = reference.indexOf('.');
  if (separator < 0) {
    return { sourceLayer: reference, property: defaultProperty };
  }

  return {
    sourceLayer: reference.slice(0, separator),
    property: reference.slice(separator + 1) || defaultProperty,
  };
};

const MemoizedWMSTile: React.FC<MemoizedWMSTileProps> = ({
  urlTemplate,
  tileSize,
  opacity,
  tileFormat,
  vectorLayers,
  mvt,
  library = 'react-native-maps',
}) => {
  const items = urlTemplate.split('?');
  const key = items.length > 1 ? items[1] : urlTemplate;
  const { sourceLayer: mvtSourceLayer, property: mvtProperty } =
    parseMvtReference(mvt?.value, 'text');
  const { sourceLayer: windSourceLayer, property: windProperty } =
    parseMvtReference(mvt?.windDirection, 'direction');

  let textField: any[] = ['to-string', ['get', mvtProperty]];
  if (mvt?.precision !== undefined) {
    const precision = Math.max(0, Math.floor(mvt.precision));
    const multiplier = 10 ** precision;
    const numericValue: any[] = ['to-number', ['get', mvtProperty]];
    const roundedValue =
      precision === 0
        ? ['round', numericValue]
        : ['/', ['round', ['*', numericValue, multiplier]], multiplier];
    textField = ['to-string', roundedValue];
  }

  if (library === 'maplibre' && tileFormat === 'pbf') {
    return (
      <VectorSource
        id={`wms-source-${key}`}
        tiles={[urlTemplate]}
        {...(mvt?.maxZoom !== undefined
          ? { minzoom: 1, maxzoom: mvt.maxZoom }
          : {})}>
        {vectorLayers?.map(({ id, paint, ...layer }, index) => {
          const opacityProperty = `${layer.type}-opacity`;
          const baseOpacity = paint?.[opacityProperty];
          const animationOpacity = opacity ?? 0;
          const combinedOpacity =
            baseOpacity === undefined
              ? animationOpacity
              : typeof baseOpacity === 'number'
                ? baseOpacity * animationOpacity
                : ['*', baseOpacity, animationOpacity];
          const layerProps = {
            ...layer,
            id: `wms-layer-${key}-${id ?? index}`,
            source: `wms-source-${key}`,
            beforeId: 'places_region',
            paint: {
              ...paint,
              [opacityProperty]: combinedOpacity,
              [`${opacityProperty}-transition`]: {
                duration: 10,
                delay: 0,
              },
            },
          } as React.ComponentProps<typeof Layer>;

          return (
            <Layer {...layerProps} key={`wms-layer-${key}-${id ?? index}`} />
          );
        })}
        {mvtSourceLayer && (
          <Layer
            {...({
              id: `wms-text-layer-${key}-${mvt?.value}`,
              type: 'symbol',
              source: `wms-source-${key}`,
              'source-layer': mvtSourceLayer,
              beforeId: 'places_region',
              layout: {
                'text-field': textField,
                'text-font': ['Noto Sans Regular'],
                'text-size': 16,
                'text-allow-overlap': true,
                'text-ignore-placement': true,
                visibility: 'visible',
              },
              paint: {
                'text-color': '#1a1a1a',
                'text-halo-color': '#ffffff',
                'text-halo-width': 1.5,
                'text-opacity': opacity ?? 0,
                'text-opacity-transition': {
                  duration: 10,
                  delay: 0,
                },
              },
            } as unknown as React.ComponentProps<typeof Layer>)}
          />
        )}
        {windSourceLayer && (
          <Layer
            {...({
              id: `wms-wind-arrow-layer-${key}-${mvt?.windDirection}`,
              type: 'symbol',
              source: `wms-source-${key}`,
              'source-layer': windSourceLayer,
              beforeId: 'places_region',
              layout: {
                'icon-image': 'mvt-wind-arrow',
                'icon-size': 0.5,
                'icon-rotate': [
                  '+',
                  ['to-number', ['get', windProperty]],
                  mvt?.windDirectionFix ?? 0,
                ],
                'icon-rotation-alignment': 'map',
                'icon-allow-overlap': true,
                'icon-ignore-placement': true,
                visibility: 'visible',
              },
              paint: {
                'icon-opacity': opacity ?? 0,
                'icon-opacity-transition': {
                  duration: 10,
                  delay: 0,
                },
              },
            } as unknown as React.ComponentProps<typeof Layer>)}
          />
        )}
      </VectorSource>
    );
  }

  return library === 'maplibre' ? (
    <RasterSource id={`wms-source-${key}`} tiles={[urlTemplate]} tileSize={512}>
      <Layer
        type="raster"
        id={`wms-layer-${key}`}
        key={`wms-layer-${key}`}
        source={`wms-source-${key}`}
        beforeId="places_region"
        paint={{
          'raster-opacity': opacity ?? 0,
          'raster-opacity-transition': {
            duration: 10,
            delay: 0,
          },
        }}
      />
    </RasterSource>
  ) : (
    <WMSTile
      key={key}
      urlTemplate={urlTemplate}
      tileSize={tileSize ?? 256}
      opacity={opacity ?? 0}
    />
  );
};

export default React.memo(MemoizedWMSTile);
