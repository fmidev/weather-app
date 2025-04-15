import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { GREEN, ORANGE, RED, YELLOW, WHITE } from '@assets/colors';
import Icon from '@assets/Icon';
import type { WarningPhysical, WarningType } from '@store/warnings/types';

type WarningIconProps = {
  severity: number;
  type: WarningType;
  physical?: WarningPhysical
};

const WarningIcon: React.FC<WarningIconProps> = ({ severity, type, physical }) => {
  const colors = [GREEN, YELLOW, ORANGE, RED];
  const color = colors[severity];

  return (
    <View style={[styles.icon, { backgroundColor: color }]}>
      { severity > 0 && (
        <Icon name={`fmi-warnings-${type}`} size={30} style={ physical?.windDirection ? {
          transform: [{ rotate: (180 + physical?.windDirection) + 'deg' }]
        } : {}}/>
      )}
      { severity > 0 && physical?.windIntensity && (
        <Text style={styles.text}>{physical?.windIntensity}</Text>
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
  text: {
    position: 'absolute',
    top: -1,
    left: -1,
    width: 30,
    height: 30,
    textAlign: 'center',
    lineHeight: 30,
    elevation: 5,
    color: WHITE,
    fontSize: 10,
    fontFamily: 'Roboto-Bold',
  },
});

export default WarningIcon;
