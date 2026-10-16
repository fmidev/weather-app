import React, { forwardRef } from 'react';
import { View } from 'react-native';
import type { ViewProps } from 'react-native';

import { useAccessibilityHintLanguage } from '@utils/hooks';

const AccessibleView = forwardRef<View, ViewProps>((props, ref) => {
  const onLayout = useAccessibilityHintLanguage(
    props.accessibilityHint,
    props.onLayout
  );
  return <View {...props} ref={ref} onLayout={onLayout} />;
});

AccessibleView.displayName = 'AccessibleView';

export default AccessibleView;
