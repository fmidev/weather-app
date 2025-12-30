import React from 'react';
import { WMSTile } from 'react-native-maps';
import { RasterLayer, RasterSource } from '@maplibre/maplibre-react-native';

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
  return library === 'maplibre' ? (
    <RasterSource id="wms-source" tileUrlTemplates={[urlTemplate]} tileSize={256}>
      <RasterLayer
        id="wms-layer"
        sourceID="wms-source"
        style={{
          rasterOpacity: opacity ?? 0,
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
