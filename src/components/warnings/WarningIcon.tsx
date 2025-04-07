import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GREEN, ORANGE, RED, YELLOW } from '@assets/colors';
import Icon from '@assets/Icon';
import type { WarningType } from '@store/warnings/types';

type WarningIconProps = {
  severity: number;
  type: WarningType;
};

const WarningIcon: React.FC<WarningIconProps> = ({ severity, type }) => {
  const colors = [GREEN, YELLOW, ORANGE, RED];
  const color = colors[severity];

  return (
    <View style={[styles.icon, { backgroundColor: color }]}>
      { severity > 0 && (
        <Icon name={`fmi-warnings-${type}`} size={30} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginTop: 8,
  },
});

export default WarningIcon;
