import React, { forwardRef } from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

import { MAC_CONTENT_SIZE_MULTIPLIER } from '@assets/constants';
import { useIsRunningOnMac } from './MacContentSizeContext';

const DEFAULT_FONT_SIZE = 14;

const AppText = forwardRef<Text, TextProps>(({ children, style, ...rest }, ref) => {
  const isRunningOnMac = useIsRunningOnMac();
  const fontSize = StyleSheet.flatten(style)?.fontSize ?? DEFAULT_FONT_SIZE;
  const macStyle = isRunningOnMac
    ? { fontSize: fontSize * MAC_CONTENT_SIZE_MULTIPLIER }
    : undefined;

  return (
    <Text
      allowFontScaling
      maxFontSizeMultiplier={isRunningOnMac ? 4 : 2}
      ref={ref}
      style={macStyle ? [style, macStyle] : style}
      {...rest}>
      {children}
    </Text>
  );
});

export default AppText;
