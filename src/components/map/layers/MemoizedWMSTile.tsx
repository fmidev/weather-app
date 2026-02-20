import React from 'react';
import { WMSTile } from 'react-native-maps';
import { Layer, RasterSource } from '@maplibre/maplibre-react-native';

type MemoizedWMSTileProps = {
  urlTemplate: string;
  tileSize?: number;
  opacity?: number;
  library?: 'maplibre' | 'react-native-maps';
  index?: number;
};

const MemoizedWMSTile: React.FC<MemoizedWMSTileProps> = ({
  urlTemplate,
  tileSize,
  opacity,
  library = 'react-native-maps',
  index
}) => {
  return library === 'maplibre' ? (
    <RasterSource id={`wms-source-${index}`} tiles={[urlTemplate]} tileSize={256}>
      <Layer
        type="raster"
        id={`wms-layer-${index}`}
        key={`wms-layer-${index}`}
        source={`wms-source-${index}`}
        beforeId="places_region"
        paint={{
          "raster-opacity": opacity ?? 0,
          "raster-fade-duration": 0,
        }}
        layout={{
          visibility: opacity === 0 ? 'none' : 'visible',
        }}
      />
    </RasterSource>
) : (
    <WMSTile
      key={urlTemplate}
      urlTemplate={urlTemplate}
      tileSize={tileSize ?? 256}
      opacity={opacity ?? 0}
    />
  )
};

export default React.memo(MemoizedWMSTile);
