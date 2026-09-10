import React from 'react';
import { WMSTile } from 'react-native-maps';
import { Layer, RasterSource } from '@maplibre/maplibre-react-native';

type MemoizedWMSTileProps = {
  tileId: string;
  urlTemplate: string;
  tileSize?: number;
  opacity?: number;
  library?: 'maplibre' | 'react-native-maps';
};

const MemoizedWMSTile: React.FC<MemoizedWMSTileProps> = ({
  tileId,
  urlTemplate,
  tileSize,
  opacity,
  library = 'react-native-maps',
}) => {
  const items = urlTemplate.split('?');
  const key = items.length > 1 ? items[1] : urlTemplate;
  const sourceId = `wms-source-${tileId}`;
  const layerId = `wms-layer-${tileId}`;

  return library === 'maplibre' ? (
    <RasterSource
      id={sourceId}
      tiles={[urlTemplate]}
      tileSize={512}
    >
      <Layer
        type="raster"
        id={layerId}
        key={layerId}
        source={sourceId}
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
