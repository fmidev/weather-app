import React from 'react';
import { WMSTile } from 'react-native-maps';
import { Layer, RasterSource } from '@maplibre/maplibre-react-native';

type MemoizedWMSTileProps = {
  urlTemplate: string;
  tileSize?: number;
  opacity?: number;
  library?: 'maplibre' | 'react-native-maps';
};

const MemoizedWMSTile: React.FC<MemoizedWMSTileProps> = ({
  urlTemplate,
  tileSize,
  opacity,
  library = 'react-native-maps',
}) => {
  const items = urlTemplate.split('?');
  const key = items.length > 1 ? items[1] : urlTemplate;

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
