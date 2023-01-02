import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import Icon from './Icon';

const HeaderIcon: React.FC = () => {
  const {
    i18n: { language },
  } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Icon
        name={`provider-logo-${language}`}
        style={{ color: colors.text }}
        height={30}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HeaderIcon;
