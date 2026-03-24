import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { PRIMARY_LIGHT, PRIMARY_DARK } from '@assets/colors';

type HeaderTitleProps = {
  title: string;
  isDark: boolean;
};

const HeaderTitle: React.FC<HeaderTitleProps> = ({title, isDark}) => (
  <Text
    style={[styles.headerTitle, { color: isDark ? PRIMARY_DARK : PRIMARY_LIGHT }]}
    maxFontSizeMultiplier={1.5}
  >
    {title}
  </Text>
);

const styles = StyleSheet.create({
  headerTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 16,
  }
});

export default HeaderTitle;