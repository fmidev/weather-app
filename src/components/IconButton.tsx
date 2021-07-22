import React from 'react';
import {
  TouchableOpacity,
  StyleProp,
  View,
  ViewStyle,
  StyleSheet,
  ColorValue,
} from 'react-native';

import Icon from './Icon';

import { LIGHT_BLUE, PRIMARY_BLUE } from '../utils/colors';

type ButtonProps =
  | { onPress: () => void; accessibilityLabel: string }
  | { onPress?: never; accessibilityLabel?: never };

type IconButtonProps = ButtonProps & {
  style?: StyleProp<ViewStyle>;
  icon: string;
  iconSize?: number;
  iconColor?: string;
  backgroundColor: ColorValue;
};

const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  accessibilityLabel,
  style,
  icon,
  iconSize,
  iconColor,
  backgroundColor,
}) =>
  onPress ? (
    <View
      style={[
        styles.button,
        style,
        { backgroundColor: backgroundColor || undefined },
      ]}>
      <TouchableOpacity
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}>
        <View>
          <Icon
            name={icon}
            width={iconSize || 22}
            height={iconSize || 22}
            style={{ color: iconColor || PRIMARY_BLUE }}
          />
        </View>
      </TouchableOpacity>
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
});

export default IconButton;
