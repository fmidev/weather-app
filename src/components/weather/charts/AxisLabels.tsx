import React from 'react';
import { Text, useFont } from '@shopify/react-native-skia';

import RobotoRegular from '@assets/fonts/Roboto-Regular.ttf';

export interface ChartLabel {
  x: number;
  y: number;
  label: string;
}

type LabelProps = {
  first: ChartLabel;
  second: ChartLabel;
};

const AxisLabels: React.FC<LabelProps> = ({ first, second }) => {
  const font = useFont(RobotoRegular, 12);

  if (!font) return null;

  return (
    <>
      <Text
        x={first.x}
        y={first.y}
        text={first.label}
        font={font}
        color="black"
      />
      <Text
        x={second.x}
        y={second.y}
        text={second.label}
        font={font}
        color="black"
      />
    </>
  )
}

export default AxisLabels;