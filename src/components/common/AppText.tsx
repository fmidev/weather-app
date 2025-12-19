import React, { forwardRef } from 'react';
import { Text, TextProps } from 'react-native';

const AppText = forwardRef<Text, TextProps>(({ children, ...rest }, ref) => {
  return (
    <Text
      allowFontScaling
      maxFontSizeMultiplier={2}
      ref={ref}
      {...rest}>
      {children}
    </Text>
  );
});

export default AppText;
