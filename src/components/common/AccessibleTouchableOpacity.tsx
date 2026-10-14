import React, { forwardRef } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  View,
} from 'react-native';

const AccessibleTouchableOpacity = forwardRef<View, TouchableOpacityProps>(
  (props, ref) => {
    const { style } = props;
    return (
      <TouchableOpacity
        ref={ref}
        {...props}
        style={[styles.minDimensions, style]}
      />
    );
  }
);
const styles = StyleSheet.create({
  minDimensions: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AccessibleTouchableOpacity;
