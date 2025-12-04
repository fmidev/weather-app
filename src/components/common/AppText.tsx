import React from 'react';
import { Text, TextProps } from 'react-native';

type AppTextProps = TextProps & {
  children?: React.ReactNode;
};

const AppText: React.FC<AppTextProps> = ({ children, ...rest }) => {
  return (
    <Text
      allowFontScaling
      maxFontSizeMultiplier={2}  // tai mitä haluat käyttää
      {...rest}
    >
      {children}
    </Text>
  );
};

export default AppText;
