import React from 'react';
import { StyleProp, ViewStyle, TextStyle, useWindowDimensions } from 'react-native';
import { IconProps } from 'react-native-vector-icons/Icon';
import { useSelector } from 'react-redux';

import Icon from '@assets/Icon';
import { MAC_CONTENT_SIZE_MULTIPLIER } from '@assets/constants';
import { selectIsRunningOnMac } from '@store/settings/selectors';

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
  const isRunningOnMac = useSelector(selectIsRunningOnMac);
  const accessibilityScaleFactor = maxScaleFactor
    ? Math.min(fontScale, maxScaleFactor)
    : Math.min(fontScale, 2);
  const scaleFactor = accessibilityScaleFactor *
    (isRunningOnMac ? MAC_CONTENT_SIZE_MULTIPLIER : 1);

  width = width && scaleFactor * width;
  height = height && scaleFactor * height;
  size = size && scaleFactor * size;

  return (
    <Icon
      {...props}
      width={width}
      height={height}
      size={size}
    />
  );
};

export default ScalableIcon;
