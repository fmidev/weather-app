import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { GREEN, ORANGE, RED, YELLOW, WHITE } from '@assets/colors';
import Icon from '@assets/Icon';
import type { Severity, WarningPhysical, WarningType } from '@store/warnings/types';

type WarningIconProps = {
  severity?: number;
  severityDescription?: Severity;
  type: WarningType;
  physical?: WarningPhysical
};

const resolveSeverity = (severity: Severity): number => {
  if (severity === "Moderate") return 1;
  if (severity === "Severe") return 2;
  if (severity === "Extreme") return 3;
}

const WarningIcon: React.FC<WarningIconProps> = (
  { severity, severityDescription, type, physical }
) => {
  if (!severity && !severityDescription) return null;

  const colors = [GREEN, YELLOW, ORANGE, RED];
  const severityValue = severity ?? resolveSeverity(severityDescription!);
  const color = colors[severityValue];

  console.log(type, severity, severityDescription);

  return (
    <View style={[styles.icon, { backgroundColor: color }]}>
      { severityValue > 0 && (
        <Icon name={`fmi-warnings-${type}`} size={30} style={ physical?.windDirection ? {
          transform: [{ rotate: (180 + physical?.windDirection) + 'deg' }]
        } : {}}/>
      )}
      { severityValue > 0 && physical?.windIntensity && (
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
    alignItems: 'center',
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
