import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, useWindowDimensions } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { CustomTheme } from '@assets/colors';
import AccessibleTouchableOpacity from './AccessibleTouchableOpacity';

import Icon from '@components/common/ScalableIcon';

type CloseButtonProps = {
  onPress: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  testID?: string;
  size?: number;
  maxScaleFactor?: number;
};

const CloseButton: React.FC<CloseButtonProps> = ({
  onPress,
  accessibilityLabel,
  backgroundColor,
  style,
  testID,
  size,
  maxScaleFactor = 2,
}) => {
  const { fontScale } = useWindowDimensions();
  const { colors } = useTheme() as CustomTheme;
  const scaleFactor = Math.min(fontScale, maxScaleFactor);
  const iconSize = scaleFactor * (size ?? 24);
  const borderRadius = iconSize/2;

  return (
    <AccessibleTouchableOpacity
      testID={testID}
      onPress={onPress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}>
      <View
        style={[
          style,
          styles.button,
          {
            backgroundColor: backgroundColor || colors.inputBackground,
            borderRadius,
            width: iconSize,
            height: iconSize,
          },
        ]}>
        <View>
          <Icon
            maxScaleFactor={maxScaleFactor}
            name="close-outline"
            style={{ color: colors.text }}
            size={size ?? 24}
          />
        </View>
      </View>
    </AccessibleTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 28,
    height: 28,
    borderRadius: 20,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CloseButton;
