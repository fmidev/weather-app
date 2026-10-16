import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
} from 'react-native';

import { useAccessibilityHintLanguage } from '@utils/hooks';

const AccessibleTouchableOpacity: React.FC<TouchableOpacityProps> = (props) => {
  const { style } = props;
  const onLayout = useAccessibilityHintLanguage(
    props.accessibilityHint,
    props.onLayout
  );
  return (
    <TouchableOpacity
      {...props}
      onLayout={onLayout}
      style={[styles.minDimensions, style]}
    />
  );
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
