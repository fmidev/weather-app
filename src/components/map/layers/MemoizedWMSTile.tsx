import React from 'react';
import { WMSTile } from 'react-native-maps';

type MemoizedWMSTileProps = {
  urlTemplate: string;
  tileSize?: number;
};

const MemoizedWMSTile: React.FC<MemoizedWMSTileProps> = ({
  urlTemplate,
  tileSize,
}) => (
  <WMSTile
    key={urlTemplate}
    urlTemplate={urlTemplate}
    tileSize={tileSize ?? 512}
  />
);

export default React.memo(MemoizedWMSTile);
