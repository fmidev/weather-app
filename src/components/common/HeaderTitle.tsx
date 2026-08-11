import React from 'react';
import { StyleSheet } from 'react-native';

import Text from '@components/common/AppText';
import { PRIMARY_BLUE, WHITE } from '@assets/colors';
import { BOLD_FONT } from '@assets/constants';

type HeaderTitleProps = {
  title: string;
  isDark: boolean;
};

const HeaderTitle: React.FC<HeaderTitleProps> = ({title, isDark}) => (
  <Text
    style={[styles.headerTitle, { color: isDark ? WHITE : PRIMARY_BLUE }]}
    maxFontSizeMultiplier={1.5}
  >
    {title}
  </Text>
);

const styles = StyleSheet.create({
  headerTitle: {
    fontFamily: BOLD_FONT,
    fontSize: 16,
  }
});

export default HeaderTitle;