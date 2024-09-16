import React from 'react';
import { WMSTile } from 'react-native-maps';

type MemoizedWMSTileProps = {
  urlTemplate: string;
  tileSize?: number;
  opacity?: number;
};

const MemoizedWMSTile: React.FC<MemoizedWMSTileProps> = ({
  urlTemplate,
  tileSize,
  opacity,
}) => (
  <WMSTile
    key={urlTemplate}
    urlTemplate={urlTemplate}
    tileSize={tileSize ?? 256}
    opacity={opacity ?? 0}
  />
);

export default React.memo(MemoizedWMSTile);
