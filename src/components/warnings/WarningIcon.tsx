import React from 'react';
import { View, StyleSheet, Text, useWindowDimensions } from 'react-native';

import { GREEN, ORANGE, RED, YELLOW, WHITE } from '@assets/colors';
import Icon from '@components/common/ScalableIcon';
import type { Severity, WarningPhysical, WarningType } from '@store/warnings/types';

type WarningIconProps = {
  severity?: number;
  severityDescription?: Severity;
  type: WarningType;
  physical?: WarningPhysical
  maxScaleFactor?: number;
};

const resolveSeverity = (severity: Severity): number => {
  if (severity === "Moderate") return 1;
  if (severity === "Severe") return 2;
  if (severity === "Extreme") return 3;
  return 0;
}

const showPhysical = (type: WarningType): boolean => {
  return type.toLowerCase().includes('wind');
}

const WarningIcon: React.FC<WarningIconProps> = (
  { severity, severityDescription, type, physical, maxScaleFactor = 2 }
) => {
  const { fontScale } = useWindowDimensions();
  const scaleFactor = Math.min(fontScale, maxScaleFactor);

  if (severity === undefined && !severityDescription) return null;

  const colors = [GREEN, YELLOW, ORANGE, RED];
  const severityValue = severity !== undefined ? severity : resolveSeverity(severityDescription!);
  const color = colors[severityValue];
  const size = scaleFactor * 30;

  return (
    <View style={[styles.icon, {
       backgroundColor: color,
      width: size,
      height: size,
      borderRadius: size/2,
    }]}>
      { severityValue > 0 && (
        <Icon
        name={`fmi-warnings-${type}`}
        size={size}
        style={ physical?.windDirection ? {
          transform: [{ rotate: (180 + physical?.windDirection) + 'deg' }]
        } : {}}/>
      )}
      { severityValue > 0 && physical?.windIntensity && showPhysical(type) && (
        <Text maxFontSizeMultiplier={1.5} style={[styles.text, { width: size }]}>
          {physical?.windIntensity}
        </Text>
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
