import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
} from 'react-native';

const AccessibleTouchableOpacity: React.FC<TouchableOpacityProps> = (props) => {
  const { style } = props;
  return <TouchableOpacity {...props} style={[styles.minDimensions, style]} />;
};
const styles = StyleSheet.create({
  minDimensions: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AccessibleTouchableOpacity;
