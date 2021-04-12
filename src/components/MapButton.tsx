import React from 'react';
import {
  TouchableOpacity,
  StyleProp,
  View,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { BLACK } from '../utils/colors';

type MapButtonProps = {
  onPress: () => void;
  accessibilityLabel: string;
  icon: string;
  iconSize?: number;
  iconColor?: string;
  style: StyleProp<ViewStyle>;
};

const MapButton: React.FC<MapButtonProps> = ({
  onPress,
  accessibilityLabel,
  icon,
  iconSize,
  iconColor,
  style,
}) => (
  <View style={[styles.shadow, style]}>
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button">
      <View style={styles.iconWrapper}>
        <Icon name={icon} size={iconSize} color={iconColor} />
      </View>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  iconWrapper: {
    padding: 12,
  },
  shadow: {
    shadowColor: BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
});

export default MapButton;
