import React from 'react';
import {
  StyleProp,
  View,
  ViewStyle,
  StyleSheet,
  ColorValue,
} from 'react-native';

import { LIGHT_BLUE, PRIMARY_BLUE } from '@assets/colors';

import Icon from '../../assets/Icon';
import AccessibleTouchableOpacity from './AccessibleTouchableOpacity';

type ButtonProps = { onPress: () => void; accessibilityLabel: string };

type IconButtonProps = ButtonProps & {
  style?: StyleProp<ViewStyle>;
  icon: string;
  iconSize?: number;
  iconColor?: string;
  backgroundColor: ColorValue;
  circular?: boolean;
  testID?: string;
};

const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  accessibilityLabel,
  style,
  icon,
  iconSize,
  iconColor,
  backgroundColor,
  circular,
  testID,
}) =>
  onPress ? (
    <View
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        circular ? styles.circularButton : styles.button,
        style,
        { backgroundColor: backgroundColor || undefined },
      ]}>
      <AccessibleTouchableOpacity
        testID={testID}
        onPress={onPress}
        hitSlop={ circular ? { top: 6, bottom: 6, left: 6, right: 6 } : undefined}
      >
        <View>
          <Icon
            name={icon}
            width={iconSize || 22}
            height={iconSize || 22}
            style={{ color: iconColor || PRIMARY_BLUE }}
          />
        </View>
      </AccessibleTouchableOpacity>
    </View>
  ) : (
    <View
      style={[
        styles.button,
        style,
        { backgroundColor: backgroundColor || undefined },
      ]}>
      <View>
        <Icon
          name={icon}
          width={iconSize || 22}
          height={iconSize || 22}
          style={{ color: iconColor || PRIMARY_BLUE }}
        />
      </View>
    </View>
  );

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LIGHT_BLUE,
  },
  circularButton: {
    width: 36,
    height: 36,
    borderRadius: 24,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LIGHT_BLUE,
  },
});

export default IconButton;
