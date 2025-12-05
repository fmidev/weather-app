import React from 'react';
import { StyleProp, ViewStyle, TextStyle, useWindowDimensions } from 'react-native';
import { IconProps } from 'react-native-vector-icons/Icon';

import Icon from '@assets/Icon';

type CustomIconProps = IconProps & {
  name: string;
  width?: number;
  height?: number;
  size?: number;
  style?: StyleProp<ViewStyle & TextStyle>;
  maxScaleFactor?: number
};

const ScalableIcon: React.FC<CustomIconProps> = (props) => {
  let { maxScaleFactor, width, height, size } = props;
  const { fontScale } = useWindowDimensions();
  const scaleFactor = maxScaleFactor ? Math.min(fontScale, maxScaleFactor) : Math.min(fontScale, 2);

  width = width && scaleFactor * width;
  height = height && scaleFactor * height;
  size = size && scaleFactor * size;

  return <Icon
    { ... props}
    width={width}
    height={height}
    size={size}
  />
}

export default ScalableIcon;
