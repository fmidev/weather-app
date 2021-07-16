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

import { VERY_LIGHT_BLUE, PRIMARY_BLUE } from '../utils/colors';

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
    width: 28,
    height: 28,
    borderRadius: 20,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: VERY_LIGHT_BLUE,
  },
});

export default IconButton;
