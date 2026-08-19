import React from 'react';
import { WMSTile } from 'react-native-maps';
import {
  Layer,
  RasterSource,
  VectorSource,
} from '@maplibre/maplibre-react-native';
import type { MapTileFormat } from '@config';
import type { VectorLayerStyle } from '@store/map/types';

type MemoizedWMSTileProps = {
  urlTemplate: string;
  tileSize?: number;
  opacity?: number;
  tileFormat?: MapTileFormat;
  vectorLayers?: VectorLayerStyle[];
  library?: 'maplibre' | 'react-native-maps';
};

const MemoizedWMSTile: React.FC<MemoizedWMSTileProps> = ({
  urlTemplate,
  tileSize,
  opacity,
  tileFormat,
  vectorLayers,
  library = 'react-native-maps',
}) => {
  const items = urlTemplate.split('?');
  const key = items.length > 1 ? items[1] : urlTemplate;

  if (library === 'maplibre' && tileFormat === 'pbf') {
    return (
      <VectorSource id={`wms-source-${key}`} tiles={[urlTemplate]}>
        {vectorLayers?.map(({ id, paint, ...layer }, index) => {
          const opacityProperty = `${layer.type}-opacity`;
          const baseOpacity = paint?.[opacityProperty];
          const layerProps = {
            ...layer,
            id: `wms-layer-${key}-${id ?? index}`,
            source: `wms-source-${key}`,
            beforeId: 'places_region',
            paint: {
              ...paint,
              [opacityProperty]:
                (typeof baseOpacity === 'number' ? baseOpacity : 1) * (opacity ?? 0),
              [`${opacityProperty}-transition`]: {
                duration: 10,
                delay: 0,
              },
            },
          } as React.ComponentProps<typeof Layer>;

          return (
            <Layer
              {...layerProps}
              key={`wms-layer-${key}-${id ?? index}`}
            />
          );
        })}
      </VectorSource>
    );
  }

  return library === 'maplibre' ? (
    <RasterSource
      id={`wms-source-${key}`}
      tiles={[urlTemplate]}
      tileSize={512}
    >
      <Layer
        type="raster"
        id={`wms-layer-${key}`}
        key={`wms-layer-${key}`}
        source={`wms-source-${key}`}
        beforeId="places_region"
        paint={{
          "raster-opacity": opacity ?? 0,
          "raster-opacity-transition": {
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
  )
};

export default React.memo(MemoizedWMSTile);
