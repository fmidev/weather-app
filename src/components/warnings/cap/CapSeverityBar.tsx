import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import {
  CustomTheme,
  CAP_WARNING_NEUTRAL,
  CAP_WARNING_YELLOW,
  CAP_WARNING_ORANGE,
  CAP_WARNING_RED,
} from '@assets/colors';

function CapSeverityBar({ severities }: { severities: number[] }) {
  const { colors } = useTheme() as CustomTheme;
  const severityColors = [
    CAP_WARNING_NEUTRAL,
    CAP_WARNING_YELLOW,
    CAP_WARNING_ORANGE,
    CAP_WARNING_RED,
  ];
  return (
    <View
      style={[
        styles.container,
        {
          borderColor: colors.primaryText,
        },
      ]}>
      {severities.map((severity, index) => (
        <View
          style={[
            styles.bar,
            index !== 3 &&
              severities[index + 1] !== severity &&
              styles.withBorderRight,
            {
              backgroundColor: severityColors[severity],
              borderRightColor: colors.primaryText,
            },
            index === 0 && styles.withBorderLeftRadius,
            index === 3 && styles.withBorderRightRadius,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    marginRight: 2,
    borderRadius: 4,
  },
  bar: {
    height: 7,
    width: 12,
  },
  withBorderRight: {
    borderRightWidth: 1,
  },
  withBorderRightRadius: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  withBorderLeftRadius: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
});

export default CapSeverityBar;
