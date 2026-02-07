import React from 'react';
import { WMSTile } from 'react-native-maps';
import { RasterLayer, RasterSource } from '@maplibre/maplibre-react-native';

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
    <RasterSource id={`wms-source-${index}`} tileUrlTemplates={[urlTemplate]} tileSize={256}>
      <RasterLayer
        id={`wms-layer-${index}`}
        key={`wms-layer-${index}`}
        sourceID={`wms-source-${index}`}
        belowLayerID="places_region"
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          rasterOpacity: opacity ?? 0,
          rasterFadeDuration: 0,
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
