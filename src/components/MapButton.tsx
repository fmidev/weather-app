import React from 'react';
import {
  TouchableOpacity,
  StyleProp,
  View,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@react-navigation/native';

import Icon from './Icon';

import { BLACK, CustomTheme } from '../utils/colors';

type MapButtonProps = {
  onPress: () => void;
  accessibilityLabel: string;
  icon: string;
  iconSize?: number;
  style: StyleProp<ViewStyle>;
};

const MapButton: React.FC<MapButtonProps> = ({
  onPress,
  accessibilityLabel,
  icon,
  iconSize,
  style,
}) => {
  const { colors } = useTheme() as CustomTheme;
  return (
    <View
      style={[
        styles.shadow,
        style,
        { backgroundColor: colors.mapButtonBackground },
      ]}>
      <TouchableOpacity
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button">
        <View style={styles.iconWrapper}>
          <Icon
            name={icon}
            width={iconSize}
            height={iconSize}
            style={{ color: colors.text }}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};
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
