import React, { forwardRef } from 'react';
import { View } from 'react-native';
import type { ViewInstance, ViewProps } from 'react-native';

import {
  useAccessibilityHintLanguage,
  useAccessibilityLanguage,
} from '@utils/hooks';

const AccessibleView = forwardRef<ViewInstance, ViewProps>((props, ref) => {
  const accessibilityLanguage = useAccessibilityLanguage();
  const onLayout = useAccessibilityHintLanguage(
    props.accessibilityHint,
    props.onLayout
  );
  return (
    <View
      {...props}
      accessibilityLanguage={
        props.accessibilityLanguage ?? accessibilityLanguage
      }
      ref={ref}
      onLayout={onLayout}
    />
  );
});

AccessibleView.displayName = 'AccessibleView';

export default AccessibleView;
