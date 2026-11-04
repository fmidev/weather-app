import React, { forwardRef } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ViewInstance,
  StyleSheet,
} from 'react-native';

import {
  useAccessibilityHintLanguage,
  useAccessibilityLanguage,
} from '@utils/hooks';

const AccessibleTouchableOpacity = forwardRef<ViewInstance, TouchableOpacityProps>((props, ref) => {
  const { style } = props;
  const accessibilityLanguage = useAccessibilityLanguage();
  const onLayout = useAccessibilityHintLanguage(
    props.accessibilityHint,
    props.onLayout
  );
  return (
    <TouchableOpacity
      {...props}
      ref={ref}
      accessibilityLanguage={
        props.accessibilityLanguage ?? accessibilityLanguage
      }
      onLayout={onLayout}
      style={[styles.minDimensions, style]}
    />
  );
});
AccessibleTouchableOpacity.displayName = 'AccessibleTouchableOpacity';
const styles = StyleSheet.create({
  minDimensions: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AccessibleTouchableOpacity;
