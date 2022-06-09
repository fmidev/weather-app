import React from 'react';
import { View, StyleSheet } from 'react-native';

import Icon from '@components/common/Icon';

import { RED } from '@utils/colors';

const WarningsIcon: React.FC = () => (
  <View style={styles.container}>
    <Icon name="crisis-strip-icon" height={18} width={18} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: RED,
    paddingBottom: 2,
  },
});

export default WarningsIcon;
